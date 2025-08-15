import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { 
  ArrowLeft, Play, Heart, Star, Calendar, Clock, 
  Globe, DollarSign, Users, Loader, X, Share2
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
      <div className="flex items-center justify-center min-h-screen pt-24 bg-cinema-darker">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 text-cinema-blue animate-spin" />
          <p className="text-lg text-white">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24 bg-cinema-darker">
        <div className="max-w-md px-6 mx-auto text-center">
          <div className="mb-4 text-6xl text-red-400">😞</div>
          <h2 className="mb-4 text-2xl font-bold text-white">Movie Not Found</h2>
          <p className="mb-8 text-gray-400">{error || 'The movie you\'re looking for doesn\'t exist.'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
          >
            <ArrowLeft className="inline w-5 h-5 mr-2" />
            Back to Home
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-darker">
      <AnimatePresence>
        {showTrailer && selectedTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
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
                className="absolute right-0 z-10 text-white transition-colors -top-12 hover:text-cinema-blue"
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

      <div 
        className="relative flex items-end h-screen"
        style={{
          backgroundImage: movie.backdrop ? `url(${movie.backdrop})` : `url(${movie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-darker via-cinema-darker/60 to-transparent" />
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="absolute z-10 p-3 text-white transition-colors rounded-full top-24 left-6 bg-black/50 backdrop-blur-sm hover:bg-black/70"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="relative z-10 w-full px-6 pb-16 mx-auto max-w-7xl">
          <div className="grid items-end grid-cols-1 gap-8 lg:grid-cols-3">
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
                  className="shadow-2xl w-80 rounded-2xl"
                />
              ) : (
                <div className="flex items-center justify-center w-80 h-96 bg-cinema-accent rounded-2xl">
                  <span className="text-lg text-gray-500">No Poster</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center lg:col-span-2 lg:text-left"
            >
              <h1 className="mb-4 text-4xl font-bold text-white lg:text-6xl">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="mb-6 text-xl italic text-cinema-blue">"{movie.tagline}"</p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-gray-300 lg:justify-start">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
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

              <div className="flex flex-wrap justify-center gap-2 mb-8 lg:justify-start">
                {movie.genres && movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 text-sm font-medium border rounded-full bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8 lg:justify-start">
                {movie.trailers && movie.trailers.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center px-8 py-4 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
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
                  className="flex items-center px-8 py-4 space-x-2 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <Share2 className="w-6 h-6" />
                  <span>Share</span>
                </motion.button>
              </div>

              <p className="max-w-3xl text-lg leading-relaxed text-gray-300">
                {movie.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-6 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            {movie.cast && movie.cast.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-6 text-2xl font-bold text-white">Cast</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {movie.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      {actor.profilePicture ? (
                        <img
                          src={actor.profilePicture}
                          alt={actor.name}
                          className="object-cover w-24 h-24 mx-auto mb-3 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-3 rounded-full bg-cinema-accent">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <h3 className="text-sm font-medium text-white">{actor.name}</h3>
                      {actor.character && (
                        <p className="text-xs text-gray-400">{actor.character}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {movie.trailers && movie.trailers.length > 1 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-6 text-2xl font-bold text-white">Trailers</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {movie.trailers.slice(0, 4).map((trailer) => (
                    <motion.div
                      key={trailer.key}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedTrailer(trailer);
                        setShowTrailer(true);
                      }}
                      className="relative overflow-hidden rounded-lg cursor-pointer bg-cinema-accent group"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
                        alt={trailer.name}
                        className="object-cover w-full h-32"
                      />
                      <div className="absolute inset-0 flex items-center justify-center transition-colors bg-black/40 group-hover:bg-black/20">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-white">{trailer.name}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl"
            >
              <h3 className="mb-4 text-lg font-bold text-white">Movie Facts</h3>
              <div className="space-y-4">
                {movie.status && (
                  <div>
                    <span className="text-sm text-gray-400">Status</span>
                    <p className="text-white">{movie.status}</p>
                  </div>
                )}
                {movie.budget > 0 && (
                  <div>
                    <span className="flex items-center space-x-1 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget</span>
                    </span>
                    <p className="text-white">{formatCurrency(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <span className="flex items-center space-x-1 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Revenue</span>
                    </span>
                    <p className="text-white">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}
                {movie.homepage && (
                  <div>
                    <span className="flex items-center space-x-1 text-sm text-gray-400">
                      <Globe className="w-4 h-4" />
                      <span>Official Site</span>
                    </span>
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors text-cinema-blue hover:text-cinema-blue/80"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {movie.crew && movie.crew.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl"
              >
                <h3 className="mb-4 text-lg font-bold text-white">Key Crew</h3>
                <div className="space-y-3">
                  {movie.crew.map((member) => (
                    <div key={`${member.id}-${member.job}`}>
                      <h4 className="font-medium text-white">{member.name}</h4>
                      <p className="text-sm text-gray-400">{member.job}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {similarMovies.length > 0 && (
        <div className="px-6 pb-16 mx-auto max-w-7xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-3xl font-bold text-white"
          >
            Similar Movies
          </motion.h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
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
                    className="object-cover w-full h-64 transition-shadow rounded-lg shadow-lg group-hover:shadow-2xl"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-64 rounded-lg bg-cinema-accent">
                    <span className="text-gray-500">No Poster</span>
                  </div>
                )}
                <h3 className="mt-3 text-sm font-medium text-white transition-colors group-hover:text-cinema-blue">
                  {similarMovie.title}
                </h3>
                <div className="flex items-center mt-1 space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">{similarMovie.rating}</span>
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