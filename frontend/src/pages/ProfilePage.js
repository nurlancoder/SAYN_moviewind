import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Heart, Trash2, Key, Edit3, 
  Shield, Save, X, AlertTriangle, Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../components/NotificationToast';
import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const { favorites } = useFavorites();
  const { success, error: showError, warning } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, passwordData.newPassword);
      
      success('Password updated successfully');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        showError('Current password is incorrect');
      } else {
        showError('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showError('Please type "DELETE" to confirm');
      return;
    }

    try {
      setLoading(true);
      
      // Delete user account
      await deleteUser(currentUser);
      
      warning('Account deleted successfully');
      
      // Logout and redirect
      await logout();
      
    } catch (error) {
      console.error('Account deletion error:', error);
      if (error.code === 'auth/requires-recent-login') {
        showError('Please log out and log back in to delete your account');
      } else {
        showError('Failed to delete account');
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getAccountAge = () => {
    if (!currentUser?.metadata?.creationTime) return 'Unknown';
    
    const createdDate = new Date(currentUser.metadata.creationTime);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <div className="min-h-screen bg-cinema-darker pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-cinema-blue/20 rounded-full flex items-center justify-center border-4 border-cinema-blue/30">
                <User className="w-12 h-12 text-cinema-blue" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-cinema-darker"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {currentUser?.displayName || 'Movie Enthusiast'}
          </h1>
          <p className="text-gray-400">
            Member since {formatDate(currentUser?.metadata?.creationTime)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Account Information */}
            <div className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Account Information</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(!editing)}
                  className="flex items-center space-x-2 text-cinema-blue hover:text-cinema-blue/80 transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>{editing ? 'Cancel' : 'Edit'}</span>
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-gray-400 text-sm">Email</label>
                    <p className="text-white">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-gray-400 text-sm">Display Name</label>
                    <p className="text-white">{currentUser?.displayName || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-gray-400 text-sm">Account Age</label>
                    <p className="text-white">{getAccountAge()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-gray-400 text-sm">Account Status</label>
                    <span className="inline-flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-400">Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-cinema-blue" />
                    <div className="text-left">
                      <h3 className="text-white font-medium">Change Password</h3>
                      <p className="text-gray-400 text-sm">Update your account password</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <h3 className="text-red-400 font-medium">Delete Account</h3>
                      <p className="text-red-300 text-sm">Permanently delete your account and data</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Statistics */}
            <div className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Your Stats</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-cinema-blue/20 rounded-full mx-auto mb-3">
                    <Heart className="w-8 h-8 text-cinema-blue" />
                  </div>
                  <div className="text-3xl font-bold text-white">{favorites.length}</div>
                  <div className="text-gray-400 text-sm">Favorite Movies</div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Rating</span>
                    <span className="text-white font-semibold">
                      {favorites.length > 0 
                        ? (favorites.reduce((sum, fav) => sum + parseFloat(fav.rating || 0), 0) / favorites.length).toFixed(1)
                        : '0.0'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Type</span>
                  <span className="text-cinema-blue font-semibold">Free</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <motion.a
                  href="/favorites"
                  whileHover={{ scale: 1.02 }}
                  className="block w-full text-center bg-cinema-blue text-white py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors"
                >
                  View Favorites
                </motion.a>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => window.location.href = '/'}
                  className="block w-full text-center bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  Discover Movies
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-cinema-dark border border-white/20 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cinema-blue text-white py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-cinema-dark border border-red-500/30 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">Delete Account</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </p>
              <p className="text-red-400 font-medium mb-4">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-red-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== 'DELETE'}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;