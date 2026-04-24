import React, { useState, useEffect } from 'react';
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
  Home as HomeIcon
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
  const recognitionRef = React.useRef(null);

  // Sync with localStorage on change
  useEffect(() => {
    localStorage.setItem(`draft_${activeSessionId}`, input);
  }, [input, activeSessionId]);

  // Load draft when session changes
  useEffect(() => {
    const saved = localStorage.getItem(`draft_${activeSessionId}`);
    setInput(saved || '');
  }, [activeSessionId]);

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

  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
    localStorage.removeItem(`draft_${activeSessionId}`);
  };

  return (
    <div className="chat-input-area">
      <div className="input-wrapper">
        <textarea
          placeholder="Ask me anything about law..."
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

        <button
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          title="Speak (Roman Urdu/English)"
          disabled={loading}
        >
          {isListening ? <MicOff size={20} className="animate-pulse text-red-500" /> : <Mic size={20} />}
        </button>

        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
        >
          {loading ? <Clock size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
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
    <div className="legal-library-view">
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
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'landing');
  const [showAuth, setShowAuth] = useState(false);
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

  const handleSend = async (text = null, editId = null) => {
    const isEdit = editId !== null;
    const textToSend = text;

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



  // If we are on landing page, show it without the app shell
  if (activeView === 'landing' && !showAuth) {
    return (
      <>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <Home
          onStartChat={handleStartChat}
          onLogin={() => setShowAuth(true)}
          onTopicClick={handleTopicClick}
        />
        {showAuth && (
          <Auth
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setShowAuth(false)}
          />
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
          <div
            className={`nav-item ${activeView === 'landing' ? 'active' : ''}`}
            onClick={() => { setActiveView('landing'); setSidebarOpen(false); }}
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </div>

          <div
            className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveView('chat'); setSidebarOpen(false); }}
          >
            <MessageSquare size={20} />
            <span>Legal Chat</span>
          </div>

          <div
            className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveView('profile'); setSidebarOpen(false); }}
          >
            <User size={20} />
            <span>Profile</span>
          </div>

          <div className="nav-section">
            <div className="nav-section-header" onClick={() => toggleSection('recent')}>
              <span>Recent Chats</span>
              {expandedSections.recent ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.recent && (
              <div className="nav-section-content">
                <div className="nav-item new-chat-btn" onClick={createNewChat}>
                  <span>+ New Chat</span>
                </div>
                <div className="sessions-list">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`session-item ${activeSessionId === conv.id ? 'active' : ''}`}
                      onClick={() => { setActiveSessionId(conv.id); setActiveView('chat'); setSidebarOpen(false); }}
                    >
                      <span className="session-title">{conv.title}</span>
                      <button className="session-delete" onClick={(e) => deleteSession(e, conv.id)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="nav-section">
            <div className="nav-section-header" onClick={() => toggleSection('laws')}>
              <span>Laws of Pakistan</span>
              {expandedSections.laws ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.laws && (
              <div className="nav-section-content">
                <div className="nav-item" onClick={() => handleTopicClick("ppc")}>
                  <Scale size={18} />
                  <span>PPC 1860</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("constitution")}>
                  <ShieldCheck size={18} />
                  <span>Constitution 1973</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("crpc")}>
                  <Book size={18} />
                  <span>CrPC 1898</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("cpc")}>
                  <FileText size={18} />
                  <span>CPC 1908</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("family-courts")}>
                  <Users size={18} />
                  <span>Family Courts Act</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("evidence")}>
                  <Gavel size={18} />
                  <span>Evidence Act</span>
                </div>
              </div>
            )}
          </div>

          <div className="nav-section">
            <div className="nav-section-header" onClick={() => toggleSection('religious')}>
              <span>Religious Law</span>
              {expandedSections.religious ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.religious && (
              <div className="nav-section-content">
                <div className="nav-item" onClick={() => handleTopicClick("inheritance")}>
                  <Hash size={18} />
                  <span>Inheritance</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("nikah-talaq")}>
                  <Heart size={18} />
                  <span>Marriage/Nikah</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("nikah-talaq")}>
                  <XCircle size={18} />
                  <span>Divorce/Talaq</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("custody")}>
                  <UserPlus size={18} />
                  <span>Child Custody</span>
                </div>
                <div className="nav-item" onClick={() => handleTopicClick("zakat")}>
                  <Coins size={18} />
                  <span>Zakat & Charity</span>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <div className="nav-item" onClick={handleLogout} style={{ color: '#ff4b4b' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </div>
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
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.type} ${editingId === msg.id ? 'editing' : ''}`}>
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
                    </div>
                  ))}
                  {loading && (
                    <div className="message ai" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                      <div className="message-content">AI is thinking...</div>
                    </div>
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
          <Profile user={currentUser} conversations={conversations} onLogout={handleLogout} />
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
    </div >
  );
}

export default App;
