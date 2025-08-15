import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, Heart, Trash2, Key, Edit3, 
  Shield, Save, X, AlertTriangle, Loader, Star, Clock, Award, Zap,
  Film, Settings, LogOut, ChevronRight, Crown, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../components/NotificationToast';
import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { storage } from '../firebase';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, logout, reloadUser } = useAuth();
  const { favorites, getFavoritesCount } = useFavorites();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [stats, setStats] = useState({
    favoritesCount: 0,
    averageRating: 0,
    recentlyAdded: 0,
    highestRated: null
  });

  useEffect(() => {
    if (currentUser?.photoURL) {
      setAvatarPreview(currentUser.photoURL);
    }
  }, [currentUser]);

  useEffect(() => {
    const calculateStats = () => {
      const count = favorites.length;
      const totalRating = favorites.reduce((sum, fav) => sum + parseFloat(fav.rating || 0), 0);
      const avg = count > 0 ? (totalRating / count).toFixed(1) : 0;
      
      const recentlyAddedCount = favorites.filter(fav => {
        const addedDate = new Date(fav.addedAt || currentUser.metadata.creationTime);
        return (new Date() - addedDate) < 30 * 24 * 60 * 60 * 1000;
      }).length;
      
      const highestRated = [...favorites].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      
      setStats({
        favoritesCount: count,
        averageRating: avg,
        recentlyAdded: recentlyAddedCount,
        highestRated: highestRated || null
      });
    };

    calculateStats();
  }, [favorites, currentUser]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const updates = {};
      let photoURL = currentUser.photoURL;
      
      if (avatarFile) {
        const fileRef = storageRef(storage, `avatars/${currentUser.uid}`);
        await uploadBytes(fileRef, avatarFile);
        photoURL = await getDownloadURL(fileRef);
        updates.photoURL = photoURL;
      }
      
      if (displayName !== currentUser.displayName) {
        updates.displayName = displayName;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateProfile(currentUser, updates);
        await reloadUser();
        success('Profile updated successfully');
      }
      
      setEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
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
      
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
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
      await deleteUser(currentUser);
      warning('Account deleted successfully');
      await logout();
      navigate('/');
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
    
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-cinema-darker">
      <div className="max-w-6xl px-4 mx-auto sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center mb-4 space-x-3">
            <div className="relative group">
              <div className="flex items-center justify-center w-24 h-24 overflow-hidden border-4 rounded-full bg-cinema-blue/20 border-cinema-blue/30">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile" 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-12 h-12 text-cinema-blue" />
                )}
              </div>
              {editing && (
                <label className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100">
                  <Edit3 className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
              <div className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-2 rounded-full -bottom-2 -right-2 border-cinema-darker">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          {editing ? (
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 mb-2 text-2xl font-bold text-center text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
              />
            </div>
          ) : (
            <h1 className="mb-2 text-4xl font-bold text-white">
              {currentUser?.displayName || 'Movie Enthusiast'}
            </h1>
          )}
          <p className="text-gray-400">
            Member since {formatDate(currentUser?.metadata?.creationTime)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Account Information</h2>
                <div className="flex items-center space-x-3">
                  {editing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(false)}
                        className="flex items-center space-x-2 text-gray-400 transition-colors hover:text-white"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        <span>Save</span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(true)}
                      className="flex items-center space-x-2 transition-colors text-cinema-blue hover:text-cinema-blue/80"
                    >
                      <Edit3 className="w-5 h-5" />
                      <span>Edit</span>
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm text-gray-400">Email</label>
                    <p className="text-white">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm text-gray-400">Display Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="px-3 py-1 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-1 focus:ring-cinema-blue"
                      />
                    ) : (
                      <p className="text-white">{currentUser?.displayName || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm text-gray-400">Account Age</label>
                    <p className="text-white">{getAccountAge()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm text-gray-400">Account Status</label>
                    <span className="inline-flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-400">Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Security Settings</h2>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center justify-between w-full p-4 transition-colors rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-cinema-blue" />
                    <div className="text-left">
                      <h3 className="font-medium text-white">Change Password</h3>
                      <p className="text-sm text-gray-400">Update your account password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="flex items-center justify-between w-full p-4 transition-colors rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5 text-yellow-400" />
                    <div className="text-left">
                      <h3 className="font-medium text-white">Log Out</h3>
                      <p className="text-sm text-gray-400">Sign out of your account</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-between w-full p-4 transition-colors border rounded-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <h3 className="font-medium text-red-400">Delete Account</h3>
                      <p className="text-sm text-red-300">Permanently delete your account and data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
              <h3 className="mb-6 text-xl font-bold text-white">Your Stats</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-cinema-blue/20">
                      <Heart className="w-5 h-5 text-cinema-blue" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.favoritesCount}</div>
                    <div className="text-xs text-gray-400">Favorites</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/20">
                      <Star className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.averageRating}</div>
                    <div className="text-xs text-gray-400">Avg Rating</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/20">
                      <Clock className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.recentlyAdded}</div>
                    <div className="text-xs text-gray-400">Recent</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20">
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.highestRated ? stats.highestRated.rating : '0.0'}
                    </div>
                    <div className="text-xs text-gray-400">Top Rated</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Account Type</span>
                    <span className="flex items-center font-semibold text-cinema-blue">
                      <Crown className="w-4 h-4 mr-1" />
                      Free
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Active</span>
                    <span className="font-semibold text-white">
                      {formatDate(currentUser?.metadata?.lastSignInTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
              <h3 className="mb-6 text-xl font-bold text-white">Quick Actions</h3>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/favorites')}
                  className="flex items-center justify-between w-full px-4 py-3 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                >
                  <span>View Favorites</span>
                  <Film className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className="flex items-center justify-between w-full px-4 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <span>Discover Movies</span>
                  <Zap className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/settings')}
                  className="flex items-center justify-between w-full px-4 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <span>App Settings</span>
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 border bg-cinema-dark border-white/20 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Change Password</h3>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-white">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-white">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-white">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cinema-blue"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center flex-1 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80 disabled:opacity-50"
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
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 border bg-cinema-dark border-red-500/30 rounded-xl"
            >
              <div className="flex items-center mb-6 space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h3 className="text-xl font-bold text-white">Delete Account</h3>
              </div>

              <div className="mb-6">
                <p className="mb-4 text-gray-300">
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </p>
                <p className="mb-4 font-medium text-red-400">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirmText !== 'DELETE'}
                  className="flex items-center justify-center flex-1 py-3 space-x-2 font-semibold text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
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
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;