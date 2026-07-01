import React, { useState } from 'react';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Facebook,
    Chrome,
    Scale,
    X,
    Eye,
    EyeOff,
    Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Auth = ({ onLoginSuccess, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Legal Enthusiast'
    });

    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [successEmail, setSuccessEmail] = useState('');
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    // Forgot Password states
    const [showForgotMode, setShowForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);

    const handleResendVerification = async () => {
        const emailToUse = unverifiedEmail || formData.email;
        if (!emailToUse) {
            toast.error("Please enter your email address first.");
            return;
        }
        setResendLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToUse })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Verification email resent! Please check your inbox.");
                setUnverifiedEmail(""); // clear error state
            } else {
                throw new Error(data.detail || "Failed to resend verification email.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setResendLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            toast.error("Please enter your email address.");
            return;
        }
        setForgotLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await response.json();
            if (response.ok) {
                setForgotSuccess(true);
            } else {
                throw new Error(data.detail || "Something went wrong.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_token: credentialResponse.credential })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Google Authentication failed');
            }
            onLoginSuccess(data.user, data.access_token);
            toast.success("Logged in with Google successfully!");
        } catch (error) {
            console.error('Google Auth Error:', error);
            toast.error(error.message || "Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error("Google Sign-In failed. Please try again.");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return false;
        }
        if (!isLogin && !formData.name.trim()) {
            toast.error("Please enter your full name");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            let response;
            if (isLogin) {
                const params = new URLSearchParams();
                params.append('username', formData.email);
                params.append('password', formData.password);
                response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params
                });
            } else {
                response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 403 && data.detail && data.detail.includes("verify")) {
                    setUnverifiedEmail(formData.email);
                    throw new Error(data.detail);
                }
                if (response.status === 400 && data.detail && data.detail.includes("Google Sign-In")) {
                    throw new Error("This account was registered with Google. Please use 'Sign in with Google' below.");
                }
                if (response.status === 401) throw new Error("Incorrect email or password. Please try again.");
                else if (response.status === 404) throw new Error("Account not found. Please register first.");
                else if (data.detail === "Email already registered") throw new Error("This email is already registered. Please login instead.");
                throw new Error(data.detail || 'Authentication failed');
            }
            
            if (isLogin) {
                onLoginSuccess(data.user, data.access_token);
                toast.success("Logged in successfully!");
            } else {
                setSuccessEmail(formData.email);
                setRegistrationSuccess(true);
                toast.success("Registration successful! Verification email sent.");
            }
        } catch (error) {
            console.error('Auth Error:', error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            <motion.div
                className="auth-card glass-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <button className="back-btn" onClick={onBack} title="Back to Home">
                    <X size={24} />
                </button>

                {registrationSuccess ? (
                    <div className="registration-success" style={{ textAlign: 'center', padding: '30px 10px' }}>
                        <div className="auth-logo" style={{ color: 'var(--legal-blue)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <Scale size={48} />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#fff' }}>Verify Your Email</h2>
                        <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '25px', fontSize: '15px' }}>
                            A verification email has been sent to <strong>{successEmail}</strong>.<br/>
                            Please check your inbox and click the activation link to activate your account.
                        </p>
                        <button className="auth-submit-btn" onClick={() => {
                            setRegistrationSuccess(false);
                            setUnverifiedEmail("");
                            setIsLogin(true);
                        }}>
                            Go to Login
                        </button>
                    </div>
                ) : showForgotMode ? (
                    <div className="registration-success" style={{ textAlign: 'center', padding: '30px 10px' }}>
                        <div className="auth-logo" style={{ color: 'var(--legal-blue)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <Scale size={48} />
                        </div>
                        {forgotSuccess ? (
                            <>
                                <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#fff' }}>Check Your Email</h2>
                                <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '25px', fontSize: '15px' }}>
                                    If this email is registered, a password reset link has been sent to it. Please check your inbox.
                                </p>
                                <button className="auth-submit-btn" onClick={() => {
                                    setShowForgotMode(false);
                                    setForgotSuccess(false);
                                    setForgotEmail('');
                                    setIsLogin(true);
                                }}>
                                    Back to Login
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#fff' }}>Forgot Password?</h2>
                                <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '20px', fontSize: '14px' }}>
                                    Enter your registered email address and we'll send you a reset link.
                                </p>
                                <form onSubmit={handleForgotPassword} className="auth-form">
                                    <div className="input-group">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className="auth-submit-btn"
                                        disabled={forgotLoading}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                        {!forgotLoading && <ArrowRight size={18} />}
                                    </motion.button>
                                </form>
                                <p style={{ marginTop: '18px', color: '#94a3b8', fontSize: '13px' }}>
                                    Remember your password?{' '}
                                    <span
                                        onClick={() => { setShowForgotMode(false); setIsLogin(true); }}
                                        style={{ color: 'var(--legal-blue)', cursor: 'pointer' }}
                                    >
                                        Back to Login
                                    </span>
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="auth-header">
                            <div className="auth-logo">
                                <Scale size={40} />
                            </div>
                            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                            <p>{isLogin ? 'Enter your legal credentials to continue' : 'Join JusticeBridge for advanced legal aid'}</p>
                        </div>

                        {unverifiedEmail && (
                            <div className="unverified-warning" style={{ 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1px solid rgba(239, 68, 68, 0.3)', 
                                borderRadius: '8px', 
                                padding: '15px', 
                                margin: '15px 0', 
                                textAlign: 'center' 
                            }}>
                                <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '10px' }}>
                                    Your email is not verified yet.
                                </p>
                                <button 
                                    type="button" 
                                    className="resend-btn-warning"
                                    onClick={handleResendVerification}
                                    disabled={resendLoading}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid var(--glass-border)',
                                        color: '#fff',
                                        padding: '8px 15px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    {resendLoading ? 'Resending...' : 'Resend Verification Link'}
                                </button>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <>
                                    <div className="input-group">
                                        <User className="input-icon" size={18} />
                                        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="input-group">
                                        <Briefcase className="input-icon" size={18} />
                                        <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
                                            <option value="Legal Researcher">Legal Researcher</option>
                                            <option value="Law Student">Law Student</option>
                                            <option value="Litigant">Litigant</option>
                                            <option value="Legal Enthusiast">Legal Enthusiast</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="input-group">
                                <Mail className="input-icon" size={18} />
                                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="input-group password-group">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {isLogin && (
                                <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '10px' }}>
                                    <span
                                        onClick={() => { setShowForgotMode(true); setForgotSuccess(false); setForgotEmail(''); }}
                                        style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Forgot Password?
                                    </span>
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                            >
                                {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Complete Registration')}
                                {!loading && <ArrowRight size={18} />}
                            </motion.button>
                        </form>

                        <div className="auth-divider"><span>Or continue with</span></div>

                        <div className="google-auth-container" style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                shape="pill"
                                size="large"
                                width="360"
                            />
                        </div>

                        <div className="auth-footer">
                            {isLogin ? (
                                <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></p>
                            ) : (
                                <p>Already have an account? <span onClick={() => { setIsLogin(true); setUnverifiedEmail(""); }}>Login</span></p>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Auth;
