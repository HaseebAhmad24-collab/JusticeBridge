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
import toast from 'react-hot-toast';
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
                // OAuth2PasswordRequestForm expects form-data
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
                // User-friendly error messages
                if (response.status === 401) {
                    throw new Error("Incorrect email or password. Please try again.");
                } else if (response.status === 404) {
                    // Handling potential 404 if we add check for user existence
                    throw new Error("Account not found. Please register first.");
                } else if (data.detail === "Email already registered") {
                    throw new Error("This email is already registered. Please login instead.");
                }
                throw new Error(data.detail || 'Authentication failed');
            }

            // data.access_token, data.user
            onLoginSuccess(data.user, data.access_token);
            toast.success(isLogin ? "Logged in successfully!" : "Registration successful!");
        } catch (error) {
            console.error('Auth Error:', error);
            // Show specific error messages to user
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-card glass-card animate-fade-in">
                <button className="back-btn" onClick={onBack} title="Back to Home">
                    <X size={24} />
                </button>

                <div className="auth-header">
                    <div className="auth-logo">
                        <Scale size={40} />
                    </div>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Enter your legal credentials to continue' : 'Join JusticeBridge for advanced legal aid'}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
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
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
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
                        <button
                            type="button"
                            className="eye-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Complete Registration')}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>Or continue with</span>
                </div>

                <div className="social-auth">
                    <button className="social-btn google" title="Continue with Google">
                        <Chrome size={20} />
                    </button>
                    <button className="social-btn facebook" title="Continue with Facebook">
                        <Facebook size={20} />
                    </button>
                </div>

                <div className="auth-footer">
                    {isLogin ? (
                        <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></p>
                    ) : (
                        <p>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;

