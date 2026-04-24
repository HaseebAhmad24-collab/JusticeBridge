import os
import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
import bcrypt
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, create_engine
from knowledge_base import get_legal_context, get_library_document, index_legal_knowledge
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configuration
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "justicebridge_super_secret_key_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

# Database Setup
DATABASE_URL = "sqlite:///./justicebridge.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="Legal Enthusiast")
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    conversations = relationship("Conversation", back_populates="owner")

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, index=True) # session_123...
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    owner = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    role = Column(String) # user or model
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    conversation = relationship("Conversation", back_populates="messages")

Base.metadata.create_all(bind=engine)

# Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Legal Enthusiast"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ChatMessageSchema(BaseModel):
    role: str
    parts: str

class ChatRequest(BaseModel):
    query: str
    session_id: str
    title: Optional[str] = None

app = FastAPI(title="JusticeBridge API")

@app.on_event("startup")
async def startup_event():
    """Build the vector index on startup."""
    index_legal_knowledge()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "joined": new_user.joined_at.strftime("%b %Y")
        }
    }

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please register first.")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "joined": user.joined_at.strftime("%b %Y")
        }
    }

@app.get("/legal-library/{topic_key}")
async def get_legal_library(topic_key: str):
    doc = get_library_document(topic_key)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "joined": current_user.joined_at.strftime("%b %Y")
    }

@app.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.timestamp.desc()).all()
    result = []
    for c in convs:
        msgs = [{"id": m.id, "type": "user" if m.role == "user" else "ai", "text": m.content, "time": m.timestamp.strftime("%H:%M")} for m in c.messages]
        result.append({
            "id": c.id,
            "title": c.title,
            "messages": msgs,
            "timestamp": int(c.timestamp.timestamp() * 1000)
        })
    return result

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not GENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured.")
    
    # 1. Get or create conversation
    conv = db.query(Conversation).filter(Conversation.id == request.session_id, Conversation.user_id == current_user.id).first()
    if not conv:
        conv = Conversation(id=request.session_id, user_id=current_user.id, title=request.title or "New Chat")
        db.add(conv)
        db.commit()

    # 2. Add user message
    user_msg = Message(conversation_id=conv.id, role="user", content=request.query)
    db.add(user_msg)
    db.flush() # Populate user_msg.id
    
    # 3. Get history for Gemini
    history_msgs = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.timestamp.asc()).all()
    gemini_history = []
    # Truncate history to last 10 messages to prevent token bloat and slowness
    recent_history = history_msgs[-11:-1] if len(history_msgs) > 1 else []
    for m in recent_history:
        gemini_history.append({"role": "user" if m.role == "user" else "model", "parts": [m.content]})

    try:
        # Use flash model first for speed and higher quotas
        model_name = "models/gemini-flash-latest"
        
        legal_context = get_legal_context(request.query)
        
        system_prompt = (
            "You are JusticeBridge AI, a professional legal assistant for Pakistan Law. "
            "Expertise: PPC 1860, Constitution of Pakistan, CrPC, CPC, QSO, Tax, and Cyber laws. "
            "STRICT RULES: "
            "1. FOCUS: Answer only the LATEST query. Be extremely direct and concise. "
            "2. Match the user's language (Roman Urdu or English). "
            "3. DISCLAIMER: End with: 'Disclaimer: Seek qualified legal advice for specific matters.'"
        )

        if legal_context:
            system_prompt += (
                "\n\nGROUND TRUTH REFERENCE CONTEXT:\n"
                f"{legal_context}\n"
                "IMPORTANT: Prioritize the data in the REFERENCE CONTEXT above for factual accuracy. "
                "Do not mention that you were provided with this context; just use it to give a high-accuracy answer."
            )

        # Pass system_instruction to the constructor
        model = genai.GenerativeModel(model_name, system_instruction=system_prompt)
        
        # Debug logging
        print(f"Session: {conv.id}, History Count: {len(gemini_history)}")
        
        chat = model.start_chat(history=gemini_history)
        
        final_query = request.query
        # No need to prepend system prompt manually if using system_instruction

        # Retry loop for rate limits
        import asyncio
        from google.api_core import exceptions
        
        max_retries = 3
        retry_delay = 2
        response = None
        
        for attempt in range(max_retries):
            try:
                response = chat.send_message(final_query)
                break
            except exceptions.ResourceExhausted:
                if attempt == max_retries - 1:
                    # Fallback to pro model if flash is exhausted
                    try:
                         print("Flash quota exceeded, falling back to Pro...")
                         fallback_model = genai.GenerativeModel("models/gemini-pro-latest")
                         fallback_chat = fallback_model.start_chat(history=gemini_history)
                         response = fallback_chat.send_message(final_query)
                         break
                    except Exception as fallback_error:
                        raise HTTPException(status_code=429, detail="AI service busy. Please try again in 30 seconds.")
                
                await asyncio.sleep(retry_delay)
                retry_delay *= 2
            except Exception as e:
                raise e

        ai_text = response.text if response and hasattr(response, 'text') else "I apologize, I am currently experiencing high traffic. Please try again."
        
        # 4. Save AI response
        ai_msg = Message(conversation_id=conv.id, role="model", content=ai_text)
        db.add(ai_msg)
        
        # 5. Update title if needed
        if conv.title == "New Chat" or conv.title == "Initial Legal Consultation":
             title_candidate = request.query[:30] + ("..." if len(request.query) > 30 else "")
             conv.title = title_candidate
        
        db.commit()
        return {
            "response": ai_text, 
            "title": conv.title,
            "user_message_id": user_msg.id,
            "ai_message_id": ai_msg.id
        }
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversations/{session_id}")
async def delete_conversation(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == session_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Deleted successfully"}

@app.delete("/messages/{message_id}")
async def delete_message(message_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Joining with Conversation to ensure the user owns the message
    msg = db.query(Message).join(Conversation).filter(
        Message.id == message_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found or unauthorized")
    
    db.delete(msg)
    db.commit()
    return {"message": "Message deleted successfully"}

# Edge TTS Integration
import edge_tts
import uuid
import os
import asyncio
from fastapi import BackgroundTasks
from fastapi.responses import FileResponse

class TTSRequest(BaseModel):
    text: str

def remove_file(path: str):
    try:
        os.remove(path)
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

@app.post("/tts")
async def text_to_speech(request: TTSRequest, background_tasks: BackgroundTasks):
    try:
        if not request.text:
            raise HTTPException(status_code=400, detail="Text is required")
            
        # Using "ur-PK-AsadNeural" for a more authoritative, lawyer-like male voice
        VOICE = "ur-PK-AsadNeural" 
        
        output_file = f"tts_{uuid.uuid4()}.mp3"
        communicate = edge_tts.Communicate(request.text, VOICE)
        
        await communicate.save(output_file)
        
        background_tasks.add_task(remove_file, output_file)
        
        return FileResponse(output_file, media_type="audio/mpeg", filename="speech.mp3")

    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))





