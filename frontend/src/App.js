import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Star, Play, User, Moon, Sun, Filter, Heart, BookmarkPlus, Loader, TrendingUp, Calendar, LogOut, LogIn } from 'lucide-react';
import tmdbService from './services/tmdbService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { ToastProvider } from './components/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FavoritesPage from './pages/FavoritesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import GenrePage from './pages/GenrePage';
import './i18n'; // Initialize i18n
import './App.css';

// Glass Card Component
const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl ${className}`}
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader className="w-8 h-8 text-cinema-blue" />
    </motion.div>
  </div>
);

// Movie Card Component
const MovieCard = ({ movie, onSelect }) => {
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    await toggleFavorite(movie);
    setFavoriteLoading(false);
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <GlassCard 
      className="p-4 cursor-pointer group"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-lg mb-4">
        {movie.poster ? (
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-80 bg-cinema-accent flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="text-white w-12 h-12" />
        </div>
        <div className="absolute top-2 right-2 flex space-x-2">
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
            className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:text-cinema-blue transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <BookmarkPlus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cinema-blue transition-colors">
        {movie.title}
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm">{movie.year}</span>
        <div className="flex items-center space-x-1">
          <Star className="text-yellow-400 w-4 h-4 fill-current" />
          <span className="text-white text-sm font-semibold">{movie.rating}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm line-clamp-3">{movie.description}</p>
    </GlassCard>
  );
};

// Movie Modal Component
const MovieModal = ({ movie, isOpen, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
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
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {movieDetails.poster ? (
                    <img 
                      src={movieDetails.poster} 
                      alt={movieDetails.title}
                      className="w-full md:w-80 h-96 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full md:w-80 h-96 bg-cinema-accent flex items-center justify-center rounded-lg">
                      <Film className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-4">{movieDetails.title}</h2>
                  {movieDetails.tagline && (
                    <p className="text-cinema-blue text-lg italic mb-4">"{movieDetails.tagline}"</p>
                  )}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-gray-300">{movieDetails.year}</span>
                    {movieDetails.runtime && (
                      <span className="text-gray-300">{movieDetails.runtime} min</span>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 w-5 h-5 fill-current" />
                      <span className="text-white font-semibold">{movieDetails.rating}</span>
                      <span className="text-gray-400 text-sm">({movieDetails.voteCount} votes)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movieDetails.genres && movieDetails.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-cinema-blue/20 text-cinema-blue rounded-full border border-cinema-blue/30">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">{movieDetails.description}</p>
                  {movieDetails.cast && movieDetails.cast.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">Cast</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.cast.map((actor) => (
                          <span key={actor.id} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                            {actor.name} {actor.character && `as ${actor.character}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-4">
                    {movieDetails.trailers && movieDetails.trailers.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-cinema-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${movieDetails.trailers[0].key}`, '_blank')}
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch Trailer</span>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span>Add to Favorites</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Failed to load movie details</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hero Section Component
const HeroSection = ({ onSearchFocus }) => (
  <section 
    className="relative min-h-screen flex items-center justify-center overflow-hidden"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1588823400943-b85ba1a6d19a')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="absolute inset-0 bg-cinema-dark/60 backdrop-blur-sm"></div>
    <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
          <span className="bg-neon-gradient bg-clip-text text-transparent">SAYN</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
          Smart Aesthetic Yielded Network
        </p>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Discover millions of movies with real-time data from The Movie Database
        </p>
        <motion.div
          className="relative max-w-2xl mx-auto"
          whileHover={{ scale: 1.02 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-4">
              <Search className="text-cinema-blue w-6 h-6" />
              <input
                type="text"
                placeholder="Search from millions of movies..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg outline-none"
                onFocus={onSearchFocus}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-cinema-blue text-white p-2 rounded-lg hover:bg-cinema-blue/80 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-white/60"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </div>
  </section>
);

// Navigation Component
const Navigation = ({ isDark, toggleTheme }) => {
  const { currentUser, logout } = useAuth();
  const { favorites } = useFavorites();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    >
      <GlassCard className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <motion.a
            href="/"
            whileHover={{ scale: 1.1 }}
            className="flex items-center space-x-2"
          >
            <Film className="text-cinema-blue w-8 h-8" />
            <span className="text-white font-bold text-xl">SAYN</span>
          </motion.a>
          <div className="hidden md:flex items-center space-x-6">
            <motion.a
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Home
            </motion.a>
            <motion.a
              href="/#trending"
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Trending
            </motion.a>
            <motion.a
              href="/genre/28"
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Action
            </motion.a>
            <motion.a
              href="/genre/878"
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Sci-Fi
            </motion.a>
            {currentUser && (
              <motion.a
                href="/favorites"
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
                {favorites.length > 0 && (
                  <span className="bg-cinema-blue text-white text-xs px-2 py-1 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </motion.a>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="text-white hover:text-cinema-blue transition-colors"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
          
          {currentUser ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white hover:text-cinema-blue transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="hidden md:block">{currentUser.displayName || 'User'}</span>
              </motion.button>
              
              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-cinema-dark border border-white/20 rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white font-medium">{currentUser.displayName || 'User'}</p>
                      <p className="text-gray-400 text-sm">{currentUser.email}</p>
                    </div>
                    <div className="py-2">
                      <a
                        href="/favorites"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>My Favorites</span>
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
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
            <div className="flex items-center space-x-2">
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </motion.a>
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-cinema-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors"
              >
                Sign Up
              </motion.a>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.nav>
  );
};

// Section Header Component
const SectionHeader = ({ title, icon: Icon, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-8 text-center"
  >
    <div className="flex items-center justify-center space-x-3 mb-4">
      <Icon className="text-cinema-blue w-8 h-8" />
      <h2 className="text-4xl font-bold text-white">
        {title}
      </h2>
    </div>
    {subtitle && (
      <p className="text-gray-400 text-lg">{subtitle}</p>
    )}
  </motion.div>
);

// Main App Component with Auth wrapper
const AppContent = () => {
  const [isDark, setIsDark] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [activeSection, setActiveSection] = useState('trending');
  
  // Movie data states
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [genres, setGenres] = useState([]);
  
  // Loading states
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  const handleSearchFocus = () => {
    document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial data
  useEffect(() => {
    // Load trending movies
    tmdbService.getTrendingMovies()
      .then(movies => {
        setTrendingMovies(movies);
        setLoadingTrending(false);
      })
      .catch(error => {
        console.error('Error loading trending movies:', error);
        setLoadingTrending(false);
      });

    // Load popular movies
    tmdbService.getPopularMovies()
      .then(data => {
        setPopularMovies(data.movies);
        setLoadingPopular(false);
      })
      .catch(error => {
        console.error('Error loading popular movies:', error);
        setLoadingPopular(false);
      });

    // Load top rated movies
    tmdbService.getTopRatedMovies()
      .then(data => {
        setTopRatedMovies(data.movies);
        setLoadingTopRated(false);
      })
      .catch(error => {
        console.error('Error loading top rated movies:', error);
        setLoadingTopRated(false);
      });

    // Load genres
    tmdbService.getMovieGenres()
      .then(genreList => {
        setGenres([{ id: '', name: 'All Genres' }, ...genreList]);
      })
      .catch(error => {
        console.error('Error loading genres:', error);
      });
  }, []);

  // Handle search
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

  // Get current movies based on active section and filters
  const getCurrentMovies = () => {
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

    // Apply genre filter
    if (selectedGenre) {
      movies = movies.filter(movie => 
        movie.genre && movie.genre.includes(parseInt(selectedGenre))
      );
    }

    return movies;
  };

  const isLoading = () => {
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
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-cinema-darker' : 'bg-white'}`}>
      <Navigation isDark={isDark} toggleTheme={toggleTheme} />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/genre/:genreId" element={<GenrePage />} />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <>
            <HeroSection onSearchFocus={handleSearchFocus} />
            
            <section id="movies-section" className="py-16 px-6">
              <div className="max-w-7xl mx-auto">
                <SectionHeader 
                  title="Discover Movies" 
                  icon={Film}
                  subtitle="Millions of movies from The Movie Database"
                />
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                  <GlassCard className="flex-1 p-4">
                    <div className="flex items-center space-x-3">
                      <Search className="text-cinema-blue w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                      />
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="bg-transparent text-white outline-none cursor-pointer min-w-[150px]"
                    >
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id} className="bg-cinema-dark">
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </GlassCard>
                </div>

                {/* Section Tabs */}
                {!searchQuery && (
                  <div className="flex flex-wrap gap-4 mb-8 justify-center">
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
                      >
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
                
                {/* Movies Grid */}
                {isLoading() ? (
                  <LoadingSpinner />
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                    className="text-center py-16"
                  >
                    <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      {searchQuery ? 'No movies found for your search' : 'No movies found'}
                    </p>
                  </motion.div>
                )}
              </div>
            </section>
          </>
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

// Main App Component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;