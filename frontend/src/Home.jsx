import React, { useState } from 'react';
import {
    Scale,
    BookOpen,
    ShieldCheck,
    ArrowRight,
    Gavel,
    FileText,
    Search,
    Users,
    Compass,
    Trophy,
    History
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Home.css';

const Home = ({ onStartChat, onLogin, onTopicClick }) => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!email) return;

        // Simulate API call
        toast.success('Thank you for joining our newsletter!');
        setEmail('');
    };

    return (
        <div className="home-container">
            {/* Navbar for Home */}
            <header className="home-header">
                <div className="logo-section">
                    <Scale size={32} className="logo-icon" />
                    <span>JusticeBridge</span>
                </div>
                <nav className="home-nav">
                    <a href="#about">About</a>
                    <a href="#insights">Insights</a>
                    <a href="#articles">Articles</a>
                    <button className="nav-login-btn" onClick={onLogin}>Login</button>
                    <button className="nav-cta-btn" onClick={onStartChat}>Start Consultation</button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="badge">Next-Gen Legal Assistant</div>
                    <h1>Empowering Justice Through AI</h1>
                    <p>
                        Experience instant access to Pakistani Penal Code and Religious Jurisprudence.
                        Our advanced AI bridged the gap between complex law and citizens.
                    </p>
                    <div className="hero-btns">
                        <button className="primary-btn" onClick={onStartChat}>
                            Start Chat <ArrowRight size={18} />
                        </button>
                        <button className="secondary-btn" onClick={onLogin}>Try Trial Account</button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="glass-card main-visual">
                        <Scale size={120} color="var(--legal-blue)" />
                        <div className="stats-row">
                            <div className="stat-item">
                                <h3>99%</h3>
                                <p>Data Accuracy</p>
                            </div>
                            <div className="stat-item">
                                <h3>24/7</h3>
                                <p>Availability</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="section-title">
                    <h2>About JusticeBridge</h2>
                    <p>The intersection of heritage and innovation</p>
                </div>
                <div className="about-grid">
                    <div className="about-card glass-card">
                        <Compass size={40} className="about-icon" />
                        <h3>Our Mission</h3>
                        <p>To democratize legal knowledge in Pakistan, making complex laws accessible to every citizen through modern technology.</p>
                    </div>
                    <div className="about-card glass-card">
                        <Trophy size={40} className="about-icon" />
                        <h3>Our Vision</h3>
                        <p>Becoming the most trusted digital bridge for legal and religious guidance, fostering a more informed and just society.</p>
                    </div>
                    <div className="about-card glass-card">
                        <History size={40} className="about-icon" />
                        <h3>Our Journey</h3>
                        <p>Born from the need for clarity, JusticeBridge combines centuries-old jurisprudence with cutting-edge artificial intelligence.</p>
                    </div>
                </div>
            </section>

            {/* Analytics/Insights Section */}
            <section id="insights" className="insights-section">
                <div className="section-title">
                    <h2>Market Insights</h2>
                    <p>Real-time legal analytics for Pakistan</p>
                </div>
                <div className="insights-grid">
                    <div className="insight-card glass-card">
                        <div className="icon-box blue"><Search size={24} /></div>
                        <h3>Case Prediction</h3>
                        <p>Predicting legal outcomes with historical data and AI models.</p>
                    </div>
                    <div className="insight-card glass-card">
                        <div className="icon-box green"><ShieldCheck size={24} /></div>
                        <h3>Rights Awareness</h3>
                        <p>Educating citizens about their constitutional rights through interactive AI.</p>
                    </div>
                    <div className="insight-card glass-card">
                        <div className="icon-box red"><Gavel size={24} /></div>
                        <h3>Legal Database</h3>
                        <p>10,000+ indexed law clauses ready for instant retrieval.</p>
                    </div>
                </div>
            </section>

            {/* Articles/Blog Section */}
            <section id="articles" className="articles-section">
                <div className="section-title">
                    <h2>Legal Articles</h2>
                    <p>Latest updates on Pakistani Law and Religious Practices</p>
                </div>
                <div className="articles-grid">
                    <article className="article-card">
                        <div className="article-image">
                            <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" alt="Legal Gavel" />
                        </div>
                        <div className="article-content">
                            <span>Property Law</span>
                            <h3>Understanding Land Transfers in Pakistan</h3>
                            <p>A comprehensive guide to the registration process and required documentation.</p>
                            <a href="#articles" onClick={(e) => { e.preventDefault(); onTopicClick('land-transfer'); }}>
                                Read More <ArrowRight size={16} />
                            </a>
                        </div>
                    </article>
                    <article className="article-card">
                        <div className="article-image">
                            <img src="https://www.americanprogress.org/wp-content/uploads/sites/2/2018/02/GettyImages-903993266.jpg?w=1040" alt="Religious Books" />
                        </div>
                        <div className="article-content">
                            <span>Religious Law</span>
                            <h3>Inheritance Rights in Islamic Fiqh</h3>
                            <p>Exploring the distribution patterns and legal safeguards for heirs.</p>
                            <a href="#articles" onClick={(e) => { e.preventDefault(); onTopicClick('inheritance'); }}>
                                Read More <ArrowRight size={16} />
                            </a>
                        </div>
                    </article>
                    <article className="article-card">
                        <div className="article-image">
                            <img src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800" alt="Scales" />
                        </div>
                        <div className="article-content">
                            <span>Digital Justice</span>
                            <h3>The Future of AI in Legal Consulting</h3>
                            <p>How automation is helping lawyers focus rows on complex litigation strategy.</p>
                            <a href="#articles" onClick={(e) => { e.preventDefault(); onTopicClick('legal-ai'); }}>
                                Read More <ArrowRight size={16} />
                            </a>
                        </div>
                    </article>
                </div>
            </section>

            {/* Footer */}
            <footer className="main-footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo-section">
                            <Scale size={24} />
                            <span>JusticeBridge</span>
                        </div>
                        <p>Pioneering digital legal access in Pakistan. Powered by AI, backed by scholars.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Use</a>
                        <a href="#">Contact Support</a>
                    </div>
                    <div className="footer-newsletter">
                        <h4>Stay Updated</h4>
                        <form className="newsletter-input" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">Join</button>
                        </form>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 JusticeBridge AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
