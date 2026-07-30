import os
import datetime
import sqlite3
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
import bcrypt
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, create_engine
from knowledge_base import get_legal_context, get_library_document, index_legal_knowledge
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import google.generativeai as genai
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv

load_dotenv()

# Configuration
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "justicebridge_super_secret_key_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
try:
    SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
except ValueError:
    SMTP_PORT = 465

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
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="Legal Enthusiast")
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    google_id = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    conversations = relationship("Conversation", back_populates="owner")
    documents = relationship("DocumentModel", back_populates="owner", cascade="all, delete-orphan")

class DocumentModel(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    summary = Column(Text)
    key_dates = Column(Text) # JSON string representation
    strong_points = Column(Text) # JSON string representation
    weak_points = Column(Text) # JSON string representation
    relevant_sections = Column(Text, nullable=True) # JSON string representation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="documents")

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

def run_migrations():
    db_file = DATABASE_URL.replace("sqlite:///", "")
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(users);")
            columns = [row[1] for row in cursor.fetchall()]
            
            if "google_id" not in columns:
                print("Migration: Adding google_id column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;")
                
            if "auth_provider" not in columns:
                print("Migration: Adding auth_provider column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local';")
                
            if "is_verified" not in columns:
                print("Migration: Adding is_verified column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0;")
                cursor.execute("UPDATE users SET is_verified = 1;")
                
            if "verification_token" not in columns:
                print("Migration: Adding verification_token column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL;")
                
            if "token_expiry" not in columns:
                print("Migration: Adding token_expiry column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN token_expiry DATETIME NULL;")

            if "reset_token" not in columns:
                print("Migration: Adding reset_token column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;")
                
            if "reset_token_expiry" not in columns:
                print("Migration: Adding reset_token_expiry column to users table")
                cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL;")
                
            conn.commit()
            
        # Verify/create documents table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documents';")
        if not cursor.fetchone():
            print("Migration: Creating documents table")
            cursor.execute("""
                CREATE TABLE documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    filename VARCHAR(255),
                    summary TEXT,
                    key_dates TEXT,
                    strong_points TEXT,
                    weak_points TEXT,
                    relevant_sections TEXT NULL,
                    created_at DATETIME,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                );
            """)
            conn.commit()
            
        conn.close()
    except Exception as e:
        print(f"Migration run failed: {e}")

run_migrations()

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

class GoogleLoginRequest(BaseModel):
    id_token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    new_password: str

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
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def send_verification_email(email: str, name: str, token: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not configured, cannot send verification email.")
        return False
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 600;">Verify your JusticeBridge account</h2>
                <p>Hello {name or 'there'},</p>
                <p>Thank you for signing up for JusticeBridge AI. To complete your registration and activate your account, please click the button below:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{FRONTEND_URL}/verify-email?token={token}" style="display: inline-block; padding: 12px 30px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify Email</a>
                </div>
                <p style="font-size: 14px; color: #64748b;">This verification link will expire in 24 hours.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">JusticeBridge AI - Access to Pakistan Legal Knowledge<br/>If you did not request this email, please ignore it.</p>
            </div>
        </body>
        </html>
        """
        
        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Verify your JusticeBridge account"
        msg['From'] = f"JusticeBridge AI <{SMTP_USER}>"
        msg['To'] = email
        
        # Record the MIME type of HTML.
        part = MIMEText(html_content, 'html')
        msg.attach(part)
        
        # Send the message via SMTP server
        if SMTP_PORT == 465:
            # Use SSL
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        else:
            # Use TLS
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email via SMTP: {e}")
        return False

@app.post("/register")
async def register(user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    token = str(uuid.uuid4())
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_verified=False,
        verification_token=token,
        token_expiry=expiry,
        auth_provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email asynchronously in background
    background_tasks.add_task(send_verification_email, new_user.email, new_user.name, token)
    
    return {
        "message": "Verification email sent. Please check your inbox and verify your account.",
        "status": "unverified"
    }

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please register first.")
    
    # Block Google-only accounts from password login
    if not user.hashed_password:
        raise HTTPException(status_code=400, detail="This account uses Google Sign-In. Please login with Google.")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )
        
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

@app.post("/auth/google", response_model=Token)
async def auth_google(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID is not configured on the server.")
        
    try:
        id_info = google_id_token.verify_oauth2_token(
            request.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        
        if id_info.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
            
        email = id_info.get('email')
        name = id_info.get('name')
        google_id = id_info.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google.")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google ID Token: {str(e)}")
        
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        need_commit = False
        if not user.google_id:
            user.google_id = google_id
            need_commit = True
        if not user.auth_provider or user.auth_provider == "local":
            user.auth_provider = "google"
            need_commit = True
        if not user.is_verified:
            user.is_verified = True
            need_commit = True
            
        if need_commit:
            db.commit()
            db.refresh(user)
    else:
        user = User(
            name=name or email.split('@')[0],
            email=email,
            hashed_password=None,
            google_id=google_id,
            auth_provider="google",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
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

@app.post("/auth/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token.")
        
    if user.token_expiry and user.token_expiry < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification link has expired.")
        
    user.is_verified = True
    user.verification_token = None
    user.token_expiry = None
    db.commit()
    return {"message": "Email verified successfully! You can now log in."}

@app.post("/auth/resend-verification")
async def resend_verification(request: ResendVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    if user.is_verified:
        return {"message": "Email is already verified."}
        
    token = str(uuid.uuid4())
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    
    user.verification_token = token
    user.token_expiry = expiry
    db.commit()
    
    background_tasks.add_task(send_verification_email, user.email, user.name, token)
    return {"message": "Verification email resent successfully."}

def send_reset_email(email: str, name: str, token: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not configured, cannot send reset email.")
        return False
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                <p>Hello {name or 'there'},</p>
                <p>We received a request to reset your password for your JusticeBridge account. Click the button below to update your password:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{FRONTEND_URL}/reset-password?token={token}" style="display: inline-block; padding: 12px 30px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #64748b;">This reset link will expire in 1 hour.</p>
                <p style="font-size: 14px; color: #64748b;">If you did not request a password reset, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">JusticeBridge AI - Access to Pakistan Legal Knowledge</p>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Reset your JusticeBridge password"
        msg['From'] = f"JusticeBridge AI <{SMTP_USER}>"
        msg['To'] = email
        
        part = MIMEText(html_content, 'html')
        msg.attach(part)
        
        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send reset email via SMTP: {e}")
        return False

@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    success_response = {"message": "If this email is registered, a password reset link has been sent to it."}
    
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return success_response
    
    # Block Google-only users from password reset
    if not user.hashed_password:
        return success_response  # same generic response to prevent enumeration

    token = str(uuid.uuid4())
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    
    user.reset_token = token
    user.reset_token_expiry = expiry
    db.commit()
    
    send_reset_email(user.email, user.name, token)
    return success_response

@app.post("/auth/reset-password")
async def reset_password(token: str, request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token.")
        
    if user.reset_token_expiry and user.reset_token_expiry < datetime.datetime.utcnow():
        # Clear expired token
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
        
    if len(request.new_password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters.")
    
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password updated successfully! You can now log in with your new password."}

def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        print(f"Failed local PDF text extraction: {e}")
        return ""

@app.post("/documents/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    prompt: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension and size
    ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
    filename = file.filename
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: PDF, JPG, PNG.")
        
    # Read file content and check size limit (10MB)
    MAX_SIZE = 10 * 1024 * 1024 # 10MB
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")
        
    # Save file temporarily to disk (for PyMuPDF parsing if it is a PDF)
    temp_filename = f"temp_{uuid.uuid4()}{ext}"
    with open(temp_filename, "wb") as f:
        f.write(file_bytes)
        
    try:
        extracted_text = ""
        is_text_pdf = False
        
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(temp_filename)
            if extracted_text:
                is_text_pdf = True
                
        # 2. Query RAG cross-reference context if we have text
        rag_context = ""
        if extracted_text:
            try:
                # Search using the first 1000 characters of the document text
                rag_context = rag_engine.search(extracted_text[:1000], k=3)
            except Exception as e:
                print(f"RAG search error during document analysis: {e}")
                
        # 3. Formulate analysis prompt
        base_prompt = (
            "You are a professional legal expert in Pakistan Law. Analyze this document and return a structured JSON response.\n"
            "STRICT REQUIREMENT: You must return ONLY a valid JSON object matching the schema below. "
            "Do not include any explanation, no markdown backticks like ```json ... ```, and no extra text outside the JSON.\n\n"
            "JSON Schema:\n"
            "{\n"
            "  \"summary\": \"A high-quality 2-3 paragraph summary of the document\",\n"
            "  \"key_dates\": [\n"
            "    {\"label\": \"e.g. Hearing Date, Filing Date\", \"date\": \"YYYY-MM-DD or descriptive date\"}\n"
            "  ],\n"
            "  \"strong_points\": [\"Key strength of the case or helpful clause\", ...],\n"
            "  \"weak_points\": [\"Key weakness, risk or warning flag in the document\", ...],\n"
            "  \"relevant_sections\": [\"Relevant section, article or act from Pakistan Laws (e.g. PPC Section 302, Article 19 of Constitution)\", ...]\n"
            "}\n"
        )
        
        if prompt:
            base_prompt += f"\nAdditional User Instructions: {prompt}\n"
            
        # 4. Generate content from Gemini
        model_name = "models/gemini-flash-latest"
        model = genai.GenerativeModel(model_name)
        
        if is_text_pdf:
            # For text-based PDFs: send extracted text and RAG context
            full_prompt = base_prompt
            full_prompt += f"\n\nDOCUMENT CONTENT:\n{extracted_text}\n"
            if rag_context:
                full_prompt += f"\n\nCROSS-REFERENCE LEGAL DATA:\n{rag_context}\n"
            response = model.generate_content(full_prompt)
        else:
            # For images or scanned PDFs: send multimodal parts
            mime_type = "application/pdf" if ext == ".pdf" else f"image/{ext[1:]}"
            if ext == ".jpeg":
                mime_type = "image/jpeg"
                
            contents = [
                base_prompt,
                {"mime_type": mime_type, "data": file_bytes}
            ]
            response = model.generate_content(contents)
            
        # 5. Parse JSON response
        response_text = response.text.strip()
        # Clean markdown code blocks if any
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        import json
        try:
            analysis = json.loads(response_text)
        except Exception as json_err:
            print(f"Failed parsing JSON response: {json_err}. Raw text was: {response_text}")
            # Fallback parsing or retry logic
            raise HTTPException(status_code=500, detail="Gemini did not return a valid JSON format. Please try again.")
            
        # 6. Save document analysis to DB (DocumentModel table)
        doc_model = DocumentModel(
            user_id=current_user.id,
            filename=filename,
            summary=analysis.get("summary", "No summary generated."),
            key_dates=json.dumps(analysis.get("key_dates", [])),
            strong_points=json.dumps(analysis.get("strong_points", [])),
            weak_points=json.dumps(analysis.get("weak_points", [])),
            relevant_sections=json.dumps(analysis.get("relevant_sections", []))
        )
        db.add(doc_model)
        db.flush() # get doc_model.id

        # Generate a clean markdown text representation for search, copy & speech synthesis
        text_rep = (
            f"Document Analysis for '{filename}':\n\n"
            f"### Summary\n{analysis.get('summary', '')}\n\n"
            "### Critical Dates\n" + "\n".join([f"- {d.get('label', 'Date')}: {d.get('date', '')}" for d in analysis.get('key_dates', [])]) + "\n\n"
            "### Case Strong Points\n" + "\n".join([f"- {p}" for p in analysis.get('strong_points', [])]) + "\n\n"
            "### Risks & Weaknesses\n" + "\n".join([f"- {w}" for w in analysis.get('weak_points', [])]) + "\n\n"
            "### Relevant Legal Sections\n" + ", ".join(analysis.get('relevant_sections', []))
        )

        # 7. Save to the messages table if session_id is provided
        if session_id:
            # Get or create conversation session
            conv = db.query(Conversation).filter(Conversation.id == session_id, Conversation.user_id == current_user.id).first()
            if not conv:
                conv = Conversation(id=session_id, user_id=current_user.id, title=title or f"Analysis: {filename}")
                db.add(conv)
                db.commit()

            # Insert user's staged file message
            user_msg = Message(
                conversation_id=session_id,
                role="user",
                content=f"[Uploaded file: {filename}] {prompt if prompt else ''}"
            )
            db.add(user_msg)
            db.flush()

            # Prepare structured analysis JSON string payload
            analysis_payload = {
                "type": "analysis",
                "filename": filename,
                "summary": analysis.get("summary", ""),
                "key_dates": analysis.get("key_dates", []),
                "strong_points": analysis.get("strong_points", []),
                "weak_points": analysis.get("weak_points", []),
                "relevant_sections": analysis.get("relevant_sections", []),
                "text": text_rep
            }
            analysis_content = json.dumps(analysis_payload)

            # Insert AI analysis response message
            ai_msg = Message(
                conversation_id=session_id,
                role="model",
                content=analysis_content
            )
            db.add(ai_msg)
            
        db.commit()
        db.refresh(doc_model)
        
        return {
            "id": doc_model.id,
            "filename": doc_model.filename,
            "summary": doc_model.summary,
            "key_dates": analysis.get("key_dates", []),
            "strong_points": analysis.get("strong_points", []),
            "weak_points": analysis.get("weak_points", []),
            "relevant_sections": analysis.get("relevant_sections", []),
            "text": text_rep,
            "created_at": doc_model.created_at.isoformat()
        }
        
    except Exception as e:
        print(f"Error during document analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except Exception as cleanup_err:
                print(f"Failed to delete temp file {temp_filename}: {cleanup_err}")

@app.get("/documents/history")
async def get_documents_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(DocumentModel).filter(DocumentModel.user_id == current_user.id).order_by(DocumentModel.created_at.desc()).all()
    import json
    history = []
    for d in docs:
        try:
            key_dates = json.loads(d.key_dates)
        except:
            key_dates = []
        try:
            strong_points = json.loads(d.strong_points)
        except:
            strong_points = []
        try:
            weak_points = json.loads(d.weak_points)
        except:
            weak_points = []
        try:
            relevant_sections = json.loads(d.relevant_sections) if d.relevant_sections else []
        except:
            relevant_sections = []
            
        history.append({
            "id": d.id,
            "filename": d.filename,
            "summary": d.summary,
            "key_dates": key_dates,
            "strong_points": strong_points,
            "weak_points": weak_points,
            "relevant_sections": relevant_sections,
            "created_at": d.created_at.isoformat()
        })
    return history

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

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

@app.patch("/users/me")
async def update_users_me(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = False
    if request.name is not None:
        name = request.name.strip()
        if not name:
            raise HTTPException(status_code=422, detail="Name cannot be empty.")
        current_user.name = name
        updated = True
    if request.role is not None:
        valid_roles = ["Legal Researcher", "Law Student", "Litigant", "Legal Enthusiast"]
        if request.role not in valid_roles:
            raise HTTPException(status_code=422, detail="Invalid role selected.")
        current_user.role = request.role
        updated = True

    if updated:
        db.commit()
        db.refresh(current_user)

    return {
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "joined": current_user.joined_at.strftime("%b %Y")
    }

@app.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.timestamp.desc()).all()
    import json
    result = []
    for c in convs:
        msgs = []
        for m in c.messages:
            msg_type = "user" if m.role == "user" else "ai"
            text_content = m.content
            analysis_data = {}
            if m.content and m.content.startswith('{"type": "analysis"'):
                try:
                    parsed = json.loads(m.content)
                    msg_type = "analysis"
                    text_content = parsed.get("text", "")
                    analysis_data = {
                        "summary": parsed.get("summary", ""),
                        "key_dates": parsed.get("key_dates", []),
                        "strong_points": parsed.get("strong_points", []),
                        "weak_points": parsed.get("weak_points", []),
                        "relevant_sections": parsed.get("relevant_sections", []),
                        "filename": parsed.get("filename", "")
                    }
                except Exception as parse_err:
                    print(f"Error parsing conversation msg json: {parse_err}")
            
            msg_obj = {
                "id": m.id,
                "type": msg_type,
                "text": text_content,
                "time": m.timestamp.strftime("%H:%M")
            }
            if msg_type == "analysis":
                msg_obj.update(analysis_data)
                
            msgs.append(msg_obj)
            
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
    import json
    gemini_history = []
    # Truncate history to last 10 messages to prevent token bloat and slowness
    recent_history = history_msgs[-11:-1] if len(history_msgs) > 1 else []
    for m in recent_history:
        content = m.content
        if m.content and m.content.startswith('{"type": "analysis"'):
            try:
                parsed = json.loads(m.content)
                content = parsed.get("text", "")
            except:
                pass
        gemini_history.append({"role": "user" if m.role == "user" else "model", "parts": [content]})

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





