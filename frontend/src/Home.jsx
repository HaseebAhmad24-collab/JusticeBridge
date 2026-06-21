import React, { useState, useEffect } from 'react';
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
    History,
    Menu,
    X
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Home.css';

const Home = ({ onStartChat, onLogin, onTopicClick }) => {
    const [email, setEmail] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!email) return;

        // Simulate API call
        toast.success('Thank you for joining our newsletter!');
        setEmail('');
    };

    // Shared motion variants respecting prefers-reduced-motion
    const fadeUp = shouldReduceMotion ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 }
    } : {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.35, ease: "easeOut" }
        }
    };

    const scaleIn = shouldReduceMotion ? {
        hidden: { opacity: 1, scale: 1 },
        visible: { opacity: 1, scale: 1 }
    } : {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.45, ease: "easeOut", delay: 0.2 } 
        }
    };

    const containerStagger = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    // Micro-interaction presets
    const hoverScale = shouldReduceMotion ? {} : { scale: 1.02, y: -1 };
    const hoverLift = shouldReduceMotion ? {} : { y: -2 };
    const tapCompress = shouldReduceMotion ? {} : { scale: 0.98 };

    return (
        <div className="home-container">
            {/* Navbar for Home */}
            <header className="home-header">
                <div className="logo-section">
                    <Scale size={32} className="logo-icon" />
                    <span>JusticeBridge</span>
                </div>
                
                <button 
                    className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

                <motion.nav 
                    className={`home-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}
                    initial={isMobile ? "closed" : "open"}
                    animate={isMobile ? (mobileMenuOpen ? "open" : "closed") : "open"}
                    variants={isMobile ? {
                        open: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
                        closed: shouldReduceMotion ? { opacity: 0, y: -10 } : { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
                    } : {
                        open: { opacity: 1, y: 0 }
                    }}
                >
                    <motion.a whileHover={hoverLift} whileTap={tapCompress} href="#about" onClick={() => setMobileMenuOpen(false)}>About</motion.a>
                    <motion.a whileHover={hoverLift} whileTap={tapCompress} href="#insights" onClick={() => setMobileMenuOpen(false)}>Insights</motion.a>
                    <motion.a whileHover={hoverLift} whileTap={tapCompress} href="#articles" onClick={() => setMobileMenuOpen(false)}>Articles</motion.a>
                    <motion.button whileHover={hoverScale} whileTap={tapCompress} className="nav-login-btn" onClick={() => { onLogin(); setMobileMenuOpen(false); }}>Login</motion.button>
                    <motion.button whileHover={hoverScale} whileTap={tapCompress} className="nav-cta-btn" onClick={() => { onStartChat(); setMobileMenuOpen(false); }}>Start Consultation</motion.button>
                </motion.nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div 
                    className="hero-content"
                    variants={containerStagger}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="badge" variants={fadeUp}>Next-Gen Legal Assistant</motion.div>
                    <motion.h1 variants={fadeUp}>Empowering Justice Through AI</motion.h1>
                    <motion.p variants={fadeUp}>
                        Experience instant access to Pakistani Penal Code and Religious Jurisprudence.
                        Our advanced AI bridged the gap between complex law and citizens.
                    </motion.p>
                    <motion.div className="hero-btns" variants={fadeUp}>
                        <motion.button 
                            whileHover={hoverScale} 
                            whileTap={tapCompress}
                            className="primary-btn" 
                            onClick={onStartChat}
                        >
                            Start Chat <ArrowRight size={18} />
                        </motion.button>
                        <motion.button 
                            whileHover={hoverScale} 
                            whileTap={tapCompress}
                            className="secondary-btn" 
                            onClick={onLogin}
                        >
                            Try Trial Account
                        </motion.button>
                    </motion.div>
                </motion.div>
                <motion.div 
                    className="hero-visual"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                >
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
                </motion.div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <motion.div 
                    className="section-title"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <h2>About JusticeBridge</h2>
                    <p>The intersection of heritage and innovation</p>
                </motion.div>
                
                <motion.div 
                    className="about-grid"
                    variants={containerStagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <motion.div 
                        className="about-card glass-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
                        <Compass size={40} className="about-icon" />
                        <h3>Our Mission</h3>
                        <p>To democratize legal knowledge in Pakistan, making complex laws accessible to every citizen through modern technology.</p>
                    </motion.div>
                    
                    <motion.div 
                        className="about-card glass-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
                        <Trophy size={40} className="about-icon" />
                        <h3>Our Vision</h3>
                        <p>Becoming the most trusted digital bridge for legal and religious guidance, fostering a more informed and just society.</p>
                    </motion.div>
                    
                    <motion.div 
                        className="about-card glass-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
                        <History size={40} className="about-icon" />
                        <h3>Our Journey</h3>
                        <p>Born from the need for clarity, JusticeBridge combines centuries-old jurisprudence with cutting-edge artificial intelligence.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Analytics/Insights Section */}
            <section id="insights" className="insights-section">
                <motion.div 
                    className="section-title"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <h2>Market Insights</h2>
                    <p>Real-time legal analytics for Pakistan</p>
                </motion.div>
                
                <motion.div 
                    className="insights-grid"
                    variants={containerStagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <motion.div 
                        className="insight-card glass-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
                        <div className="icon-box blue"><Search size={24} /></div>
                        <h3>Case Prediction</h3>
                        <p>Predicting legal outcomes with historical data and AI models.</p>
                    </motion.div>
                    
                    <motion.div 
                        className="insight-card glass-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
                        <div className="icon-box green"><ShieldCheck size={24} /></div>
                        <h3>Rights Awareness</h3>
                        <p>Educating citizens about their constitutional rights through interactive AI.</p>
                    </motion.div>
                    
                    <motion.div 
                        className="insight-card glass-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
                        <div className="icon-box red"><Gavel size={24} /></div>
                        <h3>Legal Database</h3>
                        <p>10,000+ indexed law clauses ready for instant retrieval.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Articles/Blog Section */}
            <section id="articles" className="articles-section">
                <motion.div 
                    className="section-title"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <h2>Legal Articles</h2>
                    <p>Latest updates on Pakistani Law and Religious Practices</p>
                </motion.div>
                
                <motion.div 
                    className="articles-grid"
                    variants={containerStagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <motion.article 
                        className="article-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
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
                    </motion.article>
                    
                    <motion.article 
                        className="article-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
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
                    </motion.article>
                    
                    <motion.article 
                        className="article-card"
                        variants={fadeUp}
                        whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                        whileTap={tapCompress}
                    >
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
                    </motion.article>
                </motion.div>
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
                            <motion.button whileHover={hoverScale} whileTap={tapCompress} type="submit">Join</motion.button>
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

