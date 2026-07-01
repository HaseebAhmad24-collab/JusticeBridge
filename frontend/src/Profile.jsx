import React, { useState } from 'react';
import {
    User,
    Mail,
    Clock,
    Settings,
    Shield,
    LogOut,
    ChevronRight,
    ExternalLink,
    Edit2,
    X,
    Check,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './Profile.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ROLES = ['Legal Researcher', 'Law Student', 'Litigant', 'Legal Enthusiast'];

const Profile = ({ user, conversations = [], onLogout, token, onProfileUpdate }) => {
    const profileData = user || {
        name: "Guest User",
        email: "guest@justicebridge.com",
        joined: "Today",
        role: "Legal Enquirer"
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState(profileData.name);
    const [editRole, setEditRole] = useState(profileData.role);
    const [saving, setSaving] = useState(false);

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const openEdit = () => {
        setEditName(profileData.name);
        setEditRole(profileData.role);
        setShowEditModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const trimmedName = editName.trim();
        if (!trimmedName) {
            toast.error('Name cannot be empty.');
            return;
        }
        if (trimmedName === profileData.name && editRole === profileData.role) {
            setShowEditModal(false);
            return;
        }
        setSaving(true);
        try {
            const response = await fetch(`${API}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: trimmedName, role: editRole })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to update profile.');
            }
            onProfileUpdate && onProfileUpdate(data);
            toast.success('Profile updated successfully!');
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <motion.div
                className="profile-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <motion.div
                    className="profile-header"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
                >
                    <div className="profile-avatar-large">{getInitials(profileData.name)}</div>
                    <div className="profile-info">
                        <h1>{profileData.name}</h1>
                        <p>{profileData.role}</p>
                    </div>
                </motion.div>

                <motion.div
                    className="profile-grid"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                >
                    {/* Account Details */}
                    <motion.div
                        className="glass-card profile-card"
                        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }}
                        whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    >
                        <div className="card-header">
                            <User size={18} />
                            <h3>Account Details</h3>
                        </div>
                        <div className="card-content">
                            <div className="info-row">
                                <div className="info-label">Full Name</div>
                                <div className="info-value">{profileData.name}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Email</div>
                                <div className="info-value">{profileData.email}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Role</div>
                                <div className="info-value">{profileData.role}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Member Since</div>
                                <div className="info-value">{profileData.joined}</div>
                            </div>
                            <motion.button
                                className="edit-btn"
                                onClick={openEdit}
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Edit2 size={14} />
                                Edit Profile
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Activity & Stats */}
                    <motion.div
                        className="glass-card profile-card"
                        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }}
                        whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    >
                        <div className="card-header">
                            <Clock size={18} />
                            <h3>Recent Activity</h3>
                        </div>
                        <div className="card-content activity-list">
                            {conversations.length > 0 ? (
                                conversations.slice(0, 4).map(chat => (
                                    <div key={chat.id} className="activity-item">
                                        <span>Started chat: "{chat.title}"</span>
                                        <small>{formatTimeAgo(chat.timestamp)}</small>
                                    </div>
                                ))
                            ) : (
                                <div className="activity-item empty">
                                    <span>No recent activity found.</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="glass-card profile-card full-width"
                        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }}
                    >
                        <div className="card-header">
                            <Settings size={18} />
                            <h3>Settings &amp; Security</h3>
                        </div>
                        <div className="actions-grid">
                            <motion.div className="action-tile" whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                                <Shield className="action-icon" />
                                <div className="action-text">
                                    <h4>Privacy Policy</h4>
                                    <p>Manage your data</p>
                                </div>
                                <ChevronRight className="arrow" />
                            </motion.div>
                            <motion.div className="action-tile" whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                                <ExternalLink className="action-icon" />
                                <div className="action-text">
                                    <h4>Legal Resources</h4>
                                    <p>External law links</p>
                                </div>
                                <ChevronRight className="arrow" />
                            </motion.div>
                            <motion.div className="action-tile logout" onClick={onLogout} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                                <LogOut className="action-icon" />
                                <div className="action-text">
                                    <h4>Logout</h4>
                                    <p>End your session</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        className="edit-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            className="edit-modal glass-card"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="edit-modal-header">
                                <h3>Edit Profile</h3>
                                <button className="edit-modal-close" onClick={() => setShowEditModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="edit-modal-form">
                                <div className="edit-field">
                                    <label>
                                        <User size={14} />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Your full name"
                                        maxLength={80}
                                        required
                                    />
                                </div>

                                <div className="edit-field">
                                    <label>
                                        <Briefcase size={14} />
                                        Role / Profession
                                    </label>
                                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                                        {ROLES.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="edit-modal-note">
                                    <Mail size={13} />
                                    <span>Email address cannot be changed.</span>
                                </div>

                                <div className="edit-modal-actions">
                                    <button type="button" className="edit-cancel-btn" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        className="edit-save-btn"
                                        disabled={saving}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {saving ? 'Saving...' : (
                                            <>
                                                <Check size={14} />
                                                Save Changes
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Profile;
