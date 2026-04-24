import sys
import os
from rag_system import rag_engine

# List of official/reliable legal resources for law students
LEGAL_SOURCES = [
    "https://en.wikipedia.org/wiki/Law_of_Pakistan",
    "https://en.wikipedia.org/wiki/Constitution_of_Pakistan",
    "https://en.wikipedia.org/wiki/Pakistan_Penal_Code",
    # Add more official URLs as needed
]

def run_automated_pipeline():
    """
    Automated Legal Data Pipeline
    -----------------------------
    1. Fetches data from top legal websites.
    2. Processes content for legal accuracy.
    3. Ingests directly into the JusticeBridge Vector DB.
    """
    print("--- Starting JusticeBridge Automated Ingestion Pipeline ---")
    
    try:
        # Trigger the RAG engine's web indexing capability
        rag_engine.index_web_urls(LEGAL_SOURCES)
        
        print("\nPipeline Complete!")
        print("Success: Latest legal research data is now inside the Vector Database.")
        print("JusticeBridge accuracy has been further enhanced with real-world web data.")
        
    except Exception as e:
        print(f"Pipeline Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_automated_pipeline()
