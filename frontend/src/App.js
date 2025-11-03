import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Star, Play, User, Moon, Sun, Filter, Heart, BookmarkPlus, Loader, TrendingUp, LogOut, LogIn } from 'lucide-react';
import tmdbService from './services/tmdbService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFavorites } from './hooks/useFavorites';
import { ToastProvider } from './components/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import GlassCard from './components/GlassCard';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n'; 
import './App.css';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch'));
const WatchMovie = lazy(() => import('./pages/WatchMovie'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const GenrePage = lazy(() => import('./pages/GenrePage'));

const MovieCard = ({ movie, onSelect }) => {
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      await toggleFavorite(movie);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    setFavoriteLoading(false);
  };

  const handleCardClick = useCallback(() => {
    navigate(`/movie/${movie.id}`);
  }, [movie.id, navigate]);

  return (
    <GlassCard 
      className="p-4 cursor-pointer group"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label={`Movie: ${movie.title}`}
      role="article"
    >
      <div className="relative mb-4 overflow-hidden rounded-lg aspect-[2/3]">
        {movie.poster ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-cinema-accent">
                <Loader className="w-8 h-8 animate-spin text-cinema-blue" />
              </div>
            )}
            <img 
              src={movie.poster} 
              alt={movie.title}
              className={`object-cover w-full h-full transition-transform duration-500 transform group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-cinema-accent">
            <Film className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-black/40 group-hover:opacity-100"
          aria-hidden="true"
        >
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute flex space-x-2 top-2 right-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            className={`backdrop-blur-sm p-2 rounded-full transition-colors ${
              isFavorite(movie.id) 
                ? 'bg-red-500/80 text-white' 
                : 'bg-black/50 text-white hover:text-red-400'
            }`}
            aria-label={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favoriteLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-white transition-colors rounded-full bg-black/50 backdrop-blur-sm hover:text-cinema-blue"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Add to watchlist"
          >
            <BookmarkPlus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cinema-blue">
        {movie.title}
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{movie.year}</span>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-semibold text-white">{movie.rating}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 line-clamp-3">{movie.description}</p>
    </GlassCard>
  );
};

const MovieModal = ({ movie, isOpen, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (isOpen && movie) {
      setLoading(true);
      tmdbService.getMovieDetails(movie.id)
        .then(details => {
          setMovieDetails(details);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading movie details:', error);
          setLoading(false);
        });
    }
  }, [isOpen, movie]);

  const handleFavoriteClick = async () => {
    if (!currentUser) return;
    
    setFavoriteLoading(true);
    try {
      await toggleFavorite(movie);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    setFavoriteLoading(false);
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="movie-modal-title"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-cinema-dark border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <LoadingSpinner />
            ) : movieDetails ? (
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-shrink-0">
                  {movieDetails.poster ? (
                    <img 
                      src={movieDetails.poster} 
                      alt={movieDetails.title}
                      className="object-cover w-full rounded-lg md:w-80 h-96"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full rounded-lg md:w-80 h-96 bg-cinema-accent">
                      <Film className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 id="movie-modal-title" className="mb-4 text-3xl font-bold text-white">
                    {movieDetails.title}
                  </h2>
                  {movieDetails.tagline && (
                    <p className="mb-4 text-lg italic text-cinema-blue">"{movieDetails.tagline}"</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="text-gray-300">{movieDetails.year}</span>
                    {movieDetails.runtime && (
                      <span className="text-gray-300">{movieDetails.runtime} min</span>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-white">{movieDetails.rating}</span>
                      <span className="text-sm text-gray-400">({movieDetails.voteCount} votes)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movieDetails.genres?.map((genre) => (
                      <Link 
                        key={genre.id} 
                        to={`/genre/${genre.id}`}
                        className="px-3 py-1 transition-colors border rounded-full bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30 hover:bg-cinema-blue/30"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-gray-300">{movieDetails.description}</p>
                  
                  {movieDetails.director && (
                    <div className="mb-4">
                      <h3 className="mb-2 font-semibold text-white">Director</h3>
                      <p className="text-gray-300">{movieDetails.director}</p>
                    </div>
                  )}
                  
                  {movieDetails.cast && movieDetails.cast.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 font-semibold text-white">Cast</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.cast.slice(0, 8).map((actor) => (
                          <span 
                            key={actor.id} 
                            className="px-3 py-1 text-sm text-white transition-colors rounded-full bg-white/10 hover:bg-white/20"
                          >
                            {actor.name} {actor.character && `as ${actor.character}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    {movieDetails.trailers?.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${movieDetails.trailers[0].key}`, '_blank')}
                        aria-label="Watch trailer"
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch Trailer</span>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center px-6 py-3 space-x-2 font-semibold transition-colors rounded-lg ${
                        isFavorite(movie.id) 
                          ? 'bg-red-500/80 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      onClick={handleFavoriteClick}
                      disabled={favoriteLoading}
                      aria-label={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favoriteLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Heart className={`w-5 h-5 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
                      )}
                      <span>
                        {isFavorite(movie.id) ? 'Favorited' : 'Add to Favorites'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-400">Failed to load movie details</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HeroSection = ({ onSearchFocus }) => {
  const [bgLoaded, setBgLoaded] = useState(false);

  return (
    <section 
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      aria-label="Movie discovery platform"
    >
      {!bgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-cinema-dark to-cinema-darker"></div>
      )}
      <img
        src="https://images.unsplash.com/photo-1588823400943-b85ba1a6d19a"
        alt="Cinema background"
        className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-1000 ${
          bgLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setBgLoaded(true)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-cinema-dark/60 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-4xl px-6 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-6 text-6xl font-bold text-white md:text-8xl">
            <span className="text-transparent bg-neon-gradient bg-clip-text">SAYN</span>
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-gray-300 md:text-2xl">
            Smart Aesthetic Yielded Network
          </p>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-400">
            Discover millions of movies with real-time data from The Movie Database
          </p>
          <motion.div
            className="relative max-w-2xl mx-auto"
            whileHover={{ scale: 1.02 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-4">
                <Search className="w-6 h-6 text-cinema-blue" />
                <input
                  type="text"
                  placeholder="Search from millions of movies..."
                  className="flex-1 text-lg text-white placeholder-gray-400 bg-transparent outline-none"
                  onFocus={onSearchFocus}
                  aria-label="Search movies"
                />
                <Link to="/advanced-search">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                    aria-label="Advanced search"
                  >
                    <Filter className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
      <div className="absolute transform -translate-x-1/2 bottom-8 left-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/60"
          aria-hidden="true"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

const Navigation = ({ isDark, toggleTheme }) => {
  const { currentUser, logout } = useAuth();
  const { favorites } = useFavorites();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 p-4"
      aria-label="Main navigation"
    >
      <GlassCard className="flex items-center justify-between p-4 mx-auto max-w-7xl">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center space-x-2"
            >
              <Film className="w-8 h-8 text-cinema-blue" />
              <span className="text-xl font-bold text-white">SAYN</span>
            </motion.div>
          </Link>
          
          <button
            className="text-white md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <div className="items-center hidden space-x-6 md:flex">
            <Link to="/" className="text-gray-300 transition-colors hover:text-white">
              Home
            </Link>
            <Link to="/#trending" className="text-gray-300 transition-colors hover:text-white">
              Trending
            </Link>
            <Link to="/genre/28" className="text-gray-300 transition-colors hover:text-white">
              Action
            </Link>
            <Link to="/genre/878" className="text-gray-300 transition-colors hover:text-white">
              Sci-Fi
            </Link>
            {currentUser && (
              <Link 
                to="/favorites" 
                className="flex items-center space-x-1 text-gray-300 transition-colors hover:text-white"
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
                {favorites.length > 0 && (
                  <span className="px-2 py-1 text-xs text-white rounded-full bg-cinema-blue">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute left-0 right-0 w-full p-4 mt-4 space-y-4 origin-top transform bg-cinema-dark rounded-xl top-full"
            >
              <Link 
                to="/" 
                className="block px-4 py-2 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/#trending" 
                className="block px-4 py-2 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trending
              </Link>
              <Link 
                to="/genre/28" 
                className="block px-4 py-2 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Action
              </Link>
              <Link 
                to="/genre/878" 
                className="block px-4 py-2 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sci-Fi
              </Link>
              {currentUser && (
                <Link 
                  to="/favorites" 
                  className="flex items-center px-4 py-2 space-x-1 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  <span>Favorites</span>
                  {favorites.length > 0 && (
                    <span className="px-2 py-1 text-xs text-white rounded-full bg-cinema-blue">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              )}
              <div className="pt-4 mt-4 border-t border-white/10">
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 space-x-2 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="flex items-center w-full px-4 py-2 space-x-2 text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link 
                      to="/signup" 
                      className="flex items-center justify-center w-full px-4 py-2 mt-2 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="text-white transition-colors hover:text-cinema-blue"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
          
          {currentUser ? (
            <div className="relative hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white transition-colors hover:text-cinema-blue"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <User className="w-6 h-6" />
                <span className="hidden md:block">{currentUser.displayName || 'User'}</span>
              </motion.button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 w-48 mt-2 overflow-hidden border rounded-lg shadow-xl bg-cinema-dark border-white/20"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="font-medium text-white">{currentUser.displayName || 'User'}</p>
                      <p className="text-sm text-gray-400">{currentUser.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/favorites"
                        className="flex items-center px-4 py-2 space-x-2 text-gray-300 transition-colors hover:text-white hover:bg-white/10"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="w-4 h-4" />
                        <span>My Favorites</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 space-x-2 text-gray-300 transition-colors hover:text-white hover:bg-white/10"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 space-x-2 text-gray-300 transition-colors hover:text-white hover:bg-white/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="items-center hidden space-x-2 md:flex">
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 text-gray-300 transition-colors hover:text-white"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </motion.div>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.nav>
  );
};

const SectionHeader = ({ title, icon: Icon, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-8 text-center"
  >
    <div className="flex items-center justify-center mb-4 space-x-3">
      <Icon className="w-8 h-8 text-cinema-blue" />
      <h2 className="text-4xl font-bold text-white">
        {title}
      </h2>
    </div>
    {subtitle && (
      <p className="text-lg text-gray-400">{subtitle}</p>
    )}
  </motion.div>
);

const AppContent = () => {
  const [isDark, setIsDark] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [activeSection, setActiveSection] = useState('trending');
  
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [genres, setGenres] = useState([]);
  
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  const handleSearchFocus = useCallback(() => {
    document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trending = await tmdbService.getTrendingMovies();
        setTrendingMovies(trending);
        setLoadingTrending(false);

        const popular = await tmdbService.getPopularMovies();
        setPopularMovies(popular.movies);
        setLoadingPopular(false);

        const topRated = await tmdbService.getTopRatedMovies();
        setTopRatedMovies(topRated.movies);
        setLoadingTopRated(false);

        const genreList = await tmdbService.getMovieGenres();
        setGenres([{ id: '', name: 'All Genres' }, ...genreList]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoadingTrending(false);
        setLoadingPopular(false);
        setLoadingTopRated(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setLoadingSearch(true);
      const searchTimeout = setTimeout(() => {
        tmdbService.searchMovies(searchQuery)
          .then(data => {
            setSearchResults(data.movies);
            setLoadingSearch(false);
          })
          .catch(error => {
            console.error('Error searching movies:', error);
            setLoadingSearch(false);
          });
      }, 500);

      return () => clearTimeout(searchTimeout);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getCurrentMovies = useCallback(() => {
    if (searchQuery.trim().length > 2) {
      return searchResults;
    }

    let movies = [];
    switch (activeSection) {
      case 'trending':
        movies = trendingMovies;
        break;
      case 'popular':
        movies = popularMovies;
        break;
      case 'top-rated':
        movies = topRatedMovies;
        break;
      default:
        movies = trendingMovies;
    }

    if (selectedGenre) {
      movies = movies.filter(movie => 
        movie.genre && movie.genre.includes(parseInt(selectedGenre))
      );
    }

    return movies;
  }, [activeSection, searchQuery, searchResults, selectedGenre, trendingMovies, popularMovies, topRatedMovies]);

  const isLoading = useCallback(() => {
    if (searchQuery.trim().length > 2) {
      return loadingSearch;
    }
    
    switch (activeSection) {
      case 'trending':
        return loadingTrending;
      case 'popular':
        return loadingPopular;
      case 'top-rated':
        return loadingTopRated;
      default:
        return loadingTrending;
    }
  }, [activeSection, loadingPopular, loadingSearch, loadingTopRated, loadingTrending, searchQuery]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-cinema-darker' : 'bg-white'}`}>
      <Navigation isDark={isDark} toggleTheme={toggleTheme} />
      
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SignupPage />
          </Suspense>
        } />
        <Route path="/movie/:id" element={
          <Suspense fallback={<LoadingSpinner />}>
            <MovieDetailPage />
          </Suspense>
        } />
        <Route path="/genre/:genreId" element={
          <Suspense fallback={<LoadingSpinner />}>
            <GenrePage />
          </Suspense>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <FavoritesPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <UserDashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/advanced-search" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdvancedSearch />
          </Suspense>
        } />
        <Route path="/watch/:id" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <WatchMovie />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/recommendations" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Recommendations />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ErrorBoundary>
            <>
              <HeroSection onSearchFocus={handleSearchFocus} />
              
              <section id="movies-section" className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                  <SectionHeader 
                    title="Discover Movies" 
                    icon={Film}
                    subtitle="Millions of movies from The Movie Database"
                  />
                  
                  <div className="flex flex-col gap-4 mb-8 lg:flex-row">
                    <GlassCard className="flex-1 p-4">
                      <div className="flex items-center space-x-3">
                        <Search className="w-5 h-5 text-cinema-blue" />
                        <input
                          type="text"
                          placeholder="Search movies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 text-white placeholder-gray-400 bg-transparent outline-none"
                          aria-label="Search movies"
                        />
                      </div>
                    </GlassCard>
                    
                    <GlassCard className="p-4">
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="bg-transparent text-white outline-none cursor-pointer min-w-[150px]"
                        aria-label="Filter by genre"
                      >
                        {genres.map(genre => (
                          <option key={genre.id} value={genre.id} className="bg-cinema-dark">
                            {genre.name}
                          </option>
                        ))}
                      </select>
                    </GlassCard>
                  </div>

                  {!searchQuery && (
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                      {[
                        { id: 'trending', label: 'Trending', icon: TrendingUp },
                        { id: 'popular', label: 'Popular', icon: Film },
                        { id: 'top-rated', label: 'Top Rated', icon: Star },
                      ].map(({ id, label, icon: Icon }) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveSection(id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeSection === id
                              ? 'bg-cinema-blue text-white'
                              : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                          }`}
                          aria-label={`Show ${label} movies`}
                          aria-pressed={activeSection === id}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{label}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  
                  {isLoading() ? (
                    <LoadingSpinner />
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      layout
                    >
                      {getCurrentMovies().slice(0, 20).map((movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onSelect={setSelectedMovie}
                        />
                      ))}
                    </motion.div>
                  )}
                  
                  {!isLoading() && getCurrentMovies().length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-16 text-center"
                    >
                      <Film className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg text-gray-400">
                        {searchQuery ? 'No movies found for your search' : 'No movies found'}
                      </p>
                    </motion.div>
                  )}
                </div>
              </section>
            </>
          </ErrorBoundary>
        } />
      </Routes>
      
      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;