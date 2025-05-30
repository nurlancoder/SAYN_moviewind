import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Loader, Grid3X3, List } from 'lucide-react';
import tmdbService from '../services/tmdbService';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

// Movie Card Component for Genre Page
const GenreMovieCard = ({ movie, onSelect }) => {
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => onSelect(movie.id)}
      className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-4 cursor-pointer group"
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-cinema-blue text-white px-6 py-2 rounded-lg font-semibold"
          >
            View Details
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={`absolute top-2 right-2 backdrop-blur-sm p-2 rounded-full transition-colors ${
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
      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cinema-blue transition-colors">
        {movie.title}
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm">{movie.year}</span>
        <div className="flex items-center space-x-1">
          <svg className="text-yellow-400 w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-white text-sm font-semibold">{movie.rating}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm line-clamp-3">{movie.description}</p>
    </motion.div>
  );
};

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-4 animate-pulse">
    <div className="bg-gray-600 rounded-lg h-80 mb-4"></div>
    <div className="bg-gray-600 rounded h-6 mb-2"></div>
    <div className="flex justify-between mb-2">
      <div className="bg-gray-600 rounded h-4 w-16"></div>
      <div className="bg-gray-600 rounded h-4 w-12"></div>
    </div>
    <div className="space-y-2">
      <div className="bg-gray-600 rounded h-3 w-full"></div>
      <div className="bg-gray-600 rounded h-3 w-3/4"></div>
    </div>
  </div>
);

const GenrePage = () => {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const loadGenreData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load genre info and movies
        const [genresData, moviesData] = await Promise.all([
          tmdbService.getMovieGenres(),
          tmdbService.getMoviesByGenre(genreId, 1)
        ]);
        
        const genreInfo = genresData.find(g => g.id === parseInt(genreId));
        setGenre(genreInfo);
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

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await tmdbService.getMoviesByGenre(genreId, nextPage);
      
      setMovies(prev => [...prev, ...data.movies]);
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
      <div className="min-h-screen bg-cinema-darker pt-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="bg-gray-600 rounded h-8 w-64 mb-4 animate-pulse"></div>
            <div className="bg-gray-600 rounded h-4 w-96 animate-pulse"></div>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !genre) {
    return (
      <div className="min-h-screen bg-cinema-darker pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-white mb-4">Genre Not Found</h2>
          <p className="text-gray-400 mb-8">{error || 'The genre you\'re looking for doesn\'t exist.'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-cinema-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Back to Home
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-darker pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
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
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
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
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {genre.name} <span className="text-cinema-blue">Movies</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Discover the best {genre.name.toLowerCase()} movies from our collection
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {movies.length} movies found
          </div>
        </motion.div>

        {/* Movies Grid */}
        {movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Film className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No movies found</h3>
            <p className="text-gray-400 text-lg">
              We couldn't find any {genre.name.toLowerCase()} movies at the moment.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}
              layout
            >
              {movies.map((movie, index) => (
                <GenreMovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={handleMovieClick}
                />
              ))}
            </motion.div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-cinema-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Movies</span>
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenrePage;