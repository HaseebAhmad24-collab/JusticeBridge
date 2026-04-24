import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader, WebBaseLoader
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# Configuration
FAISS_INDEX = "./faiss_index"
REPO_DIR = "./legal_repository"
API_KEY = os.getenv("GEMINI_API_KEY")

class LegalRAG:
    def __init__(self):
        self.vector_db = None
        self._embeddings_cache = None
        # Silently try to load on init, but don't re-index here
        self._load_index()

    @property
    def embeddings_provider(self):
        if self._embeddings_cache is None:
            self._embeddings_cache = GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-001",
                google_api_key=API_KEY
            )
        return self._embeddings_cache

    def _load_index(self):
        """Internal helper to load FAISS index without printing too much."""
        if os.path.exists(FAISS_INDEX):
            try:
                self.vector_db = FAISS.load_local(
                    FAISS_INDEX, 
                    self.embeddings_provider,
                    allow_dangerous_deserialization=True
                )
                return True
            except Exception:
                return False
        return False

    def init_db(self):
        """Initialize or load the FAISS vector database. (Legacy wrapper)"""
        self._load_index()

    def index_repository(self, force=False):
        """Crawl the legal_repository/ folder and index documents. Skip if index exists unless force=True."""
        if not force and os.path.exists(FAISS_INDEX):
            if self.vector_db is None:
                self._load_index()
                print("RAG: Persistent index found. Skipping re-indexing for speed.")
                return

        if not os.path.exists(REPO_DIR):
            os.makedirs(REPO_DIR)
            os.makedirs(os.path.join(REPO_DIR, "laws"), exist_ok=True)
            os.makedirs(os.path.join(REPO_DIR, "sharia"), exist_ok=True)
            print(f"RAG: Created {REPO_DIR}. Add PDFs or MDs here.")
            return

        print(f"RAG: Indexing documents from {REPO_DIR}...")
        
        md_loader = DirectoryLoader(REPO_DIR, glob="**/*.md", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
        pdf_loader = DirectoryLoader(REPO_DIR, glob="**/*.pdf", loader_cls=PyPDFLoader)
        
        docs = md_loader.load() + pdf_loader.load()
        
        if not docs:
            print("RAG: No documents (MD or PDF) found.")
            return

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
            separators=["\nSection ", "\nArticle ", "\nChapter ", "\n\n", "\n", " "]
        )
        
        split_docs = text_splitter.split_documents(docs)
        
        # Create new FAISS index
        self.vector_db = FAISS.from_documents(split_docs, self.embeddings_provider)
        self.vector_db.save_local(FAISS_INDEX)
        print(f"RAG: Successfully indexed {len(split_docs)} semantic chunks in FAISS.")

    def index_web_urls(self, urls: list):
        """Automated Data Pipeline: Scrape websites and index content into RAG."""
        print(f"RAG: Starting automated pipeline for {len(urls)} URLs...")
        
        loader = WebBaseLoader(urls)
        docs = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200,
            chunk_overlap=200
        )
        
        split_docs = text_splitter.split_documents(docs)
        
        if split_docs:
            if self.vector_db is None:
                self.vector_db = FAISS.from_documents(split_docs, self.embeddings_provider)
            else:
                self.vector_db.add_documents(split_docs)
            
            self.vector_db.save_local(FAISS_INDEX)
            print(f"RAG: Pipeline Success. Indexed {len(split_docs)} web chunks in FAISS.")

    def search(self, query: str, k: int = 2):
        """Perform semantic search and return combined context."""
        if not self.vector_db:
            return ""
        
        results = self.vector_db.similarity_search(query, k=k)
        
        context_parts = []
        for doc in results:
            source = os.path.basename(doc.metadata.get('source', 'Web Resource'))
            context_parts.append(f"Source Document: {source}\n{doc.page_content}")
            
        return "\n\n---\n\n".join(context_parts)

# Singleton instance
rag_engine = LegalRAG()
