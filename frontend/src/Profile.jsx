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
        <div className="profile-container animate-fade-in">
            <div className="profile-header">
                <div className="profile-avatar-large">{getInitials(profileData.name)}</div>
                <div className="profile-info">
                    <h1>{profileData.name}</h1>
                    <p>{profileData.role}</p>
                </div>
            </div>

            <div className="profile-grid">
                {/* Account Details */}
                <div className="glass-card profile-card">
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

                        <button className="edit-btn">Edit Profile</button>
                    </div>
                </div>

                {/* Activity & Stats */}
                <div className="glass-card profile-card">
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
                </div>

                {/* Quick Actions */}
                <div className="glass-card profile-card full-width">
                    <div className="card-header">
                        <Settings size={18} />
                        <h3>Settings & Security</h3>
                    </div>
                    <div className="actions-grid">
                        <div className="action-tile">
                            <Shield className="action-icon" />
                            <div className="action-text">
                                <h4>Privacy Policy</h4>
                                <p>Manage your data</p>
                            </div>
                            <ChevronRight className="arrow" />
                        </div>
                        <div className="action-tile">
                            <ExternalLink className="action-icon" />
                            <div className="action-text">
                                <h4>Legal Resources</h4>
                                <p>External law links</p>
                            </div>
                            <ChevronRight className="arrow" />
                        </div>
                        <div className="action-tile logout" onClick={onLogout}>
                            <LogOut className="action-icon" />
                            <div className="action-text">
                                <h4>Logout</h4>
                                <p>End your session</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
