import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
    ArrowRight, Download, Menu, X, ChevronRight,
    CheckCircle2, FileText, MessageSquare, Database,
    Scale, BookOpen, Users, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Home.css';

/* ─────────────────────── Typing Terminal ─────────────────────── */
const PPC_TEXT = `آئین پاکستان — دفعہ ۲۵

تمام شہری قانون کی نظر میں برابر ہیں
اور یکساں قانونی تحفظ کے حقدار ہیں۔

Constitution of Pakistan — Article 25

All citizens are equal before law
and are entitled to equal protection of law.`;

function TypingTerminal() {
    const [displayed, setDisplayed] = useState('');
    const [cursor, setCursor] = useState(true);
    const [phase, setPhase] = useState('typing'); // typing | pause | reset
    const idxRef = useRef(0);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) {
            setDisplayed(PPC_TEXT);
            return;
        }

        if (phase === 'typing') {
            if (idxRef.current < PPC_TEXT.length) {
                const delay = PPC_TEXT[idxRef.current] === '\n' ? 60 : 28;
                const timer = setTimeout(() => {
                    setDisplayed(PPC_TEXT.slice(0, idxRef.current + 1));
                    idxRef.current++;
                }, delay);
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => setPhase('pause'), 2800);
                return () => clearTimeout(timer);
            }
        }

        if (phase === 'pause') {
            const timer = setTimeout(() => {
                setPhase('reset');
            }, 600);
            return () => clearTimeout(timer);
        }

        if (phase === 'reset') {
            setDisplayed('');
            idxRef.current = 0;
            setPhase('typing');
        }
    }, [phase, displayed, shouldReduceMotion]);

    useEffect(() => {
        const blink = setInterval(() => setCursor(c => !c), 530);
        return () => clearInterval(blink);
    }, []);

    return (
        <div className="jb-terminal" aria-label="Legal document preview">
            <div className="jb-terminal-bar">
                <span className="jb-dot red" />
                <span className="jb-dot amber" />
                <span className="jb-dot green" />
                <span className="jb-terminal-label">pakistan_legal_corpus.txt</span>
            </div>
            <pre className="jb-terminal-body">
                <span className="jb-terminal-prompt">▸ </span>
                {displayed}
                <span className={`jb-cursor ${cursor ? 'visible' : ''}`}>█</span>
            </pre>
        </div>
    );
}

/* ─────────────────────── Count-Up Number ─────────────────────── */
function CountUp({ target, suffix = '', duration = 1600 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (!inView) return;
        if (shouldReduceMotion) { setVal(target); return; }
        const start = Date.now();
        const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, target, duration, shouldReduceMotion]);

    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────── Chat Mockup ─────────────────────── */
