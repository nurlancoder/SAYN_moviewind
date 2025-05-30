import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { 
  ArrowLeft, Play, Heart, BookmarkPlus, Star, Calendar, Clock, 
  Globe, DollarSign, Users, Loader, X, Share2, ThumbsUp
} from 'lucide-react';
import tmdbService from '../services/tmdbService';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [movieData, similarData] = await Promise.all([
          tmdbService.getMovieDetails(id),
          tmdbService.getSimilarMovies(id)
        ]);
        
        setMovie(movieData);
        setSimilarMovies(similarData.slice(0, 8));
        
        // Set first trailer as default
        if (movieData.trailers && movieData.trailers.length > 0) {
          setSelectedTrailer(movieData.trailers[0]);
        }
      } catch (err) {
        setError('Failed to load movie details');
        console.error('Error loading movie:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovieDetails();
    }
  }, [id]);

  const handleFavoriteClick = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    await toggleFavorite(movie);
    setFavoriteLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-darker pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-cinema-blue animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-cinema-darker pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-white mb-4">Movie Not Found</h2>
          <p className="text-gray-400 mb-8">{error || 'The movie you\'re looking for doesn\'t exist.'}</p>
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
    <div className="min-h-screen bg-cinema-darker">
      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && selectedTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-6xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 text-white hover:text-cinema-blue transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${selectedTrailer.key}`}
                width="100%"
                height="100%"
                playing={true}
                controls={true}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0
                    }
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-end"
        style={{
          backgroundImage: movie.backdrop ? `url(${movie.backdrop})` : `url(${movie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-darker via-cinema-darker/60 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Movie Poster */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center lg:justify-start"
            >
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-80 rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-80 h-96 bg-cinema-accent rounded-2xl flex items-center justify-center">
                  <span className="text-gray-500 text-lg">No Poster</span>
                </div>
              )}
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 text-center lg:text-left"
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-cinema-blue text-xl italic mb-6">"{movie.tagline}"</p>
              )}

              {/* Movie Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400 w-5 h-5 fill-current" />
                  <span className="font-semibold">{movie.rating}</span>
                  <span className="text-sm">({movie.voteCount} votes)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{movie.year}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {movie.genres && movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-cinema-blue/20 text-cinema-blue rounded-full border border-cinema-blue/30 text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                {movie.trailers && movie.trailers.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center space-x-2 bg-cinema-blue text-white px-8 py-4 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors"
                  >
                    <Play className="w-6 h-6" />
                    <span>Watch Trailer</span>
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold transition-colors ${
                    isFavorite(movie.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {favoriteLoading ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : (
                    <Heart className={`w-6 h-6 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
                  )}
                  <span>{isFavorite(movie.id) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                  <span>Share</span>
                </motion.button>
              </div>

              {/* Overview */}
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {movie.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      {actor.profilePicture ? (
                        <img
                          src={actor.profilePicture}
                          alt={actor.name}
                          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-cinema-accent flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <h3 className="text-white font-medium text-sm">{actor.name}</h3>
                      {actor.character && (
                        <p className="text-gray-400 text-xs">{actor.character}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Trailers */}
            {movie.trailers && movie.trailers.length > 1 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Trailers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.trailers.slice(0, 4).map((trailer) => (
                    <motion.div
                      key={trailer.key}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedTrailer(trailer);
                        setShowTrailer(true);
                      }}
                      className="relative bg-cinema-accent rounded-lg overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
                        alt={trailer.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Play className="text-white w-12 h-12" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-medium text-sm">{trailer.name}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Movie Facts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-6"
            >
              <h3 className="text-white font-bold text-lg mb-4">Movie Facts</h3>
              <div className="space-y-4">
                {movie.status && (
                  <div>
                    <span className="text-gray-400 text-sm">Status</span>
                    <p className="text-white">{movie.status}</p>
                  </div>
                )}
                {movie.budget > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget</span>
                    </span>
                    <p className="text-white">{formatCurrency(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Revenue</span>
                    </span>
                    <p className="text-white">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}
                {movie.homepage && (
                  <div>
                    <span className="text-gray-400 text-sm flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>Official Site</span>
                    </span>
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cinema-blue hover:text-cinema-blue/80 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Crew */}
            {movie.crew && movie.crew.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4">Key Crew</h3>
                <div className="space-y-3">
                  {movie.crew.map((member) => (
                    <div key={`${member.id}-${member.job}`}>
                      <h4 className="text-white font-medium">{member.name}</h4>
                      <p className="text-gray-400 text-sm">{member.job}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-8"
          >
            Similar Movies
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {similarMovies.map((similarMovie) => (
              <motion.div
                key={similarMovie.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => navigate(`/movie/${similarMovie.id}`)}
                className="cursor-pointer group"
              >
                {similarMovie.poster ? (
                  <img
                    src={similarMovie.poster}
                    alt={similarMovie.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow"
                  />
                ) : (
                  <div className="w-full h-64 bg-cinema-accent rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No Poster</span>
                  </div>
                )}
                <h3 className="text-white font-medium mt-3 text-sm group-hover:text-cinema-blue transition-colors">
                  {similarMovie.title}
                </h3>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="text-yellow-400 w-3 h-3 fill-current" />
                  <span className="text-gray-400 text-xs">{similarMovie.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;