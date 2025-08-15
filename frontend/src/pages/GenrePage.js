import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Film, Loader, Grid3X3, List, Search, Filter, 
  SortAsc, SortDesc, Calendar, Star, Clock, Eye, 
  X, TrendingUp, Award, Zap 
} from 'lucide-react';
import tmdbService from '../services/tmdbService';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const GenreMovieCard = ({ movie, onSelect, viewMode, index }) => {
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setFavoriteLoading(true);
    await toggleFavorite(movie);
    setFavoriteLoading(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.1, duration: 0.5 }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.01, y: -2 }}
        onClick={() => onSelect(movie.id)}
        className="flex gap-4 p-4 transition-all duration-300 border cursor-pointer bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl group hover:border-cinema-blue/50"
      >
        <div className="relative flex-shrink-0 w-24 overflow-hidden rounded-lg h-36">
          {movie.poster && !imageError ? (
            <img 
              src={movie.poster} 
              alt={movie.title}
              className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-cinema-accent">
              <Film className="w-8 h-8 text-gray-500" />
            </div>
          )}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-600 animate-pulse" />
          )}
        </div>
        
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cinema-blue line-clamp-1">
              {movie.title}
            </h3>
            <div className="flex items-center gap-4 mb-2 text-sm">
              <span className="text-gray-300">{movie.year}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-white">{movie.rating}</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{movie.runtime} min</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{movie.description}</p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
            >
              View Details
            </motion.button>
            
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
                <svg className={`w-4 h-4 ${isFavorite(movie.id) ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => onSelect(movie.id)}
      className="p-4 transition-all duration-300 border cursor-pointer bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl group hover:border-cinema-blue/50"
    >
      <div className="relative mb-4 overflow-hidden rounded-lg">
        {movie.poster && !imageError ? (
          <img 
            src={movie.poster} 
            alt={movie.title}
            className={`w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-80 bg-cinema-accent">
            <Film className="w-16 h-16 text-gray-500" />
          </div>
        )}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-600 animate-pulse" />
        )}
        
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:opacity-100" />
        
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-black/40 group-hover:opacity-100">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
            >
              <Eye className="inline w-4 h-4 mr-2" />
              View Details
            </motion.button>
            {movie.rating && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold text-white">{movie.rating}</span>
              </div>
            )}
          </motion.div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={`absolute top-2 right-2 backdrop-blur-sm p-2 rounded-full transition-colors shadow-lg ${
            isFavorite(movie.id) 
              ? 'bg-red-500/80 text-white' 
              : 'bg-black/50 text-white hover:text-red-400'
          }`}
        >
          {favoriteLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <svg className={`w-4 h-4 ${isFavorite(movie.id) ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </motion.button>
        
        {movie.rating >= 8 && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white rounded-full top-2 left-2 bg-green-500/80 backdrop-blur-sm">
            <Award className="inline w-3 h-3 mr-1" />
            Top Rated
          </div>
        )}
        
        {movie.popularity > 100 && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white rounded-full bottom-2 left-2 bg-orange-500/80 backdrop-blur-sm">
            <TrendingUp className="inline w-3 h-3 mr-1" />
            Trending
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cinema-blue line-clamp-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center text-sm text-gray-300">
            <Calendar className="w-4 h-4 mr-1" />
            {movie.year}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-white">{movie.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 line-clamp-3">{movie.description}</p>
      </div>
    </motion.div>
  );
};

const SkeletonCard = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl animate-pulse">
        <div className="flex-shrink-0 w-24 bg-gray-600 rounded-lg h-36"></div>
        <div className="flex-1 space-y-3">
          <div className="w-3/4 h-6 bg-gray-600 rounded"></div>
          <div className="flex gap-4">
            <div className="w-16 h-4 bg-gray-600 rounded"></div>
            <div className="w-12 h-4 bg-gray-600 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-gray-600 rounded"></div>
            <div className="w-2/3 h-3 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl animate-pulse">
      <div className="mb-4 bg-gray-600 rounded-lg h-80"></div>
      <div className="h-6 mb-2 bg-gray-600 rounded"></div>
      <div className="flex justify-between mb-2">
        <div className="w-16 h-4 bg-gray-600 rounded"></div>
        <div className="w-12 h-4 bg-gray-600 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-gray-600 rounded"></div>
        <div className="w-3/4 h-3 bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

const FilterControls = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder,
  yearRange,
  setYearRange,
  ratingRange,
  setRatingRange,
  showFilters,
  setShowFilters
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchTerm, setSearchTerm]);

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'year', label: 'Year' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popularity' }
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search movies..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-white placeholder-gray-400 transition-colors border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20 focus:outline-none focus:border-cinema-blue"
          />
          {localSearchTerm && (
            <button
              onClick={() => setLocalSearchTerm('')}
              className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 text-white transition-colors border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20 focus:outline-none focus:border-cinema-blue"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-cinema-darker">
                {option.label}
              </option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-3 text-white transition-colors border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20 hover:border-cinema-blue"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-cinema-blue text-white' 
                : 'bg-glass-gradient backdrop-blur-glass border border-white/20 text-white hover:border-cinema-blue'
            }`}
          >
            <Filter className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 mt-4 border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Year Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={yearRange.min}
                    onChange={(e) => setYearRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 text-white placeholder-gray-400 border rounded bg-black/30 border-white/20 focus:outline-none focus:border-cinema-blue"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="To"
                    value={yearRange.max}
                    onChange={(e) => setYearRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 text-white placeholder-gray-400 border rounded bg-black/30 border-white/20 focus:outline-none focus:border-cinema-blue"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Rating Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Min"
                    value={ratingRange.min}
                    onChange={(e) => setRatingRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 text-white placeholder-gray-400 border rounded bg-black/30 border-white/20 focus:outline-none focus:border-cinema-blue"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Max"
                    value={ratingRange.max}
                    onChange={(e) => setRatingRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 text-white placeholder-gray-400 border rounded bg-black/30 border-white/20 focus:outline-none focus:border-cinema-blue"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setYearRange({ min: '', max: '' });
                  setRatingRange({ min: '', max: '' });
                  setLocalSearchTerm('');
                }}
                className="px-4 py-2 text-red-400 transition-colors rounded-lg bg-red-500/20 hover:bg-red-500/30"
              >
                Clear Filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GenrePage = () => {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [yearRange, setYearRange] = useState({ min: '', max: '' });
  const [ratingRange, setRatingRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef();
  const lastMovieElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const loadGenreData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [genresData, moviesData] = await Promise.all([
          tmdbService.getMovieGenres(),
          tmdbService.getMoviesByGenre(genreId, 1)
        ]);
        
        const genreInfo = genresData.find(g => g.id === parseInt(genreId));
        setGenre(genreInfo);
        setAllMovies(moviesData.movies);
        setMovies(moviesData.movies);
        setHasMore(moviesData.totalPages > 1);
        setPage(1);
      } catch (err) {
        setError('Failed to load genre movies');
        console.error('Error loading genre:', err);
      } finally {
        setLoading(false);
      }
    };

    if (genreId) {
      loadGenreData();
    }
  }, [genreId]);

  useEffect(() => {
    let filtered = [...allMovies];

    if (searchTerm) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearRange.min || yearRange.max) {
      filtered = filtered.filter(movie => {
        const year = parseInt(movie.year);
        const min = yearRange.min ? parseInt(yearRange.min) : 0;
        const max = yearRange.max ? parseInt(yearRange.max) : 9999;
        return year >= min && year <= max;
      });
    }

    if (ratingRange.min || ratingRange.max) {
      filtered = filtered.filter(movie => {
        const rating = parseFloat(movie.rating);
        const min = ratingRange.min ? parseFloat(ratingRange.min) : 0;
        const max = ratingRange.max ? parseFloat(ratingRange.max) : 10;
        return rating >= min && rating <= max;
      });
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'year' || sortBy === 'rating') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setMovies(filtered);
  }, [allMovies, searchTerm, sortBy, sortOrder, yearRange, ratingRange]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await tmdbService.getMoviesByGenre(genreId, nextPage);
      
      setAllMovies(prev => [...prev, ...data.movies]);
      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);
    } catch (err) {
      console.error('Error loading more movies:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-cinema-darker">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-12">
            <div className="w-64 h-8 mb-4 bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-600 rounded w-96 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} viewMode="grid" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !genre) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24 bg-cinema-darker">
        <div className="max-w-md px-6 mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 text-6xl text-red-400">🎬</div>
            <h2 className="mb-4 text-2xl font-bold text-white">Genre Not Found</h2>
            <p className="mb-8 text-gray-400">{error || 'The genre you\'re looking for doesn\'t exist.'}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
            >
              <ArrowLeft className="inline w-5 h-5 mr-2" />
              Back to Home
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-cinema-darker">
      <div className="px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-cinema-blue text-white' 
                    : 'bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-cinema-blue text-white' 
                    : 'bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
              {genre.name} <span className="text-cinema-blue">Movies</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-400">
              Discover the best {genre.name.toLowerCase()} movies from our collection. 
              Use filters and search to find your perfect match.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
              <div className="flex items-center px-4 py-2 space-x-2 border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20">
                <Film className="w-4 h-4 text-cinema-blue" />
                <span className="text-white">{movies.length} movies</span>
              </div>
              <div className="flex items-center px-4 py-2 space-x-2 border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white">
                  Avg Rating: {movies.length > 0 ? (movies.reduce((sum, movie) => sum + parseFloat(movie.rating), 0) / movies.length).toFixed(1) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center px-4 py-2 space-x-2 border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-white">
                  Years: {movies.length > 0 ? `${Math.min(...movies.map(m => parseInt(m.year)))} - ${Math.max(...movies.map(m => parseInt(m.year)))}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <FilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          yearRange={yearRange}
          setYearRange={setYearRange}
          ratingRange={ratingRange}
          setRatingRange={setRatingRange}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-cinema-blue/20 blur-3xl"></div>
                <Film className="relative z-10 w-32 h-32 mx-auto text-gray-600" />
              </div>
              <h3 className="mb-4 text-3xl font-bold text-white">No movies found</h3>
              <p className="mb-8 text-lg text-gray-400">
                {searchTerm || yearRange.min || yearRange.max || ratingRange.min || ratingRange.max
                  ? 'Try adjusting your filters or search terms'
                  : `We couldn't find any ${genre.name.toLowerCase()} movies at the moment.`
                }
              </p>
              {(searchTerm || yearRange.min || yearRange.max || ratingRange.min || ratingRange.max) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm('');
                    setYearRange({ min: '', max: '' });
                    setRatingRange({ min: '', max: '' });
                  }}
                  className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                >
                  <X className="inline w-5 h-5 mr-2" />
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                {searchTerm && `Search results for "${searchTerm}" • `}
                Showing {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
                {movies.length !== allMovies.length && ` of ${allMovies.length} total`}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}
              >
                {movies.map((movie, index) => (
                  <div
                    key={movie.id}
                    ref={index === movies.length - 1 ? lastMovieElementRef : null}
                  >
                    <GenreMovieCard
                      movie={movie}
                      onSelect={handleMovieClick}
                      viewMode={viewMode}
                      index={index}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {loadingMore && (
              <div className="mt-12 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-6 h-6 animate-spin text-cinema-blue" />
                  <span className="text-white">Loading more movies...</span>
                </div>
              </div>
            )}

            {hasMore && !loadingMore && movies.length >= 20 && (
              <div className="mt-12 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  className="flex items-center px-8 py-4 mx-auto space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                >
                  <Zap className="w-5 h-5" />
                  <span>Load More Movies</span>
                </motion.button>
              </div>
            )}

            {!hasMore && movies.length > 0 && (
              <div className="py-8 mt-12 text-center">
                <div className="inline-flex items-center px-6 py-3 space-x-2 border rounded-lg bg-glass-gradient backdrop-blur-glass border-white/20">
                  <div className="w-2 h-2 rounded-full bg-cinema-blue"></div>
                  <span className="text-gray-400">You've reached the end of {genre.name.toLowerCase()} movies</span>
                  <div className="w-2 h-2 rounded-full bg-cinema-blue"></div>
                </div>
              </div>
            )}
          </>
        )}

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed z-50 p-3 text-white transition-colors rounded-full shadow-lg bottom-8 right-8 bg-cinema-blue hover:bg-cinema-blue/80"
        >
          <ArrowLeft className="w-6 h-6 transform rotate-90" />
        </motion.button>
      </div>
    </div>
  );
};

export default GenrePage;