function ChatMockup() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const shouldReduceMotion = useReducedMotion();

    const msgs = [
        {
            role: 'user',
            text: 'Meri zameen ka kya hoga agar mera bhai claim kare? Baap ne koi wasiyat nahi ki.',
            delay: 0.1
        },
        {
            role: 'ai',
            text: 'Pakistan Muslim Personal Law (Shariat) Application Act, 1962 ke Section 4 ke mutabiq, wasiyat ke baghair wirasat Hanafi fiqh ke hisaab se taqseem hoti hai. Bete ko beti se do guna hissa milta hai (4:2 ratio). Zameen registration ke liye Mutation (Intiqal) — Land Revenue Act 1967 Section 42 — zaroori hai.',
            delay: 0.55,
            refs: ['PMPL Act 1962 § 4', 'Land Revenue Act 1967 § 42']
        },
        {
            role: 'user',
            text: 'Kya court mein case kiye baghair ye mutation ho sakti hai?',
            delay: 1.1
        },
        {
            role: 'ai',
            text: 'Haan — agar tamam waraseen razi hon to Patwari ke paas consent-based mutation ho sakti hai bina adalat jaye. Agar koi razamand na ho, tab Civil Court mein Declaration Suit File karna hoga (CPC Order VII Rule 1).',
            delay: 1.55,
            refs: ['CPC Order VII Rule 1']
        }
    ];

    return (
        <div className="jb-chat-mockup" ref={ref}>
            <div className="jb-chat-topbar">
                <div className="jb-chat-avatar">
                    <Scale size={16} />
                </div>
                <div>
                    <div className="jb-chat-name">JusticeBridge AI</div>
                    <div className="jb-chat-status">● Online — Pakistan Legal Corpus</div>
                </div>
            </div>
            <div className="jb-chat-messages">
                {msgs.map((m, i) => (
                    <motion.div
                        key={i}
                        className={`jb-chat-bubble ${m.role}`}
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: m.delay, duration: 0.38, ease: 'easeOut' }}
                    >
                        {m.role === 'ai' && <div className="jb-ai-label">JusticeBridge</div>}
                        <p>{m.text}</p>
                        {m.refs && (
                            <div className="jb-ref-tags">
                                {m.refs.map((r, ri) => (
                                    <span key={ri} className="jb-ref-tag">{r}</span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────── Main Home Component ─────────────────────── */
const Home = ({ onStartChat, onLogin, onTopicClick, showInstallBtn, onInstall }) => {
    const [email, setEmail] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        toast.success('Shukriya! Aap ko latest updates milte rahein ge.');
        setEmail('');
    };

    /* Motion presets */
    const fadeUp = shouldReduceMotion
        ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
        : { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

    const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
    const hoverLift = shouldReduceMotion ? {} : { y: -2 };
    const tapPress = shouldReduceMotion ? {} : { scale: 0.97 };
    const hoverScale = shouldReduceMotion ? {} : { scale: 1.025, y: -2 };

    const useCases = [
        { emoji: '📄', title: 'FIR Samajhna', desc: 'Police station mein arrest ke waqt apne haqqoq janein. Bail, legal aid, aur Section 54 CrPC ki poori guide.', topic: 'fir-rights' },
        { emoji: '🏠', title: 'Property Dispute', desc: 'Baap ki zameen mein hissa — wirasat ka hisaab, mutation, aur bhai-behen ke darmiyan faisle.', topic: 'property' },
        { emoji: '💍', title: 'Talaq ya Khula', desc: 'Islamic aur Civil law dono ke tahat divorce process, haq-meher, aur bachon ki custody.', topic: 'divorce' },
        { emoji: '📝', title: 'Contract Check', desc: 'Ek business ya rental agreement mein kaunse clauses legal hain aur kaunse qabool nahi.', topic: 'contract' },
    ];

    const articles = [
        { num: '01', category: 'Fauzdari Qanoon', title: 'PPC Section 302 — Qatl-e-Amd (Intentional Murder): Saza aur Difa', excerpt: 'Fauzadri adalat mein apni pairvi kaise karein', topic: 'ppc-302' },
        { num: '02', category: 'Khaandani Qanoon', title: 'Muslim Family Laws Ordinance 1961 — Talaq, Mehr, aur Iddat ki Complete Guide', excerpt: 'Pakistan mein divorce procedure step-by-step', topic: 'family-law' },
        { num: '03', category: 'Amlak ka Qanoon', title: 'Transfer of Property Act 1882 — Zameen ki Khareed Farokht ka Qanoon', excerpt: 'Registry, mutation, aur stamp duty samajhein', topic: 'property-law' },
        { num: '04', category: 'Constitutional Rights', title: 'آئین پاکستان — بنیادی حقوق (Articles 8–28): Aapke Hifazati Haqqoq', excerpt: 'Fundamental rights jo koi sarkar nahi cheen sakti', topic: 'fundamental-rights' },
    ];

    return (
        <div className="jb-page">
            {/* ── NAVBAR ── */}
            <header className="jb-nav-wrapper">
                <div className="jb-nav-inner">
                    <div className="jb-logo">
                        <span className="jb-logo-mark">⚖</span>
                        <span className="jb-logo-text">JusticeBridge</span>
                    </div>

                    <button
                        className="jb-hamburger"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <motion.nav
                        className={`jb-nav ${mobileMenuOpen ? 'open' : ''}`}
                        initial={isMobile ? 'closed' : 'open'}
                        animate={isMobile ? (mobileMenuOpen ? 'open' : 'closed') : 'open'}
                        variants={isMobile ? {
                            open: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.22, ease: 'easeOut' } },
                            closed: { opacity: 0, y: -8, pointerEvents: 'none', transition: { duration: 0.18, ease: 'easeIn' } }
                        } : { open: { opacity: 1 } }}
                    >
                        {['#problem', '#how-it-works', '#articles'].map((href, i) => (
                            <motion.a
                                key={href}
                                href={href}
                                className="jb-nav-link"
                                whileHover={hoverLift}
                                whileTap={tapPress}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {['Masla', 'Tareeqa Kaar', 'Maqalaat'][i]}
                            </motion.a>
                        ))}
                        {showInstallBtn && (
                            <motion.button
                                className="jb-btn-ghost jb-btn-sm"
                                whileHover={hoverScale}
                                whileTap={tapPress}
                                onClick={() => { onInstall(); setMobileMenuOpen(false); }}
                            >
                                <Download size={15} /> App
                            </motion.button>
                        )}
                        <motion.button
                            className="jb-btn-ghost jb-btn-sm"
                            whileHover={hoverScale}
                            whileTap={tapPress}
                            onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                        >
                            Login
                        </motion.button>
                        <motion.button
                            className="jb-btn-primary jb-btn-sm"
                            whileHover={hoverScale}
                            whileTap={tapPress}
                            onClick={() => { onStartChat(); setMobileMenuOpen(false); }}
                        >
                            Mashwara Lein
                        </motion.button>
                    </motion.nav>
                </div>
            </header>

            {/* ── SECTION 1: HERO ── */}
            <section className="jb-hero">
                <div className="jb-hero-inner">
                    <motion.div
                        className="jb-hero-left"
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div className="jb-eyebrow" variants={fadeUp}>
                            Pakistan ka Pehla AI Legal Assistant
                        </motion.div>
                        <motion.h1 className="jb-hero-heading" variants={fadeUp}>
                            Qanoon ab<br />
                            <em>aapki zuban</em><br />
                            mein hai.
                        </motion.h1>
                        <motion.p className="jb-hero-sub" variants={fadeUp}>
                            Pakistan Penal Code, آئین، aur Islamic Fiqh — AI se poochein,
                            hakeeqi citations ke saath jawab payen. Urdu mein, Roman Urdu mein,
                            ya English mein.
                        </motion.p>
                        <motion.div className="jb-hero-actions" variants={fadeUp}>
                            <motion.button
                                className="jb-btn-primary jb-btn-lg"
                                whileHover={hoverScale}
                                whileTap={tapPress}
                                onClick={onStartChat}
                            >
                                Mashwara Shuru Karein <ArrowRight size={18} />
                            </motion.button>
                            <motion.button
                                className="jb-btn-ghost jb-btn-lg"
                                whileHover={hoverScale}
                                whileTap={tapPress}
                                onClick={onLogin}
                            >
                                Account Banayein
                            </motion.button>
                        </motion.div>
                        {showInstallBtn && (
                            <motion.button
                                className="jb-btn-install"
                                variants={fadeUp}
                                whileHover={hoverScale}
                                whileTap={tapPress}
                                onClick={onInstall}
                            >
                                <Download size={16} /> Apne Phone pe Download Karein
                            </motion.button>
                        )}
                    </motion.div>

                    <motion.div
                        className="jb-hero-right"
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <TypingTerminal />
                        <div className="jb-hero-badge-row">
                            <span className="jb-trust-badge"><CheckCircle2 size={13} /> PPC Indexed</span>
                            <span className="jb-trust-badge"><CheckCircle2 size={13} /> Fiqh Integrated</span>
                            <span className="jb-trust-badge"><CheckCircle2 size={13} /> RAG System</span>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative seal watermark */}
                <div className="jb-hero-seal" aria-hidden="true">⚖</div>
            </section>

            {/* ── SECTION 2: PROBLEM STATEMENT ── */}
            <section id="problem" className="jb-problem">
                <div className="jb-problem-inner">
                    <motion.div
                        className="jb-problem-header"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                    >
                        <span className="jb-section-eyebrow">Masla kya hai?</span>
                        <h2 className="jb-section-heading">Pakistan mein insaaf tak<br />rasaai kiyon mushkil hai?</h2>
                    </motion.div>

                    <div className="jb-stats-wall">
                        {[
                            { num: 85, suffix: '%', label: 'Pakistanis jo ek lawyer afford nahi kar sakte', src: 'World Bank, 2023' },
                            { num: 4.5, suffix: ' saal', label: 'Average case ka intezaar Pakistan ke courts mein', src: 'Law & Justice Commission' },
                            { num: 1060, suffix: '', label: 'Citizens per ek lawyer — poori duniya mein sabse zyada', src: 'Pakistan Bar Council' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                className="jb-stat-block"
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ delay: i * 0.12 }}
                            >
                                <div className="jb-stat-num">
                                    <CountUp target={typeof s.num === 'number' ? Math.round(s.num * (s.suffix === ' saal' ? 10 : 1)) : s.num}
                                        suffix={s.suffix === ' saal' ? '' : s.suffix}
                                        duration={1400 + i * 200}
                                    />
                                    {s.suffix === ' saal' && <span className="jb-stat-suf"> sal</span>}
                                </div>
                                <div className="jb-stat-label">{s.label}</div>
                                <div className="jb-stat-src">— {s.src}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="jb-problem-answer"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-40px' }}
                    >
                        <span className="jb-problem-answer-label">Hamara Jawab</span>
                        <p>JusticeBridge Pakistan ka pehla AI legal assistant hai jo PPC, آئین، Islamic Fiqh aur Civil laws ko ek jagah lata hai — bilkul muft, 24/7, aapki apni zuban mein.</p>
                    </motion.div>
                </div>
            </section>

            {/* ── SECTION 3: HOW IT WORKS ── */}
            <section id="how-it-works" className="jb-how">
                <div className="jb-how-inner">
                    <motion.div
                        className="jb-section-header"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                    >
                        <span className="jb-section-eyebrow">Tareeqa Kaar</span>
                        <h2 className="jb-section-heading">Ek sawaal se jawab tak</h2>
                        <p className="jb-section-sub">Gemini AI + RAG pipeline Pakistani law corpus se seedha jawab deta hai</p>
                    </motion.div>

                    <div className="jb-steps-rail">
                        {[
                            { icon: <MessageSquare size={22} />, num: '01', title: 'Sawaal Poochein', desc: 'Urdu, Roman Urdu, ya English mein — jaise chahen likhein ya file upload karein' },
                            { icon: <Database size={22} />, num: '02', title: 'Corpus Search', desc: 'RAG engine 500+ qanoon sections mein relevant material dhundhta hai' },
                            { icon: <Zap size={22} />, num: '03', title: 'AI Synthesis', desc: 'Google Gemini AI searched sections ko samajh kar coherent jawab banata hai' },
                            { icon: <BookOpen size={22} />, num: '04', title: 'Citations ke Saath', desc: 'Jawab ke saath exact section numbers aur law references milti hain' },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                className="jb-step"
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ delay: i * 0.13 }}
                            >
                                <div className="jb-step-num">{step.num}</div>
                                <div className="jb-step-icon">{step.icon}</div>
                                <h3 className="jb-step-title">{step.title}</h3>
                                <p className="jb-step-desc">{step.desc}</p>
                                {i < 3 && <div className="jb-step-arrow" aria-hidden="true"><ChevronRight size={20} /></div>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 4: LIVE CHAT SHOWCASE ── */}
            <section className="jb-showcase">
                <div className="jb-showcase-inner">
                    <motion.div
                        className="jb-showcase-left"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                    >
                        <motion.span className="jb-section-eyebrow" variants={fadeUp}>Live Preview</motion.span>
                        <motion.h2 className="jb-section-heading" variants={fadeUp}>
                            Aisi conversation jo<br />fark karti hai
                        </motion.h2>
                        <motion.p className="jb-section-sub" variants={fadeUp}>
                            Yeh sirf ek chatbot nahi — ye ek AI wakeel hai jo Pakistan ke qanooni
                            nizam ko jaanta hai aur aapko exact sections aur haqqoq bata sakta hai.
                        </motion.p>
                        <motion.div className="jb-showcase-badges" variants={fadeUp}>
                            {['Roman Urdu Support', 'Urdu Script', 'English', 'File Upload (PDF/Image)', 'Voice Output'].map(b => (
                                <span key={b} className="jb-feature-pill">✓ {b}</span>
                            ))}
                        </motion.div>
                        <motion.button
                            className="jb-btn-primary jb-btn-lg"
                            variants={fadeUp}
                            whileHover={hoverScale}
                            whileTap={tapPress}
                            onClick={onStartChat}
                        >
                            Apna Sawaal Poochein <ArrowRight size={18} />
                        </motion.button>
                    </motion.div>

                    <motion.div
                        className="jb-showcase-right"
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <ChatMockup />
                    </motion.div>
                </div>
            </section>

            {/* ── SECTION 5: TRUST / COVERAGE ── */}
            <section className="jb-trust">
                <div className="jb-trust-inner">
                    <div className="jb-trust-left">
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                        >
                            <motion.span className="jb-section-eyebrow" variants={fadeUp}>Coverage</motion.span>
                            <motion.div className="jb-big-number" variants={fadeUp}>
                                <CountUp target={500} suffix="+" duration={1200} />
                            </motion.div>
                            <motion.p className="jb-big-number-label" variants={fadeUp}>
                                Pakistani Law Sections indexed aur searchable
                            </motion.p>
                            <motion.button
                                className="jb-btn-outline jb-btn-lg"
                                variants={fadeUp}
                                whileHover={hoverScale}
                                whileTap={tapPress}
                                onClick={onStartChat}
                            >
                                Poora Database Explore Karein
                            </motion.button>
                        </motion.div>
                    </div>

                    <div className="jb-trust-right">
                        {[
                            { color: 'parchment', title: 'Pakistan Penal Code 1860', detail: '511 sections — tamam faujdari jurm aur sazaen' },
                            { color: 'jade', title: 'Constitution of Pakistan 1973', detail: 'Bunyaadi haqqoq, federalism, aur state structure' },
                            { color: 'jade', title: 'Muslim Personal Law (Shariat) 1962', detail: 'Wirasat, nikah, talaq — Hanafi fiqh ke mutabiq' },
                            { color: 'parchment', title: 'Code of Criminal Procedure', detail: 'FIR, arrest, bail, trial — step by step procedure' },
                            { color: 'mist', title: 'Transfer of Property Act 1882', detail: 'Zameen, amlak, registry, aur mutation' },
                            { color: 'mist', title: 'Muslim Family Laws Ordinance 1961', detail: 'Talaq notice, mehr, polygamy, aur Arbitration Council' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className={`jb-law-row jb-law-${item.color}`}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={shouldReduceMotion ? {} : { x: 6 }}
                            >
                                <div className="jb-law-dot" />
                                <div>
                                    <div className="jb-law-title">{item.title}</div>
                                    <div className="jb-law-detail">{item.detail}</div>
                                </div>
                                <ChevronRight size={16} className="jb-law-arrow" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 6: USE CASES ── */}
            <section className="jb-usecases">
                <div className="jb-usecases-inner">
                    <motion.div
                        className="jb-section-header"
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                    >
                        <span className="jb-section-eyebrow">Masaail jo log poochte hain</span>
                        <h2 className="jb-section-heading">Kaunse haalaat mein<br />JusticeBridge madadgar hai?</h2>
                    </motion.div>

                    <div className="jb-cases-row">
                        {useCases.map((c, i) => (
                            <motion.div
                                key={i}
                                className={`jb-case-card ${i % 2 === 1 ? 'jb-case-tall' : ''}`}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={shouldReduceMotion ? {} : { y: -8, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}
                                whileTap={tapPress}
                            >
                                <span className="jb-case-emoji">{c.emoji}</span>
                                <h3 className="jb-case-title">{c.title}</h3>
                                <p className="jb-case-desc">{c.desc}</p>
                                <button
                                    className="jb-case-cta"
                                    onClick={() => onTopicClick(c.topic)}
                                >
                                    JusticeBridge se poochein <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 7: ARTICLES ── */}
            <section id="articles" className="jb-articles">
                <div className="jb-articles-inner">
                    <motion.div
                        className="jb-articles-header"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                    >
                        <div>
                            <motion.span className="jb-section-eyebrow" variants={fadeUp}>Maqalaat</motion.span>
                            <motion.h2 className="jb-section-heading" variants={fadeUp}>Pakistani Qanoon<br />ki Rahnumai</motion.h2>
                        </div>
                        <motion.p className="jb-articles-sub" variants={fadeUp}>
                            Hamari AI se liye jawabaat aur legal explanations — bilkul muft, har waqt
                        </motion.p>
                    </motion.div>

                    <div className="jb-articles-list">
                        {articles.map((a, i) => (
                            <motion.button
                                key={i}
                                className="jb-article-row"
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-20px' }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={shouldReduceMotion ? {} : { x: 8 }}
                                whileTap={tapPress}
                                onClick={() => onTopicClick(a.topic)}
                            >
                                <span className="jb-article-num">{a.num}</span>
                                <div className="jb-article-body">
                                    <span className="jb-article-cat">{a.category}</span>
                                    <h3 className="jb-article-title">{a.title}</h3>
                                    <p className="jb-article-excerpt">{a.excerpt}</p>
                                </div>
                                <span className="jb-article-arrow">
                                    <ArrowRight size={20} />
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 8: FINAL CTA ── */}
            <section className="jb-final-cta">
                <div className="jb-final-cta-seal" aria-hidden="true">⚖</div>
                <motion.div
                    className="jb-final-cta-inner"
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                >
                    <motion.span className="jb-section-eyebrow" variants={fadeUp}>Aaj Hi Shuru Karein</motion.span>
                    <motion.h2 className="jb-final-heading" variants={fadeUp}>
                        Apna sawaal poochein.<br />
                        <em>Farq padta hai.</em>
                    </motion.h2>
                    <motion.p className="jb-final-sub" variants={fadeUp}>
                        Hazar logon ne apne haqqoq jaane, FIR samjhi, aur family disputes resolve kiye.<br />
                        Aapki baari hai.
                    </motion.p>
                    <motion.div className="jb-final-actions" variants={fadeUp}>
                        <motion.button
                            className="jb-btn-primary jb-btn-xl"
                            whileHover={hoverScale}
                            whileTap={tapPress}
                            onClick={onStartChat}
                        >
                            Mashwara Lein — Muft <ArrowRight size={20} />
                        </motion.button>
                    </motion.div>
                    <motion.div className="jb-final-pills" variants={fadeUp}>
                        <span>✓ Koi fees nahi</span>
                        <span>✓ Account optional</span>
                        <span>✓ Urdu + Roman Urdu + English</span>
                        <span>✓ 24/7 available</span>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="jb-footer">
                <div className="jb-footer-inner">
                    <div className="jb-footer-brand">
                        <div className="jb-logo">
                            <span className="jb-logo-mark">⚖</span>
                            <span className="jb-logo-text">JusticeBridge</span>
                        </div>
                        <p>Pakistan ka pehla AI legal assistant. Powered by Google Gemini, backed by Pakistani law corpus.</p>
                    </div>
                    <div className="jb-footer-links">
                        <h4>Rawabat</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Use</a>
                        <a href="#">Contact Support</a>
                    </div>
                    <div className="jb-footer-newsletter">
                        <h4>Updates Payen</h4>
                        <form className="jb-newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="aapki@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <motion.button
                                type="submit"
                                whileHover={hoverScale}
                                whileTap={tapPress}
                            >
                                Subscribe
                            </motion.button>
                        </form>
                    </div>
                </div>
                <div className="jb-footer-bottom">
                    <span>© 2026 JusticeBridge AI. Tamam haqqoq mahfooz hain.</span>
                    <span className="jb-footer-disclaimer">
                        Ye AI legal information hai, professional legal advice nahi.
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Home;
