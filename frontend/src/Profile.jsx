import React from 'react';
import {
    User,
    Mail,
    Clock,
    Settings,
    Shield,
    LogOut,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Profile.css';

const Profile = ({ user, conversations = [], onLogout }) => {
    const profileData = user || {
        name: "Guest User",
        email: "guest@justicebridge.com",
        joined: "Today",
        role: "Legal Enquirer"
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Format timestamp to "X hours/days ago" or "Just now"
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

    return (
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
                            <div className="info-label">Email</div>
                            <div className="info-value">{profileData.email}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Member Since</div>
                            <div className="info-value">{profileData.joined}</div>
                        </div>
                        <motion.button
                            className="edit-btn"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                        >Edit Profile</motion.button>
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
    );
};

export default Profile;
