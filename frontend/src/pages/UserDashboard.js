import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Heart, Clock, Star, Award,
  Edit2, Camera, Save, X, Plus, Trash2, Eye,
  Film, BookOpen, Target, Download, LogOut,
  Bell, BellOff, Languages, Moon, Sun, Activity, PieChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { genres } from '../utils/genres';

// Backend API removed - using Firebase Firestore instead

const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl ${className}`}
    whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

const StatsCard = ({ icon: Icon, title, value, subtitle, color = "cinema-blue", onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <GlassCard className="h-full p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}/20`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <h3 className="mb-1 font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </GlassCard>
  </motion.div>
);

const ProfileEditor = ({ profile, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    favorite_genres: [],
    language: 'en',
    theme: 'dark',
    notifications_enabled: true,
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        favorite_genres: profile.favorite_genres || [],
        language: profile.language || 'en',
        theme: profile.theme || 'dark',
        notifications_enabled: profile.notifications_enabled !== false,
        avatar: profile.avatar || null
      });
      if (profile.avatar) {
        // Avatar can be stored in Firebase Storage if needed
        setAvatarPreview(profile.avatar);
      }
    }
  }, [profile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      // Avatar upload can use Firebase Storage if needed
      // For now, use local preview (already set above)
      setIsUploading(false);
      toast.success('Avatar preview updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      setIsUploading(false);
    }
  };

  const toggleGenre = (genreId) => {
    setFormData(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres.includes(genreId)
        ? prev.favorite_genres.filter(id => id !== genreId)
        : [...prev.favorite_genres, genreId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.display_name.trim()) {
      toast.error('Display name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-cinema-dark border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 overflow-hidden border-2 rounded-full bg-white/10 border-white/20">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile" 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-full h-full p-4 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 text-white transition-transform rounded-full cursor-pointer bg-cinema-blue group-hover:scale-110">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {isUploading && (
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Activity className="w-4 h-4" />
                    </motion.div>
                    Uploading...
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-white">Display Name *</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                  placeholder="Enter your display name"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-white">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg resize-none bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                  placeholder="Tell us about yourself..."
                  maxLength={200}
                />
                <div className="text-xs text-right text-gray-500">
                  {formData.bio.length}/200
                </div>
              </div>

              <div>
                <label className="block mb-3 font-medium text-white">Favorite Genres</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {allGenres.map(genre => (
                    <motion.button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.favorite_genres.includes(genre.id)
                          ? 'bg-cinema-blue text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {genre.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="flex items-center block mb-2 font-medium text-white">
                    <Languages className="w-4 h-4 mr-2" />
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                  >
                    <option value="en" className="bg-cinema-dark">English</option>
                    <option value="az" className="bg-cinema-dark">Azərbaycan</option>
                    <option value="tr" className="bg-cinema-dark">Türkçe</option>
                    <option value="ru" className="bg-cinema-dark">Русский</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center block mb-2 font-medium text-white">
                    {formData.theme === 'dark' ? (
                      <Moon className="w-4 h-4 mr-2" />
                    ) : (
                      <Sun className="w-4 h-4 mr-2" />
                    )}
                    Theme
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                  >
                    <option value="dark" className="bg-cinema-dark">Dark</option>
                    <option value="light" className="bg-cinema-dark">Light</option>
                    <option value="system" className="bg-cinema-dark">System</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <label className="flex items-center font-medium text-white">
                  {formData.notifications_enabled ? (
                    <Bell className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <BellOff className="w-4 h-4 mr-2 text-red-400" />
                  )}
                  Email Notifications
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, notifications_enabled: !prev.notifications_enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.notifications_enabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.notifications_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex pt-4 space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center flex-1 px-6 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MultipleProfiles = ({ profiles, onCreateProfile, onDeleteProfile }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    profile_name: '',
    age_group: 'adult',
    content_filter: 'none'
  });

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const ageOrder = { 'kid': 0, 'teen': 1, 'adult': 2 };
      return ageOrder[a.age_group] - ageOrder[b.age_group] || 
             a.profile_name.localeCompare(b.profile_name);
    });
  }, [profiles]);

  const handleCreateProfile = () => {
    if (!newProfile.profile_name.trim()) {
      toast.error('Profile name is required');
      return;
    }
    onCreateProfile(newProfile);
    setNewProfile({ profile_name: '', age_group: 'adult', content_filter: 'none' });
    setShowCreateForm(false);
  };

  const ageGroups = [
    { value: 'kid', label: 'Kids (Under 13)', icon: '👶', color: 'bg-blue-400' },
    { value: 'teen', label: 'Teen (13-17)', icon: '🧒', color: 'bg-purple-400' },
    { value: 'adult', label: 'Adult (18+)', icon: '👤', color: 'bg-green-400' }
  ];

  const contentFilters = [
    { value: 'none', label: 'No Filter', description: 'All content', icon: <Eye className="w-4 h-4 mr-2" /> },
    { value: 'mild', label: 'Mild Filter', description: 'Family-friendly content', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { value: 'strict', label: 'Strict Filter', description: 'Kids content only', icon: <Target className="w-4 h-4 mr-2" /> }
  ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Family Profiles</h3>
        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-2 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
        >
          <Plus className="w-4 h-4" />
          <span>Add Profile</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProfiles.map(profile => (
          <motion.div 
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative p-4 rounded-lg bg-white/10 group"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{profile.profile_name}</h4>
              <button
                onClick={() => onDeleteProfile(profile.id)}
                className="text-red-400 transition-colors opacity-0 hover:text-red-300 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Age Group:</span>
                <span className={`px-2 py-1 rounded text-xs capitalize ${
                  profile.age_group === 'kid' ? 'bg-blue-400/20 text-blue-300' :
                  profile.age_group === 'teen' ? 'bg-purple-400/20 text-purple-300' :
                  'bg-green-400/20 text-green-300'
                }`}>
                  {profile.age_group}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Filter:</span>
                <span className="text-white capitalize">{profile.content_filter}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-white/20"
          >
            <h4 className="mb-4 font-semibold text-white">Create New Profile</h4>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-white">Profile Name *</label>
                <input
                  type="text"
                  value={newProfile.profile_name}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, profile_name: e.target.value }))}
                  className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                  placeholder="Enter profile name"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-white">Age Group</label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {ageGroups.map(ageGroup => (
                    <motion.button
                      key={ageGroup.value}
                      type="button"
                      onClick={() => setNewProfile(prev => ({ ...prev, age_group: ageGroup.value }))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        newProfile.age_group === ageGroup.value
                          ? `${ageGroup.color}/90 text-white`
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <div className="mb-1 text-lg">{ageGroup.icon}</div>
                      <div className="font-medium">{ageGroup.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-white">Content Filter</label>
                <div className="space-y-2">
                  {contentFilters.map(filter => (
                    <motion.label
                      key={filter.value}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                        newProfile.content_filter === filter.value
                          ? 'bg-cinema-blue/20 border border-cinema-blue'
                          : 'bg-white/10 border border-transparent hover:bg-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="content_filter"
                        value={filter.value}
                        checked={newProfile.content_filter === filter.value}
                        onChange={(e) => setNewProfile(prev => ({ ...prev, content_filter: e.target.value }))}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="flex items-center font-medium text-white">
                          {filter.icon}
                          {filter.label}
                        </div>
                        <div className="mt-1 text-sm text-gray-400">{filter.description}</div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  onClick={handleCreateProfile}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                  disabled={!newProfile.profile_name.trim()}
                >
                  Create Profile
                </motion.button>
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

const WatchHistory = ({ history }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  const filteredHistory = useMemo(() => {
    let result = [...history];
    
    if (filter === 'completed') {
      result = result.filter(item => item.completed);
    } else if (filter === 'in-progress') {
      result = result.filter(item => !item.completed);
    }
    
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));
    } else if (sortBy === 'duration') {
      result.sort((a, b) => b.watch_duration - a.watch_duration);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.movie_title.localeCompare(b.movie_title));
    }
    
    return result;
  }, [history, filter, sortBy]);

  const getWatchTimePercentage = (duration, totalDuration) => {
    if (totalDuration === 0) return 0;
    return (duration / totalDuration) * 100;
  };

  const totalWatchTime = useMemo(() => {
    return history.reduce((sum, item) => sum + item.watch_duration, 0);
  }, [history]);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col justify-between mb-6 md:flex-row md:items-center">
        <h3 className="mb-4 text-xl font-bold text-white md:mb-0">Recent Activity</h3>
        <div className="flex space-x-4">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 pr-8 text-sm text-white border rounded-lg appearance-none bg-white/10 border-white/20 focus:outline-none focus:border-cinema-blue"
            >
              <option value="all">All Activities</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 pr-8 text-sm text-white border rounded-lg appearance-none bg-white/10 border-white/20 focus:outline-none focus:border-cinema-blue"
            >
              <option value="recent">Sort by Recent</option>
              <option value="duration">Sort by Duration</option>
              <option value="title">Sort by Title</option>
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400">Total Watched</div>
          <div className="font-semibold text-white">{history.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400">Completed</div>
          <div className="font-semibold text-white">{history.filter(h => h.completed).length}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <div className="text-sm text-gray-400">Total Time</div>
          <div className="font-semibold text-white">
            {Math.round(totalWatchTime / 60)}h {totalWatchTime % 60}m
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-96">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(item => (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center p-3 space-x-4 rounded-lg bg-white/5"
            >
              <div className="flex items-center justify-center w-16 h-24 overflow-hidden bg-gray-600 rounded-lg">
                {item.movie_poster ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${item.movie_poster}`} 
                    alt={item.movie_title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Film className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{item.movie_title}</h4>
                <div className="flex items-center mt-1 space-x-4 text-sm text-gray-400">
                  <span>Watched: {item.progress_percentage.toFixed(0)}%</span>
                  <span>{new Date(item.watched_at).toLocaleDateString()}</span>
                </div>
                <div className="w-full h-2 mt-2 bg-gray-700 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      item.completed ? 'bg-green-500' : 'bg-cinema-blue'
                    }`}
                    style={{ width: `${item.progress_percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {getWatchTimePercentage(item.watch_duration, totalWatchTime).toFixed(1)}% of your total watch time
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">
                  {Math.round(item.watch_duration / 60)}h {item.watch_duration % 60}m
                </div>
                {item.completed && (
                  <div className="flex items-center justify-end space-x-1 text-sm text-green-400">
                    <Award className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                )}
                {item.rating && (
                  <div className="flex items-center justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(item.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">No viewing history yet</p>
            <p className="mt-1 text-sm text-gray-500">Start watching movies to see them here</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { favorites } = useFavorites();
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Backend API removed - using Firebase Firestore instead
      // Profile data can be stored in Firestore if needed
      if (currentUser) {
        setProfile({
          user_id: currentUser.uid,
          display_name: currentUser.displayName || 'User',
          language: 'en',
          theme: 'dark'
        });
      }
      
      // Profiles, watch history, and stats can be implemented with Firebase if needed

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = useCallback(async (updatedData) => {
    try {
      // Backend API removed - save to Firebase Firestore if needed
      setProfile(prev => ({ ...prev, ...updatedData }));
      setShowProfileEditor(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }, []);

  const handleCreateProfile = useCallback(async (profileData) => {
    try {
      // Backend API removed - save to Firebase Firestore if needed
      const newProfile = { ...profileData, id: Date.now().toString(), created_at: new Date().toISOString() };
      setProfiles(prev => [...prev, newProfile]);
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  }, []);

  const handleDeleteProfile = useCallback(async (profileId) => {
    try {
      // Backend API removed - delete from Firebase Firestore if needed
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      toast.success('Profile deleted successfully!');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const handleStatCardClick = useCallback((statName) => {
    switch(statName) {
      case 'Watch Time':
        setActiveTab('activity');
        break;
      case 'Movies Watched':
        setActiveTab('activity');
        break;
      case 'Favorites':
        navigate('/favorites');
        break;
      case 'Average Rating':
        setActiveTab('ratings');
        break;
      default:
        break;
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cinema-darker">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center"
        >
          <Film className="w-12 h-12 mb-4 text-cinema-blue" />
          <span className="text-white">Loading your dashboard...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-cinema-darker sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
                Welcome back, {profile?.display_name || currentUser?.displayName || 'User'}!
              </h1>
              <p className="text-gray-400">Manage your profile and view your movie journey</p>
            </div>
            <div className="flex mt-4 space-x-3 md:mt-0">
              <motion.button
                onClick={() => setShowProfileEditor(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue sm:px-6 sm:py-3 hover:bg-cinema-blue/80"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Edit Profile</span>
              </motion.button>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 space-x-2 font-semibold text-white transition-colors rounded-lg sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>

          <div className="flex border-b border-white/10">
            {['overview', 'activity', 'ratings', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'text-cinema-blue border-b-2 border-cinema-blue'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatsCard
              icon={Clock}
              title="Watch Time"
              value={`${userStats.total_watch_time_hours || 0}h`}
              subtitle="Total hours watched"
              onClick={() => handleStatCardClick('Watch Time')}
            />
            <StatsCard
              icon={Film}
              title="Movies Watched"
              value={userStats.movies_completed || 0}
              subtitle="Completed movies"
              color="green-400"
              onClick={() => handleStatCardClick('Movies Watched')}
            />
            <StatsCard
              icon={Heart}
              title="Favorites"
              value={favorites.length}
              subtitle="Movies in favorites"
              color="red-400"
              onClick={() => handleStatCardClick('Favorites')}
            />
            <StatsCard
              icon={Star}
              title="Average Rating"
              value={userStats.average_rating_given?.toFixed(1) || '0.0'}
              subtitle="Your average rating"
              color="yellow-400"
              onClick={() => handleStatCardClick('Average Rating')}
            />
          </motion.div>
        )}

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MultipleProfiles
                profiles={profiles}
                onCreateProfile={handleCreateProfile}
                onDeleteProfile={handleDeleteProfile}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WatchHistory history={watchHistory} />
            </motion.div>
          </div>
        ) : activeTab === 'activity' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-cinema-dark/50 rounded-xl"
          >
            <h2 className="mb-6 text-2xl font-bold text-white">Your Activity</h2>
            <WatchHistory history={watchHistory} />
          </motion.div>
        ) : activeTab === 'ratings' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-cinema-dark/50 rounded-xl"
          >
            <h2 className="mb-6 text-2xl font-bold text-white">Your Ratings</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <GlassCard className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Rating Distribution</h3>
                <div className="flex items-center justify-center h-64">
                  <PieChart className="w-32 h-32 text-cinema-blue" />
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Top Rated Movies</h3>
                <div className="space-y-4">
                  {watchHistory
                    .filter(item => item.rating)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="font-medium text-gray-400">{index + 1}.</div>
                        <div className="flex-1">
                          <h4 className="text-white">{item.movie_title}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(item.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-400">{item.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-cinema-dark/50 rounded-xl"
          >
            <h2 className="mb-6 text-2xl font-bold text-white">Account Settings</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <GlassCard className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Preferences</h3>
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <span>Edit Profile</span>
                  <Edit2 className="w-4 h-4" />
                </button>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Data</h3>
                <button className="flex items-center justify-between w-full px-4 py-3 mb-3 text-left text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20">
                  <span>Export Data</span>
                  <Download className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-between w-full px-4 py-3 text-left text-red-400 transition-colors rounded-lg bg-red-500/10 hover:bg-red-500/20">
                  <span>Delete Account</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            </div>
          </motion.div>
        )}

        <ProfileEditor
          profile={profile}
          isOpen={showProfileEditor}
          onClose={() => setShowProfileEditor(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
};

export default UserDashboard;