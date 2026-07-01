import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MessageSquare,
  Scale,
  BookOpen,
  Users,
  Menu,
  X,
  Send,
  Gavel,
  ShieldCheck,
  User,
  LogOut,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  Edit2,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layout,
  Book,
  FileText,
  Hash,
  Heart,
  XCircle,
  UserPlus,
  Coins,
  Home as HomeIcon,
  Download,
  Eye,
  EyeOff,
  Lock,
  Paperclip,
  Calendar,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

import Profile from './Profile';
import Home from './Home';
import Auth from './Auth';
import toast, { Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import './Markdown.css';



// Import Google Fonts (Directly in JS for simplicity in this environment)
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const ChatInput = ({ onSend, loading, activeSessionId }) => {
  const [input, setInput] = useState(() => localStorage.getItem(`draft_${activeSessionId}`) || '');
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const recognitionRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  // Sync with localStorage on change
  useEffect(() => {
    localStorage.setItem(`draft_${activeSessionId}`, input);
  }, [input, activeSessionId]);

  // Load draft when session changes
  useEffect(() => {
    const saved = localStorage.getItem(`draft_${activeSessionId}`);
    setInput(saved || '');
  }, [activeSessionId]);

  // Sync preview
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening... Speak now");
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        setInput(prev => {
          const cleanPrev = prev.trim();
          if (cleanPrev.endsWith(transcript.trim())) return prev;
          return cleanPrev ? `${cleanPrev} ${transcript}` : transcript;
        });
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Error hearing voice.");
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selected.type)) {
      toast.error("Only PDF, JPG, and PNG files are supported.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit.");
      return;
    }
    setFile(selected);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = () => {
    if (loading) return;
    if (!input.trim() && !file) return;
    onSend(input, null, file);
    setInput('');
    setFile(null);
    localStorage.removeItem(`draft_${activeSessionId}`);
  };

  return (
    <div className="chat-input-area" style={{ display: 'flex', flexDirection: 'column' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
      />
      {file && (
        <div className="file-preview-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '8px 12px',
          marginBottom: '10px',
          position: 'relative'
        }}>
          {preview ? (
            <img src={preview} alt="Upload preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
          ) : (
            <div style={{ background: 'var(--legal-blue)', color: '#fff', width: '40px', height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
          )}
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="input-wrapper">
        <textarea
          placeholder="Ask about law or drop a case file..."
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={loading}
        ></textarea>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="mic-btn"
          onClick={triggerFileSelect}
          title="Upload PDF or Image"
          disabled={loading}
          style={{ marginRight: '5px' }}
        >
          <Paperclip size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          title="Speak (Roman Urdu/English)"
          disabled={loading}
        >
          {isListening ? <MicOff size={20} className="animate-pulse text-red-500" /> : <Mic size={20} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="send-btn"
          onClick={handleSubmit}
          disabled={(!input.trim() && !file) || loading}
        >
          {loading ? <Clock size={20} className="animate-spin" /> : <Send size={20} />}
        </motion.button>
      </div>
    </div>
  );
};

const LegalLibrary = ({ topicKey }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/legal-library/${topicKey}`);
        if (response.ok) {
          const data = await response.json();
          setDoc(data);
        }
      } catch (error) {
        console.error("Failed to fetch library document:", error);
      } finally {
        setLoading(false);
      }
    };
    if (topicKey) fetchDoc();
  }, [topicKey]);

  if (loading) return <div className="library-loading">Loading professional document...</div>;
  if (!doc) return <div className="library-error">Document not found.</div>;

  return (
    <motion.div
      className="legal-library-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="document-container">
        <div className="document-header">
          <h1>{doc.title}</h1>
          <p className="document-meta">{doc.description}</p>
        </div>
        <div className="document-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc.full_document_en}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

const VerifyEmailView = ({ token, onBackToLogin }) => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/verify-email?token=${token}`, {
          method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed. The link may have expired or is invalid.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Could not connect to verification server.');
      }
    };
    if (token) verify();
  }, [token]);

  return (
    <div className="auth-card glass-card" style={{ maxWidth: '450px', padding: '40px', textAlign: 'center', margin: '0 auto' }}>
      <div className="auth-logo" style={{ color: 'var(--legal-blue)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <Scale size={48} />
      </div>
      {status === 'verifying' && (
        <>
          <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px' }}>Verifying email...</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>Please wait while we confirm your activation code.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h2 style={{ color: 'var(--legal-blue)', fontSize: '22px', marginBottom: '15px' }}>Account Activated!</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '25px' }}>{message}</p>
          <button className="auth-submit-btn" onClick={onBackToLogin}>
            Login Now
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 style={{ color: '#f87171', fontSize: '22px', marginBottom: '15px' }}>Activation Failed</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '25px' }}>{message}</p>
          <button className="auth-submit-btn" onClick={onBackToLogin}>
            Back to Home
          </button>
        </>
      )}
    </div>
  );
};

const ResetPasswordView = ({ token, onBackToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('form'); // 'form' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setStatus('error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/reset-password?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Password updated successfully!');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to reset password.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect to the server. Please try again.');
    }
  };

  return (
    <div className="auth-card glass-card" style={{ maxWidth: '450px', padding: '40px', textAlign: 'center', margin: '0 auto' }}>
      <div className="auth-logo" style={{ color: 'var(--legal-blue)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <Scale size={48} />
      </div>
      {status === 'success' ? (
        <>
          <h2 style={{ color: 'var(--legal-blue)', fontSize: '22px', marginBottom: '15px' }}>Password Updated!</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '25px' }}>{message}</p>
          <button className="auth-submit-btn" onClick={onBackToLogin}>Login Now</button>
        </>
      ) : (
        <>
          <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '8px' }}>Reset Your Password</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '22px', lineHeight: '1.6' }}>Enter a new password for your account.</p>
          {status === 'error' && (
            <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '15px', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '6px' }}>{message}</p>
          )}
          <form className="auth-form" onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="input-group password-group" style={{ marginBottom: '14px' }}>
              <Lock className="input-icon" size={18} />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="input-group password-group">
              <Lock className="input-icon" size={18} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (status === 'error') setStatus('form'); }}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={status === 'loading'}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{ marginTop: '20px', width: '100%' }}
            >
              {status === 'loading' ? 'Updating...' : 'Set New Password'}
            </motion.button>
          </form>
          <p style={{ marginTop: '18px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
            Remembered it?{' '}
            <span onClick={onBackToLogin} style={{ color: 'var(--legal-blue)', cursor: 'pointer' }}>Back to Login</span>
          </p>
        </>
      )}
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // 1. Detect if running standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIpad = userAgent.includes('ipad') || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && userAgent.includes('macintosh'));
    const isIPhone = userAgent.includes('iphone') || userAgent.includes('ipod');
    const isIOSDevice = isIpad || isIPhone;
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('android');
    const isIOSReady = isIOSDevice && isSafari && !isStandalone;

    setIsIOS(isIOSReady);

    if (isIOSReady) {
      setShowInstallBtn(true);
    }

    // 3. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowInstallBtn(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install user outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'landing');
  const [showAuth, setShowAuth] = useState(false);
  const [verifyToken, setVerifyToken] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const path = window.location.pathname;

    if (tokenParam && path.includes('/reset-password')) {
      setResetToken(tokenParam);
      setActiveView('reset-password');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (tokenParam && (path.includes('/verify-email') || path === '/')) {
      setVerifyToken(tokenParam);
      setActiveView('verify-email');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [insightsOpen, setInsightsOpen] = useState(() => {
    const saved = localStorage.getItem('insightsOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [expandedSections, setExpandedSections] = useState({
    recent: true,
    laws: false,
    religious: false
  });

  const [libraryTopic, setLibraryTopic] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [conversations, setConversations] = useState([]);

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('activeSessionId');
    return saved || null;
  });

  // Fetch conversations from backend
  const fetchConversations = async (userToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/conversations`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        return data; // Return data for chaining
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
    return [];
  };

  // Initial load for refresh case
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && isLoggedIn && conversations.length === 0) {
      fetchConversations(storedToken);
    }
  }, []); // Only on mount

  // Get current session messages
  const activeSession = conversations.find(s => s.id === activeSessionId) || conversations[0];
  const messages = activeSession?.messages || [];

  const setMessages = (updateFn, sessionId = activeSessionId) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === sessionId) {
        const newMessages = typeof updateFn === 'function' ? updateFn(conv.messages) : updateFn;
        return { ...conv, messages: newMessages };
      }
      return conv;
    }));
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('token', token || '');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('activeView', activeView);
    localStorage.setItem('insightsOpen', JSON.stringify(insightsOpen));
    localStorage.setItem('activeSessionId', activeSessionId || '');
  }, [isLoggedIn, token, currentUser, activeView, insightsOpen, activeSessionId]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleStartChat = () => {
    if (isLoggedIn) {
      setActiveView('chat');
    } else {
      setShowAuth(true);
    }
  };

  const handleSend = async (text = null, editId = null, file = null) => {
    const isEdit = editId !== null;
    const textToSend = text;

    if (file) {
      // 1. Create a staged user message showing the uploaded file
      const tempUserMsgId = Date.now();
      const userMessage = {
        id: tempUserMsgId,
        type: 'user',
        text: textToSend ? `[Uploaded file: ${file.name}]\n\n${textToSend}` : `[Uploaded file: ${file.name}]`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        setActiveSessionId(currentSessionId);
        const newConv = {
          id: currentSessionId,
          title: 'File Analysis: ' + file.name,
          messages: [],
          timestamp: Date.now()
        };
        setConversations(prev => [newConv, ...prev]);
      }
      
      setMessages(prev => [...prev, userMessage], currentSessionId);
      setLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (textToSend) {
          formData.append('prompt', textToSend);
        }
        if (currentSessionId) {
          formData.append('session_id', currentSessionId);
        }
        formData.append('title', 'Analysis: ' + file.name);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/documents/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
          throw new Error(errorData.detail || 'Failed to analyze document.');
        }
        
        const data = await response.json();
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'analysis',
          summary: data.summary,
          key_dates: data.key_dates,
          strong_points: data.strong_points,
          weak_points: data.weak_points,
          relevant_sections: data.relevant_sections,
          filename: data.filename,
          text: data.text || '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsgId);
          const syncedUserMsg = { ...userMessage, id: data.user_message_id || tempUserMsgId };
          return [...filtered, syncedUserMsg, aiMessage];
        }, currentSessionId);
        
        // Update session title to file name
        setConversations(prev => prev.map(c => c.id === currentSessionId ? { ...c, title: 'Analysis: ' + file.name } : c));
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error) || 'Analysis failed';
        toast.error(errorMsg);
        console.error('File Analysis Error:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!textToSend || !textToSend.trim() || loading) return;

    if (isEdit) {
      // 1. Update the message locally and mark as edited
      setMessages(prev => prev.map(m => m.id === editId ? {
        ...m,
        text: textToSend,
        edited: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : m), activeSessionId);
      setEditingId(null);
      setEditingText('');

      // 2. Remove subsequent AI response if it exists (to prevent confusion)
      const msgIndex = messages.findIndex(m => m.id === editId);
      if (msgIndex !== -1 && messages[msgIndex + 1]?.type === 'ai') {
        const aiMsgId = messages[msgIndex + 1].id;
        setMessages(prev => prev.filter(m => m.id !== aiMsgId), activeSessionId);
      }
    } else {
      const tempUserMsgId = Date.now();
      const userMessage = {
        id: tempUserMsgId,
        type: 'user',
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Get/Create session ID first to ensure we use the same one
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        setActiveSessionId(currentSessionId);

        const newConv = {
          id: currentSessionId,
          title: 'New Chat',
          messages: [],
          timestamp: Date.now()
        };
        setConversations(prev => [newConv, ...prev]);
      }

      setMessages(prev => [...prev, userMessage], currentSessionId);

      var activeTempId = tempUserMsgId;
      var activeUserMsg = userMessage;
      var targetSessionId = currentSessionId;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: textToSend,
          session_id: targetSessionId,
          title: activeSession?.title
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Backend Server Error' }));
        throw new Error(errorData.detail || 'API server down. Please run: uvicorn main:app --reload');
      }

      const data = await response.json();

      const aiMessage = {
        id: data.ai_message_id || Date.now() + 1,
        type: 'ai',
        text: data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Sync IDs: Replace temp user message with real ID and add AI message
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== activeTempId);
        const syncedUserMsg = { ...activeUserMsg, id: data.user_message_id || activeTempId };
        return [...filtered, syncedUserMsg, aiMessage];
      }, targetSessionId);

      // Update title if backend changed it
      if (data.title && data.title !== activeSession?.title) {
        setConversations(prev => prev.map(c => c.id === targetSessionId ? { ...c, title: data.title } : c));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error) || 'Connection failed';
      toast.error(errorMsg);
      console.error('Chat Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarQuery = (query) => {
    setActiveView('chat');
    if (window.innerWidth <= 768) setSidebarOpen(false);
    handleSend(query);
  };

  const handleTopicClick = (topic) => {
    setLibraryTopic(topic);
    setActiveView('library');
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDelete = async (id) => {
    // If it's a temporary ID (timestamp > 10^12), just remove from UI
    if (typeof id === 'number' && id > 1000000000000) {
      setMessages(prev => prev.filter(m => m.id !== id));
      return;
    }

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        toast.success('Message deleted permanently');
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete from server.");
      // Fallback: still remove locally to keep UI responsive
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const [speakingId, setSpeakingId] = useState(null);

  const handleSpeak = (text, id) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);

    // Select a natural sounding voice
    const voices = window.speechSynthesis.getVoices();
    // Prefer Google US English or Microsoft Natural voices
    const naturalVoice = voices.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Natural') ||
      v.name.includes('Zira')
    );

    if (naturalVoice) utterance.voice = naturalVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => {
      setSpeakingId(null);
      toast.error("Speech playback error");
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const createNewChat = () => {
    const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newSession = {
      id: newId,
      title: 'New Chat',
      messages: [
        {
          id: Date.now(),
          type: 'system',
          text: 'Welcome! I am JusticeBridge AI assistant. I can help you with Pakistani Laws and Religious Jurisprudence.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      timestamp: Date.now()
    };
    setConversations(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveView('chat');
    setSidebarOpen(false);
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const remaining = conversations.filter(s => s.id !== id);
        setConversations(remaining);
        if (activeSessionId === id) {
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        }
        toast.success("Chat session deleted.");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete session.");
    }
  };

  const handleLoginSuccess = async (userData, userToken) => {
    // 1. Set auth state
    setCurrentUser(userData);
    setToken(userToken);
    setIsLoggedIn(true);
    setShowAuth(false);
    
    // 2. Fetch history
    const history = await fetchConversations(userToken);
    
    // 3. Create New Chat Session
    const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newSession = {
      id: newId,
      title: 'New Chat',
      messages: [
        {
          id: Date.now(),
          type: 'system',
          text: 'Welcome! I am JusticeBridge AI assistant. I can help you with Pakistani Laws and Religious Jurisprudence.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      timestamp: Date.now()
    };

    // 5. Atomic Update: Combine history and new session
    const updatedConversations = [newSession, ...history];
    setConversations(updatedConversations);
    setActiveSessionId(newId);
    setActiveView('chat');
    
    // 6. Force persistence update
    localStorage.setItem('activeSessionId', newId);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setConversations([]);
    setActiveSessionId(null);
    setActiveView('landing');
    setSidebarOpen(false);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    toast.success("Logged out successfully");
  };



  if (activeView === 'reset-password') {
    return (
      <div className="auth-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <ResetPasswordView
          token={resetToken}
          onBackToLogin={() => {
            setActiveView('landing');
            setShowAuth(true);
          }}
        />
      </div>
    );
  }

  if (activeView === 'verify-email') {
    return (
      <div className="auth-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <VerifyEmailView
          token={verifyToken}
          onBackToLogin={() => {
            setActiveView('landing');
            setShowAuth(true);
          }}
        />
      </div>
    );
  }

  // If we are on landing page, show it without the app shell
  if (activeView === 'landing' && !showAuth) {
    return (
      <>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <Home
          onStartChat={handleStartChat}
          onLogin={() => setShowAuth(true)}
          onTopicClick={handleTopicClick}
          showInstallBtn={showInstallBtn}
          onInstall={handleInstallClick}
        />
        {showAuth && (
          <Auth
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setShowAuth(false)}
          />
        )}
        {showIOSTip && (
          <div className="ios-prompt-overlay" onClick={() => setShowIOSTip(false)}>
            <div className="ios-prompt-card glass-card" onClick={(e) => e.stopPropagation()}>
              <button className="close-ios-prompt" onClick={() => setShowIOSTip(false)}>
                <X size={20} />
              </button>
              <div className="ios-prompt-header">
                <Scale size={40} className="ios-prompt-logo" />
                <h3>Install JusticeBridge AI</h3>
                <p>Add JusticeBridge to your home screen for quick, offline-capable access like a native app.</p>
              </div>
              <div className="ios-prompt-steps">
                <div className="ios-step">
                  <span className="step-num">1</span>
                  <span className="step-text">Tap the <strong>Share</strong> button at the bottom of Safari (<span className="ios-share-icon">⎙</span> or similar).</span>
                </div>
                <div className="ios-step">
                  <span className="step-num">2</span>
                  <span className="step-text">Scroll down the menu and select <strong>Add to Home Screen</strong> (<span className="ios-add-icon">+</span>).</span>
                </div>
                <div className="ios-step">
                  <span className="step-num">3</span>
                  <span className="step-text">Tap <strong>Add</strong> in the top-right corner to complete installation.</span>
                </div>
              </div>
              <button className="ios-prompt-btn" onClick={() => setShowIOSTip(false)}>Got It</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-layout">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      {showAuth && (

        <Auth
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setShowAuth(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>JusticeBridge</h2>
        </div>

        <nav className="sidebar-nav">
          {[
            { view: 'landing', icon: <HomeIcon size={20} />, label: 'Home' },
            { view: 'chat', icon: <MessageSquare size={20} />, label: 'Legal Chat' },
            { view: 'profile', icon: <User size={20} />, label: 'Profile' },
          ].map(({ view, icon, label }) => (
            <motion.div
              key={view}
              className={`nav-item ${activeView === view ? 'active' : ''}`}
              onClick={() => { setActiveView(view); setSidebarOpen(false); }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {icon}
              <span>{label}</span>
            </motion.div>
          ))}

          {/* Recent Chats */}
          <div className="nav-section">
            <motion.div
              className="nav-section-header"
              onClick={() => toggleSection('recent')}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <span>Recent Chats</span>
              <motion.span
                animate={{ rotate: expandedSections.recent ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={14} />
              </motion.span>
            </motion.div>
            <AnimatePresence initial={false}>
              {expandedSections.recent && (
                <motion.div
                  className="nav-section-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <motion.div
                    className="nav-item new-chat-btn"
                    onClick={createNewChat}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>+ New Chat</span>
                  </motion.div>
                  <div className="sessions-list">
                    {conversations.map(conv => (
                      <motion.div
                        key={conv.id}
                        className={`session-item ${activeSessionId === conv.id ? 'active' : ''}`}
                        onClick={() => { setActiveSessionId(conv.id); setActiveView('chat'); setSidebarOpen(false); }}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <span className="session-title">{conv.title}</span>
                        <button className="session-delete" onClick={(e) => deleteSession(e, conv.id)}>
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Laws of Pakistan */}
          <div className="nav-section">
            <motion.div
              className="nav-section-header"
              onClick={() => toggleSection('laws')}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <span>Laws of Pakistan</span>
              <motion.span
                animate={{ rotate: expandedSections.laws ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={14} />
              </motion.span>
            </motion.div>
            <AnimatePresence initial={false}>
              {expandedSections.laws && (
                <motion.div
                  className="nav-section-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  {[
                    { key: 'ppc', icon: <Scale size={18} />, label: 'PPC 1860' },
                    { key: 'constitution', icon: <ShieldCheck size={18} />, label: 'Constitution 1973' },
                    { key: 'crpc', icon: <Book size={18} />, label: 'CrPC 1898' },
                    { key: 'cpc', icon: <FileText size={18} />, label: 'CPC 1908' },
                    { key: 'family-courts', icon: <Users size={18} />, label: 'Family Courts Act' },
                    { key: 'evidence', icon: <Gavel size={18} />, label: 'Evidence Act' },
                  ].map(({ key, icon, label }) => (
                    <motion.div
                      key={key}
                      className="nav-item"
                      onClick={() => handleTopicClick(key)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      {icon}
                      <span>{label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Religious Law */}
          <div className="nav-section">
            <motion.div
              className="nav-section-header"
              onClick={() => toggleSection('religious')}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <span>Religious Law</span>
              <motion.span
                animate={{ rotate: expandedSections.religious ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={14} />
              </motion.span>
            </motion.div>
            <AnimatePresence initial={false}>
              {expandedSections.religious && (
                <motion.div
                  className="nav-section-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  {[
                    { key: 'inheritance', icon: <Hash size={18} />, label: 'Inheritance' },
                    { key: 'nikah-talaq', icon: <Heart size={18} />, label: 'Marriage/Nikah' },
                    { key: 'nikah-talaq2', icon: <XCircle size={18} />, label: 'Divorce/Talaq', topic: 'nikah-talaq' },
                    { key: 'custody', icon: <UserPlus size={18} />, label: 'Child Custody' },
                    { key: 'zakat', icon: <Coins size={18} />, label: 'Zakat & Charity' },
                  ].map(({ key, icon, label, topic }) => (
                    <motion.div
                      key={key}
                      className="nav-item"
                      onClick={() => handleTopicClick(topic || key)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      {icon}
                      <span>{label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
          {showInstallBtn && (
            <motion.div
              className="nav-item nav-download-item"
              onClick={handleInstallClick}
              style={{ color: 'var(--legal-blue)', marginBottom: '10px' }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <Download size={20} />
              <span>Download App</span>
            </motion.div>
          )}
          <motion.div
            className="nav-item"
            onClick={handleLogout}
            style={{ color: '#ff4b4b' }}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </motion.div>
        </div>

        {sidebarOpen && (
          <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>
              {activeView === 'chat' ? 'Legal Assistant AI' :
                activeView === 'profile' ? 'User Profile' : 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {showInstallBtn && (
              <motion.button
                className="header-download-btn"
                onClick={handleInstallClick}
                title="Download App"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                <span className="btn-text">Download App</span>
              </motion.button>
            )}
            {activeView === 'chat' && (
              <button
                className={`insights-toggle ${!insightsOpen ? 'inactive' : ''}`}
                onClick={() => setInsightsOpen(!insightsOpen)}
                title={insightsOpen ? "Hide Insights" : "Show Insights"}
              >
                <Layout size={20} />
              </button>
            )}
            <div className="user-profile" onClick={() => setActiveView('profile')} style={{ cursor: 'pointer' }}>
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'HA'}
            </div>
          </div>
        </header>

        {activeView === 'chat' ? (
          <section className="chat-container">
            <div className="chat-main-layout">
              <div className="chat-scroll-area">
                <div className="chat-messages">
                  <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`message ${msg.type} ${editingId === msg.id ? 'editing' : ''}`}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div className="message-content">
                        {msg.type === 'system' && <ShieldCheck size={16} style={{ marginBottom: '5px' }} />}

                        {editingId === msg.id ? (
                          <div className="edit-wrapper">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSend(editingText, msg.id);
                                }
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                            />
                            <div className="edit-controls">
                              <button onClick={() => handleSend(editingText, msg.id)} className="save-btn">Save</button>
                              <button onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
                            </div>
                          </div>
                        ) : msg.type === 'analysis' ? (
                          <div className="analysis-result-container" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                            <div className="analysis-header-card" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              borderBottom: '1px solid var(--glass-border)',
                              paddingBottom: '12px',
                              marginBottom: '5px'
                            }}>
                              <FileText size={24} style={{ color: 'var(--legal-blue)' }} />
                              <div>
                                <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Case Document Analysis</h3>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{msg.filename || 'Processed File'}</span>
                              </div>
                            </div>

                            {/* Summary Card */}
                            <div className="analysis-card-section glass-card" style={{ padding: '16px' }}>
                              <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--legal-blue)', fontSize: '14px' }}>
                                <Info size={16} /> Document Summary
                              </h4>
                              <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6' }}>{msg.summary}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="analysis-grid-row">
                              {/* Strong Points */}
                              <div className="analysis-card-section glass-card" style={{ padding: '16px' }}>
                                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '14px' }}>
                                  <ThumbsUp size={16} /> Strong Points
                                </h4>
                                {msg.strong_points && msg.strong_points.length > 0 ? (
                                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                                    {msg.strong_points.map((pt, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{pt}</li>)}
                                  </ul>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No strengths identified.</span>
                                )}
                              </div>

                              {/* Weak Points */}
                              <div className="analysis-card-section glass-card" style={{ padding: '16px' }}>
                                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '14px' }}>
                                  <ThumbsDown size={16} /> Risks &amp; Weaknesses
                                </h4>
                                {msg.weak_points && msg.weak_points.length > 0 ? (
                                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                                    {msg.weak_points.map((pt, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{pt}</li>)}
                                  </ul>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No major risks flagged.</span>
                                )}
                              </div>
                            </div>

                            {/* Key Dates Card */}
                            {msg.key_dates && msg.key_dates.length > 0 && (
                              <div className="analysis-card-section glass-card" style={{ padding: '16px' }}>
                                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--legal-blue)', fontSize: '14px' }}>
                                  <Calendar size={16} /> Critical Dates
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                  {msg.key_dates.map((dt, idx) => (
                                    <div key={idx} style={{
                                      background: 'rgba(255, 255, 255, 0.03)',
                                      border: '1px solid var(--glass-border)',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      minWidth: '120px'
                                    }}>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{dt.label}</span>
                                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginTop: '3px' }}>{dt.date}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Relevant Legal Sections */}
                            {msg.relevant_sections && msg.relevant_sections.length > 0 && (
                              <div className="analysis-card-section glass-card" style={{ padding: '16px' }}>
                                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--legal-blue)', fontSize: '14px' }}>
                                  <BookOpen size={16} /> Relevant Legal Sections
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {msg.relevant_sections.map((sec, idx) => (
                                    <span key={idx} style={{
                                      background: 'rgba(16, 185, 129, 0.1)',
                                      border: '1px solid rgba(16, 185, 129, 0.2)',
                                      color: '#10b981',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}>
                                      {sec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="message-meta" style={{ marginTop: '5px' }}>
                              <span className="message-time">{msg.time}</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                            <div className="message-meta">
                              {msg.edited && <span className="edited-tag">(edited)</span>}
                              <span className="message-time">{msg.time}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {msg.type !== 'system' && editingId !== msg.id && (
                        <div className="message-actions">
                          <button onClick={() => handleSpeak(msg.text, msg.id)} title={speakingId === msg.id ? "Stop" : "Listen"}>
                            {speakingId === msg.id ? <VolumeX size={14} className="text-blue-400" /> : <Volume2 size={14} />}
                          </button>
                          <button onClick={() => handleCopy(msg.text)} title="Copy"><Copy size={14} /></button>
                          {msg.type === 'user' && (
                            <button onClick={() => startEditing(msg.id, msg.text)} title="Edit"><Edit2 size={14} /></button>
                          )}
                          <button onClick={() => handleDelete(msg.id)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  </AnimatePresence>
                  {loading && (
                    <motion.div
                      className="message ai"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="message-content typing-indicator">
                        <span>AI is thinking</span>
                        <span className="typing-dots">
                          {[0, 1, 2].map(i => (
                            <motion.span
                              key={i}
                              className="typing-dot"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                            />
                          ))}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <ChatInput
                  onSend={handleSend}
                  loading={loading}
                  activeSessionId={activeSessionId}
                />
              </div>

              {/* Right Sidebar: Legal Insights */}
              <aside className={`insights-sidebar ${!insightsOpen ? 'closed' : ''}`}>
                <div className="insights-section">
                  <h3><Info size={16} /> Legal Insights</h3>
                  <div className="insight-card">
                    <h4>PPC 1860 Reference</h4>
                    <p>Understanding sections related to common offenses in Pakistan.</p>
                    <button className="insight-link">View Refs <ChevronRight size={14} /></button>
                  </div>
                  <div className="insight-card">
                    <h4>Family Law</h4>
                    <p>Quick guide on marriage, divorce, and inheritance laws.</p>
                    <button className="insight-link">Explore <ChevronRight size={14} /></button>
                  </div>
                </div>

                <div className="insights-section">
                  <h3><ShieldCheck size={16} /> Compliance</h3>
                  <div className="compliance-tag">
                    <div className="status-dot"></div>
                    <span>Private & Secure</span>
                  </div>
                  <div className="disclaimer-mini">
                    <p>Information provided is for educational use. Always consult a licensed bar member for official proceedings.</p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : activeView === 'library' ? (
          <LegalLibrary topicKey={libraryTopic} />
        ) : activeView === 'profile' ? (
          <Profile
            user={currentUser}
            conversations={conversations}
            onLogout={handleLogout}
            token={token}
            onProfileUpdate={(updatedUser) => {
              const merged = { ...currentUser, ...updatedUser };
              setCurrentUser(merged);
              localStorage.setItem('currentUser', JSON.stringify(merged));
            }}
          />
        ) : null}
      </main>

      {(sidebarOpen || (insightsOpen && window.innerWidth <= 1200 && activeView === 'chat')) && (
        <div
          className="overlay"
          onClick={() => {
            setSidebarOpen(false);
            if (window.innerWidth <= 1200) setInsightsOpen(false);
          }}
        ></div>
      )}
      {/* iOS Safari PWA Installation Instructions Tooltip Modal */}
      {showIOSTip && (
        <div className="ios-prompt-overlay" onClick={() => setShowIOSTip(false)}>
          <div className="ios-prompt-card glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-ios-prompt" onClick={() => setShowIOSTip(false)}>
              <X size={20} />
            </button>
            <div className="ios-prompt-header">
              <Scale size={40} className="ios-prompt-logo" />
              <h3>Install JusticeBridge AI</h3>
              <p>Add JusticeBridge to your home screen for quick, offline-capable access like a native app.</p>
            </div>
            <div className="ios-prompt-steps">
              <div className="ios-step">
                <span className="step-num">1</span>
                <span className="step-text">Tap the <strong>Share</strong> button at the bottom of Safari (<span className="ios-share-icon">⎙</span> or similar).</span>
              </div>
              <div className="ios-step">
                <span className="step-num">2</span>
                <span className="step-text">Scroll down the menu and select <strong>Add to Home Screen</strong> (<span className="ios-add-icon">+</span>).</span>
              </div>
              <div className="ios-step">
                <span className="step-num">3</span>
                <span className="step-text">Tap <strong>Add</strong> in the top-right corner to complete installation.</span>
              </div>
            </div>
            <button className="ios-prompt-btn" onClick={() => setShowIOSTip(false)}>Got It</button>
          </div>
        </div>
      )}
    </div >
  );
}

export default App;
