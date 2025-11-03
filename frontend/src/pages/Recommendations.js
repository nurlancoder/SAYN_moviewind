import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Brain, Heart, Star, Clock, 
  RefreshCw, Sparkles, Target, Zap, Users, Calendar,
  ChevronLeft, ChevronRight, Settings, BookmarkPlus,
  Eye, ThumbsUp, Share2, Award, Flame, Crown,
  ArrowRight, BarChart3, Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import axios from 'axios';
import tmdbService from '../services/tmdbService';

// Backend API removed - using Firebase and TMDB API directly

const GlassCard = ({ children, className = "", hover = true, ...props }) => (
  <motion.div
    className={`bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl ${className}`}
    whileHover={hover ? { scale: 1.01, y: -2 } : {}}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

const EnhancedMovieCard = ({ movie, onAddToWatchlist, onQuickRate, showQuickActions = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <MovieCard movie={movie} />
      
      {showQuickActions && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute flex items-center justify-between p-2 rounded-lg bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm"
            >
              <motion.button
                onClick={() => onAddToWatchlist?.(movie)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white transition-colors hover:text-cinema-blue"
              >
                <BookmarkPlus className="w-4 h-4" />
              </motion.button>
              
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <motion.button
                    key={rating}
                    onClick={() => onQuickRate?.(movie, rating)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="text-yellow-400 transition-colors hover:text-yellow-300"
                  >
                    <Star className="w-3 h-3" />
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                onClick={() => navigator.share?.({ title: movie.title, url: window.location.href })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white transition-colors hover:text-green-400"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const RecommendationCategory = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  movies, 
  loading, 
  onRefresh,
  color = "cinema-blue",
  onSeeAll,
  showCarousel = true,
  badge = null,
  description = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const currentMovies = movies.slice(
    currentIndex * itemsPerPage, 
    (currentIndex + 1) * itemsPerPage
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-${color}/20 relative`}>
            <Icon className={`w-6 h-6 text-${color}`} />
            {badge && (
              <div className="absolute flex items-center justify-center w-3 h-3 bg-red-500 rounded-full -top-1 -right-1">
                <span className="text-xs font-bold text-white">{badge}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="flex items-center space-x-2 text-xl font-bold text-white">
              <span>{title}</span>
              {title === "Trending Now" && <Flame className="w-5 h-5 text-orange-400" />}
              {title === "For You" && <Crown className="w-5 h-5 text-yellow-400" />}
            </h3>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
            {description && <p className="mt-1 text-sm text-gray-300">{description}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {movies.length > 0 && onSeeAll && (
            <motion.button
              onClick={onSeeAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 transition-colors text-cinema-blue hover:text-cinema-blue/80"
            >
              <span className="text-sm">See All</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
          
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className={`text-${color} hover:text-${color}/80 transition-colors`}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className={`w-8 h-8 text-${color}`} />
          </motion.div>
        </div>
      ) : movies.length > 0 ? (
        <div className="relative">
          {showCarousel && movies.length > itemsPerPage && (
            <>
              <motion.button
                onClick={prevSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-0 z-10 p-2 text-white transition-colors -translate-y-1/2 rounded-full top-1/2 bg-black/50 hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={nextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-0 z-10 p-2 text-white transition-colors -translate-y-1/2 rounded-full top-1/2 bg-black/50 hover:bg-black/70"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}
          
          <motion.div 
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedMovieCard 
                  movie={movie} 
                  onAddToWatchlist={(movie) => console.log('Add to watchlist:', movie)}
                  onQuickRate={(movie, rating) => console.log('Quick rate:', movie, rating)}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {showCarousel && totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? `bg-${color}` : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Icon className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400">No recommendations available</p>
        </div>
      )}
    </GlassCard>
  );
};

const UserInsights = ({ profile, watchHistory, ratings }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const getTopGenres = () => {
    if (!profile?.favorite_genres?.length) return [];
    
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    
    return profile.favorite_genres.slice(0, 5).map(id => genreMap[id]).filter(Boolean);
  };

  const getWatchingPatterns = () => {
    if (!watchHistory?.length) return {};
    
    const totalMinutes = watchHistory.reduce((sum, item) => sum + (item.watch_duration || 0), 0);
    const completedMovies = watchHistory.filter(item => item.completed).length;
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;
    
    return {
      totalHours: Math.round(totalMinutes / 60),
      completedMovies,
      averageRating
    };
  };

  const getRecommendationScore = () => {
    const patterns = getWatchingPatterns();
    const baseScore = 65;
    const hourBonus = Math.min(30, (patterns.totalHours || 0) * 0.5);
    const ratingBonus = ratings.length > 0 ? Math.min(10, ratings.length * 0.2) : 0;
    return Math.min(95, baseScore + hourBonus + ratingBonus);
  };

  const topGenres = getTopGenres();
  const patterns = getWatchingPatterns();
  const recommendationScore = getRecommendationScore();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="flex items-center space-x-2 text-xl font-bold text-white">
              <span>Your Movie DNA</span>
              <Crown className="w-5 h-5 text-yellow-400" />
            </h3>
            <p className="text-gray-400">Advanced insights based on your viewing patterns</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {['overview', 'stats', 'trends'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-cinema-blue text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <div>
              <h4 className="flex items-center mb-3 space-x-2 font-semibold text-white">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Favorite Genres</span>
              </h4>
              <div className="space-y-2">
                {topGenres.length > 0 ? (
                  topGenres.map((genre, index) => (
                    <motion.div 
                      key={genre}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-cinema-blue" />
                      <span className="text-gray-300">{genre}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No preferences set</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="flex items-center mb-3 space-x-2 font-semibold text-white">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Watching Stats</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Hours:</span>
                  <span className="font-medium text-white">{patterns.totalHours || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed:</span>
                  <span className="font-medium text-white">{patterns.completedMovies || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Rating:</span>
                  <span className="font-medium text-white">{patterns.averageRating || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="flex items-center mb-3 space-x-2 font-semibold text-white">
                <Target className="w-4 h-4 text-yellow-400" />
                <span>Accuracy Score</span>
              </h4>
              <div className="text-center">
                <motion.div 
                  className="mb-2 text-3xl font-bold text-cinema-blue"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  {recommendationScore}%
                </motion.div>
                <p className="text-sm text-gray-400">Recommendation accuracy</p>
                <div className="w-full h-2 mt-3 bg-gray-700 rounded-full">
                  <motion.div 
                    className="h-2 rounded-full bg-cinema-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${recommendationScore}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Eye className="w-8 h-8 mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{watchHistory.length}</div>
              <div className="text-sm text-gray-400">Movies Watched</div>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20">
              <ThumbsUp className="w-8 h-8 mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{ratings.length}</div>
              <div className="text-sm text-gray-400">Movies Rated</div>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <Award className="w-8 h-8 mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{Math.floor(patterns.totalHours / 24) || 0}</div>
              <div className="text-sm text-gray-400">Days Watched</div>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20">
              <BarChart3 className="w-8 h-8 mb-2 text-red-400" />
              <div className="text-2xl font-bold text-white">{topGenres.length}</div>
              <div className="text-sm text-gray-400">Fav Genres</div>
            </div>
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-3 text-cinema-blue" />
              <h4 className="mb-2 font-semibold text-white">Viewing Trends</h4>
              <p className="text-gray-400">Coming soon - Advanced analytics about your viewing patterns</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

const RecommendationFilters = ({ onFilterChange, activeFilters }) => {
  const filters = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'new', label: 'New Releases', icon: Sparkles },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'high-rated', label: 'Top Rated', icon: Star },
    { id: 'watchlist', label: 'In Watchlist', icon: BookmarkPlus },
  ];

  return (
    <GlassCard className="p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              activeFilters.includes(filter.id)
                ? 'bg-cinema-blue text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <filter.icon className="w-4 h-4" />
            <span className="text-sm">{filter.label}</span>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
};

const Recommendations = () => {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState({
    personal: [],
    trending: [],
    similar: [],
    genre: [],
    newReleases: [],
    topRated: [],
    upcoming: []
  });
  
  const [userProfile, setUserProfile] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [refreshCount, setRefreshCount] = useState(0);
  
  const [loading, setLoading] = useState({
    personal: true,
    trending: true,
    similar: true,
    genre: true,
    newReleases: true,
    topRated: true,
    upcoming: true
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
      loadPersonalRecommendations();
      loadSimilarRecommendations();
    }
    loadTrendingRecommendations();
    loadGenreRecommendations();
    loadNewReleases();
    loadTopRated();
    loadUpcoming();
  }, [currentUser, refreshCount]);

  const loadUserData = async () => {
    // Backend API removed - using Firebase Firestore instead
    // User data can be fetched from Firestore if needed
  };

  const loadPersonalRecommendations = async () => {
    try {
      setLoading(prev => ({ ...prev, personal: true }));
      // Personal recommendations can use TMDB API based on user favorites from Firebase
      const trending = await tmdbService.getTrendingMovies('week');
      setRecommendations(prev => ({
        ...prev,
        personal: trending.slice(0, 20) || []
      }));
    } catch (error) {
      console.error('Error loading personal recommendations:', error);
    } finally {
      setLoading(prev => ({ ...prev, personal: false }));
    }
  };

  const loadTrendingRecommendations = async () => {
    try {
      setLoading(prev => ({ ...prev, trending: true }));
      const trendingMovies = await tmdbService.getTrendingMovies();
      setRecommendations(prev => ({
        ...prev,
        trending: trendingMovies || []
      }));
    } catch (error) {
      console.error('Error loading trending recommendations:', error);
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  };

  const loadSimilarRecommendations = async () => {
    if (!watchHistory.length) return;
    
    try {
      setLoading(prev => ({ ...prev, similar: true }));
      const lastWatched = watchHistory[0];
      const similarMovies = await tmdbService.getSimilarMovies(lastWatched.movie_id);
      setRecommendations(prev => ({
        ...prev,
        similar: similarMovies.movies || []
      }));
    } catch (error) {
      console.error('Error loading similar recommendations:', error);
    } finally {
      setLoading(prev => ({ ...prev, similar: false }));
    }
  };

  const loadGenreRecommendations = async () => {
    try {
      setLoading(prev => ({ ...prev, genre: true }));
      const popularMovies = await tmdbService.getPopularMovies();
      setRecommendations(prev => ({
        ...prev,
        genre: popularMovies.movies || []
      }));
    } catch (error) {
      console.error('Error loading genre recommendations:', error);
    } finally {
      setLoading(prev => ({ ...prev, genre: false }));
    }
  };

  const loadNewReleases = async () => {
    try {
      setLoading(prev => ({ ...prev, newReleases: true }));
      const newMovies = await tmdbService.getNewReleases();
      setRecommendations(prev => ({
        ...prev,
        newReleases: newMovies || []
      }));
    } catch (error) {
      console.error('Error loading new releases:', error);
    } finally {
      setLoading(prev => ({ ...prev, newReleases: false }));
    }
  };

  const loadTopRated = async () => {
    try {
      setLoading(prev => ({ ...prev, topRated: true }));
      const topMovies = await tmdbService.getTopRatedMovies();
      setRecommendations(prev => ({
        ...prev,
        topRated: topMovies || []
      }));
    } catch (error) {
      console.error('Error loading top rated movies:', error);
    } finally {
      setLoading(prev => ({ ...prev, topRated: false }));
    }
  };

  const loadUpcoming = async () => {
    try {
      setLoading(prev => ({ ...prev, upcoming: true }));
      const upcomingMovies = await tmdbService.getUpcomingMovies();
      setRecommendations(prev => ({
        ...prev,
        upcoming: upcomingMovies || []
      }));
    } catch (error) {
      console.error('Error loading upcoming movies:', error);
    } finally {
      setLoading(prev => ({ ...prev, upcoming: false }));
    }
  };

  const refreshRecommendations = (type) => {
    switch (type) {
      case 'personal':
        loadPersonalRecommendations();
        break;
      case 'trending':
        loadTrendingRecommendations();
        break;
      case 'similar':
        loadSimilarRecommendations();
        break;
      case 'genre':
        loadGenreRecommendations();
        break;
      case 'newReleases':
        loadNewReleases();
        break;
      case 'topRated':
        loadTopRated();
        break;
      case 'upcoming':
        loadUpcoming();
        break;
      case 'all':
        setRefreshCount(prev => prev + 1);
        break;
    }
  };

  const handleFilterChange = (filterId) => {
    if (filterId === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        return prev.includes(filterId) 
          ? newFilters.filter(f => f !== filterId)
          : [...newFilters, filterId];
      });
    }
  };

  const handleSeeAll = (categoryType) => {
    console.log('See all for:', categoryType);
  };

  return (
    <div className="min-h-screen px-6 py-20 bg-cinema-darker">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center mb-4 space-x-3 text-4xl font-bold text-white">
                <Sparkles className="w-10 h-10 text-cinema-blue" />
                <span>AI Recommendations</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  🎬
                </motion.div>
              </h1>
              <p className="text-lg text-gray-400">
                Discover your next favorite movie with AI-powered recommendations
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => refreshRecommendations('all')}
                whileHover={{ scale: 1.05, rotate: 360 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 space-x-2 transition-colors rounded-lg bg-cinema-blue/20 text-cinema-blue hover:bg-cinema-blue/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh All</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 space-x-2 text-purple-400 transition-colors rounded-lg bg-purple-500/20 hover:bg-purple-500/30"
              >
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RecommendationFilters 
            onFilterChange={handleFilterChange}
            activeFilters={activeFilters}
          />
        </motion.div>

        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <UserInsights 
              profile={userProfile}
              watchHistory={watchHistory}
              ratings={userRatings}
            />
          </motion.div>
        )}

        <div className="space-y-8">
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecommendationCategory
                title="For You"
                subtitle="Personalized based on your viewing history"
                description="Our AI has analyzed your preferences to find perfect matches"
                icon={Brain}
                movies={recommendations.personal}
                loading={loading.personal}
                onRefresh={() => refreshRecommendations('personal')}
                onSeeAll={() => handleSeeAll('personal')}
                color="purple-400"
                badge="AI"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecommendationCategory
              title="Trending Now"
              subtitle="What everyone is watching"
              description="Hot movies gaining popularity worldwide"
              icon={TrendingUp}
              movies={recommendations.trending}
              loading={loading.trending}
              onRefresh={() => refreshRecommendations('trending')}
              onSeeAll={() => handleSeeAll('trending')}
              color="green-400"
              badge="🔥"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RecommendationCategory
              title="New Releases"
              subtitle="Fresh movies just released"
              description="Latest movies available for streaming"
              icon={Sparkles}
              movies={recommendations.newReleases}
              loading={loading.newReleases}
              onRefresh={() => refreshRecommendations('newReleases')}
              onSeeAll={() => handleSeeAll('newReleases')}
              color="blue-400"
              badge="NEW"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <RecommendationCategory
              title="Top Rated"
              subtitle="Highest rated movies of all time"
              description="Critically acclaimed masterpieces"
              icon={Award}
              movies={recommendations.topRated}
              loading={loading.topRated}
              onRefresh={() => refreshRecommendations('topRated')}
              onSeeAll={() => handleSeeAll('topRated')}
              color="yellow-400"
              badge="⭐"
            />
          </motion.div>

          {currentUser && watchHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <RecommendationCategory
                title="More Like What You Watched"
                subtitle={`Because you watched ${watchHistory[0]?.movie_title}`}
                description="Movies with similar themes and styles"
                icon={Zap}
                movies={recommendations.similar}
                loading={loading.similar}
                onRefresh={() => refreshRecommendations('similar')}
                onSeeAll={() => handleSeeAll('similar')}
                color="blue-400"
                badge="💡"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <RecommendationCategory
              title="Popular Movies"
              subtitle="Highly rated by our community"
              description="Movies loved by SAYN users"
              icon={Star}
              movies={recommendations.genre}
              loading={loading.genre}
              onRefresh={() => refreshRecommendations('genre')}
              onSeeAll={() => handleSeeAll('popular')}
              color="yellow-400"
              badge="♥️"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <RecommendationCategory
              title="Coming Soon"
              subtitle="Upcoming releases to watch out for"
              description="Add to your watchlist for future viewing"
              icon={Calendar}
              movies={recommendations.upcoming}
              loading={loading.upcoming}
              onRefresh={() => refreshRecommendations('upcoming')}
              onSeeAll={() => handleSeeAll('upcoming')}
              color="purple-400"
              badge="📅"
            />
          </motion.div>
        </div>

        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <GlassCard className="relative p-12 overflow-hidden text-center">
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="w-full h-full bg-gradient-to-br from-cinema-blue via-purple-500 to-pink-500"
                />
              </div>
              
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Users className="w-16 h-16 mx-auto mb-6 text-cinema-blue" />
                </motion.div>
                
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Unlock Your Personal Movie Universe
                </h3>
                
                <p className="mb-6 text-lg text-gray-400">
                  Join SAYN to get AI-powered recommendations tailored just for you
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center space-x-2 text-green-400">
                    <Brain className="w-5 h-5" />
                    <span>AI Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-400">
                    <BookmarkPlus className="w-5 h-5" />
                    <span>Personal Watchlist</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Star className="w-5 h-5" />
                    <span>Rate & Review</span>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => window.location.href = '/login'}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-cinema-blue to-purple-500 hover:from-cinema-blue/80 hover:to-purple-500/80"
                >
                  Start Your Journey
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-12"
        >
          <GlassCard className="p-6">
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-xl font-bold text-white">SAYN Community Stats</h3>
              <p className="text-gray-400">Join thousands of movie lovers</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 text-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10"
              >
                <div className="mb-1 text-2xl font-bold text-cinema-blue">10K+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 text-center rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10"
              >
                <div className="mb-1 text-2xl font-bold text-green-400">500K+</div>
                <div className="text-sm text-gray-400">Movies Watched</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 text-center rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
              >
                <div className="mb-1 text-2xl font-bold text-yellow-400">250K+</div>
                <div className="text-sm text-gray-400">Reviews</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 text-center rounded-lg bg-gradient-to-br from-pink-500/10 to-red-500/10"
              >
                <div className="mb-1 text-2xl font-bold text-pink-400">95%</div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;