import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Heart, BookmarkPlus, Star, Calendar, Clock,
  Eye, Download, Share2, Info, Loader, Volume2, VolumeX,
  Award, TrendingUp, Users, Zap, Check, Plus, X,
  ChevronLeft, ChevronRight, ExternalLink, PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const MovieCard = ({ 
  movie, 
  showExtendedInfo = false, 
  onWatchNow, 
  onDownload,
  showTrailer = false,
  enableAutoplay = false,
  showSimilar = false,
  compactMode = false,
  enableHoverEffects = true
}) => {
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [trailerMuted, setTrailerMuted] = useState(true);
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const hoverTimeoutRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (enableAutoplay && isHovered && movie.trailer_url) {
      const timer = setTimeout(() => {
        setShowTrailerPreview(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowTrailerPreview(false);
    }
  }, [isHovered, enableAutoplay, movie.trailer_url]);

  const handleMouseEnter = () => {
    if (enableHoverEffects) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
    setShowTrailerPreview(false);
    setShowShareMenu(false);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      await toggleFavorite(movie);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setWatchlistLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleWatchClick = (e) => {
    e.stopPropagation();
    if (onWatchNow) {
      onWatchNow(movie);
    } else {
      console.log('Watch movie:', movie.title);
    }
  };

  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          if (onDownload) {
            onDownload(movie);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleShare = async (platform) => {
    const url = `${window.location.origin}/movie/${movie.id}`;
    const text = `Check out ${movie.title} on SAYN!`;
    
    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: movie.title,
          text: text,
          url: url
        });
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        let shareUrl = '';
        switch (platform) {
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            break;
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            break;
        }
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    
    setShowShareMenu(false);
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleImageNavigation = (direction) => {
    if (!movie.images || movie.images.length === 0) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % movie.images.length;
      } else {
        return prev === 0 ? movie.images.length - 1 : prev - 1;
      }
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getGenreNames = (genreIds) => {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    
    if (!genreIds || !Array.isArray(genreIds)) return [];
    return genreIds.slice(0, 3).map(id => genreMap[id]).filter(Boolean);
  };

  const getQualityBadge = () => {
    if (movie.quality) {
      const qualityColors = {
        '4K': 'from-purple-500 to-pink-500',
        'HD': 'from-blue-500 to-cyan-500',
        'FHD': 'from-green-500 to-emerald-500',
        'SD': 'from-gray-500 to-gray-600'
      };
      return (
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${qualityColors[movie.quality] || 'from-gray-500 to-gray-600'} px-2 py-1 rounded-lg`}>
          <span className="text-xs font-bold text-white">{movie.quality}</span>
        </div>
      );
    }
    return null;
  };

  const getTrendingBadge = () => {
    if (movie.is_trending) {
      return (
        <div className="absolute flex items-center px-2 py-1 space-x-1 rounded-lg top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500">
          <TrendingUp className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">TRENDING</span>
        </div>
      );
    }
    return null;
  };

  const getAwardBadge = () => {
    if (movie.awards && movie.awards.length > 0) {
      return (
        <div className="absolute flex items-center px-2 py-1 space-x-1 rounded-lg bottom-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500">
          <Award className="w-3 h-3 text-black" />
          <span className="text-xs font-bold text-black">{movie.awards.length}</span>
        </div>
      );
    }
    return null;
  };

  if (compactMode) {
    return (
      <motion.div
        className="flex overflow-hidden border rounded-lg cursor-pointer bg-glass-gradient backdrop-blur-glass border-white/20 group hover:bg-white/5"
        onClick={handleCardClick}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative w-20 overflow-hidden h-28">
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
        <div className="flex-1 p-3">
          <h4 className="mb-1 text-sm font-semibold text-white line-clamp-1">{movie.title}</h4>
          <p className="mb-2 text-xs text-gray-400">{movie.year}</p>
          <div className="flex items-center space-x-2">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-white">{movie.rating}</span>
          </div>
        </div>
        <div className="flex items-center p-3">
          <motion.button
            onClick={handleWatchClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-white rounded-full bg-cinema-blue hover:bg-cinema-blue/80"
          >
            <Play className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden border cursor-pointer bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl group"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="flex items-center justify-center w-full h-80 bg-cinema-accent">
            <Loader className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        )}
        
        {movie.poster && (
          <div className="relative">
            <img 
              src={movie.images && movie.images.length > 0 ? movie.images[currentImageIndex] : movie.poster} 
              alt={movie.title}
              className={`w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-700 ${
                imageLoaded ? 'block' : 'hidden'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {movie.images && movie.images.length > 1 && isHovered && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNavigation('prev');
                  }}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-white rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNavigation('next');
                  }}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-white rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {movie.images && movie.images.length > 1 && (
              <div className="absolute flex space-x-1 transform -translate-x-1/2 bottom-2 left-1/2">
                {movie.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!movie.poster && imageLoaded && (
          <div className="flex items-center justify-center w-full h-80 bg-gradient-to-br from-cinema-blue/20 to-purple-600/20">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-white/10">
                <Play className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-white">{movie.title}</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showTrailerPreview && movie.trailer_url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <video
                src={movie.trailer_url}
                autoPlay
                muted={trailerMuted}
                loop
                className="object-cover w-full h-full"
              />
              <div className="absolute flex space-x-2 top-2 right-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrailerMuted(!trailerMuted);
                  }}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-white rounded-full bg-black/50 backdrop-blur-sm"
                >
                  {trailerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTrailerPreview(false);
                  }}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-white rounded-full bg-black/50 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-black/60 group-hover:opacity-100">
          <div className="flex space-x-4">
            <motion.button
              onClick={handleWatchClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-4 text-white transition-colors rounded-full bg-cinema-blue/80 backdrop-blur-sm hover:bg-cinema-blue"
            >
              <Play className="w-8 h-8 fill-current" />
            </motion.button>
            
            {movie.trailer_url && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTrailerPreview(!showTrailerPreview);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-4 text-white transition-colors rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <PlayCircle className="w-8 h-8" />
              </motion.button>
            )}
          </div>
        </div>

        <div className="absolute flex flex-col space-y-2 transition-opacity duration-300 opacity-0 top-3 right-3 group-hover:opacity-100">
          <div className="relative">
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
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute px-2 py-1 mr-2 text-xs text-white transform -translate-y-1/2 rounded right-full top-1/2 bg-black/80 whitespace-nowrap"
                >
                  {isFavorite(movie.id) ? 'Added to favorites!' : 'Removed from favorites!'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWatchlistClick}
            disabled={watchlistLoading}
            className={`backdrop-blur-sm p-2 rounded-full transition-colors ${
              isInWatchlist
                ? 'bg-green-500/80 text-white'
                : 'bg-black/50 text-white hover:text-cinema-blue'
            }`}
          >
            {watchlistLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : isInWatchlist ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </motion.button>

          {currentUser && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="p-2 text-white transition-colors rounded-full bg-black/50 backdrop-blur-sm hover:text-green-400"
              >
                {isDownloading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </motion.button>
              
              {isDownloading && (
                <div className="absolute right-0 w-20 p-1 mt-1 rounded top-full bg-black/80">
                  <div className="h-1 transition-all duration-300 bg-green-500 rounded" style={{ width: `${downloadProgress}%` }} />
                  <div className="mt-1 text-xs text-center text-white">{downloadProgress}%</div>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShareClick}
              className="p-2 text-white transition-colors rounded-full bg-black/50 backdrop-blur-sm hover:text-blue-400"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-0 p-2 mr-2 space-y-1 rounded-lg right-full bg-black/90 backdrop-blur-sm"
                >
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-white transition-colors rounded hover:bg-white/10"
                  >
                    <span className="text-xs">Copy Link</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-white transition-colors rounded hover:bg-white/10"
                  >
                    <span className="text-xs">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center w-full px-3 py-2 space-x-2 text-white transition-colors rounded hover:bg-white/10"
                  >
                    <span className="text-xs">Facebook</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {shareSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute px-2 py-1 mr-2 text-xs text-white transform -translate-y-1/2 rounded right-full top-1/2 bg-green-500/80 whitespace-nowrap"
                >
                  Link copied!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickViewClick}
            className="p-2 text-white transition-colors rounded-full bg-black/50 backdrop-blur-sm hover:text-purple-400"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {getTrendingBadge()}
        {getQualityBadge()}
        {getAwardBadge()}

        {movie.rating && (
          <div className="absolute px-2 py-1 rounded-lg top-3 left-3 bg-black/70 backdrop-blur-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold text-white">{movie.rating}</span>
            </div>
          </div>
        )}

        {movie.is_premium && (
          <div className="absolute px-2 py-1 rounded-lg bottom-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500">
            <span className="text-xs font-bold text-black">PREMIUM</span>
          </div>
        )}

        {movie.is_new && (
          <div className="absolute px-2 py-1 rounded-lg top-3 right-3 bg-gradient-to-r from-green-400 to-blue-500">
            <span className="text-xs font-bold text-white">NEW</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="flex-1 text-lg font-bold text-white transition-colors group-hover:text-cinema-blue line-clamp-2">
            {movie.title}
          </h3>
          {movie.imdb_url && (
            <motion.a
              href={movie.imdb_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              className="ml-2 text-yellow-400 hover:text-yellow-300"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            {movie.year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{movie.year}</span>
              </div>
            )}
            
            {movie.runtime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}

            {movie.age_rating && (
              <div className="px-2 py-1 text-xs text-white border rounded bg-gray-700/50">
                {movie.age_rating}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-400">
            {movie.vote_count && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{movie.vote_count.toLocaleString()}</span>
              </div>
            )}
            
            {movie.popularity && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{Math.round(movie.popularity)}</span>
              </div>
            )}
          </div>
        </div>

        {(movie.genres || movie.genre_ids) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(movie.genres || getGenreNames(movie.genre_ids)).slice(0, 3).map((genre, index) => (
              <motion.span 
                key={index}
                whileHover={{ scale: 1.05 }}
                className="px-2 py-1 text-xs transition-colors border rounded-full cursor-pointer bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30 hover:bg-cinema-blue/30"
              >
                {typeof genre === 'string' ? genre : genre.name}
              </motion.span>
            ))}
          </div>
        )}

        <p className="mb-3 text-sm leading-relaxed text-gray-400 line-clamp-3">
          {movie.description || movie.overview || 'No description available.'}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {movie.original_language && movie.original_language !== 'en' && (
            <span className="px-2 py-1 text-xs text-purple-300 border rounded bg-purple-500/20 border-purple-500/30">
              {movie.original_language.toUpperCase()}
            </span>
          )}
          
          {movie.has_subtitles && (
            <span className="px-2 py-1 text-xs text-blue-300 border rounded bg-blue-500/20 border-blue-500/30">
              SUBTITLES
            </span>
          )}
          
          {movie.has_dubbing && (
            <span className="px-2 py-1 text-xs text-green-300 border rounded bg-green-500/20 border-green-500/30">
              DUBBED
            </span>
          )}
          
          {movie.is_4k && (
            <span className="px-2 py-1 text-xs text-purple-300 border rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              4K UHD
            </span>
          )}
        </div>

        {showExtendedInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 mt-4 border-t border-white/10"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              {movie.director && (
                <div>
                  <span className="text-gray-400">Director:</span>
                  <p className="font-medium text-white">{movie.director}</p>
                </div>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-gray-400">Stars:</span>
                  <p className="font-medium text-white">
                    {movie.cast.slice(0, 2).map(actor => actor.name || actor).join(', ')}
                  </p>
                </div>
              )}
              
              {movie.language && (
                <div>
                  <span className="text-gray-400">Language:</span>
                  <p className="font-medium text-white">{movie.language}</p>
                </div>
              )}
              
              {movie.imdb_rating && (
                <div>
                  <span className="text-gray-400">IMDb:</span>
                  <p className="flex items-center space-x-1 font-medium text-white">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{movie.imdb_rating}/10</span>
                  </p>
                </div>
              )}

              {movie.budget && (
                <div>
                  <span className="text-gray-400">Budget:</span>
                  <p className="font-medium text-white">${(movie.budget / 1000000).toFixed(1)}M</p>
                </div>
              )}

              {movie.revenue && (
                <div>
                  <span className="text-gray-400">Revenue:</span>
                  <p className="font-medium text-white">${(movie.revenue / 1000000).toFixed(1)}M</p>
                </div>
              )}

              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="col-span-2">
                  <span className="text-gray-400">Production:</span>
                  <p className="font-medium text-white">
                    {movie.production_companies.slice(0, 2).map(company => company.name || company).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {showSimilar && movie.similar_movies && movie.similar_movies.length > 0 && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <h4 className="mb-2 font-semibold text-white">Similar Movies</h4>
                <div className="flex space-x-2 overflow-x-auto">
                  {movie.similar_movies.slice(0, 4).map((similar, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0 w-16 h-20 overflow-hidden bg-gray-700 rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/movie/${similar.id}`);
                      }}
                    >
                      <img 
                        src={similar.poster} 
                        alt={similar.title}
                        className="object-cover w-full h-full"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex mt-4 space-x-2">
          <motion.button
            onClick={handleWatchClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80 group"
          >
            <Play className="w-4 h-4 group-hover:animate-pulse" />
            <span>Watch Now</span>
          </motion.button>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movie/${movie.id}`);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center px-4 py-2 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
          >
            <Info className="w-4 h-4" />
          </motion.button>

          {movie.trailer_url && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                window.open(movie.trailer_url, '_blank');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center px-4 py-2 font-semibold text-purple-300 transition-colors rounded-lg bg-purple-500/20 hover:bg-purple-500/30"
            >
              <PlayCircle className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {(movie.user_rating || movie.critics_score) && (
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              {movie.user_rating && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Users:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-white">{movie.user_rating}/10</span>
                  </div>
                </div>
              )}
              
              {movie.critics_score && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Critics:</span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-4 h-4 rounded-full ${movie.critics_score >= 70 ? 'bg-green-500' : movie.critics_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="font-semibold text-white">{movie.critics_score}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {movie.tags && movie.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {movie.tags.slice(0, 4).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs text-gray-300 border rounded-full bg-gray-700/30 border-gray-600/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {movie.watch_progress && movie.watch_progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="relative w-full h-2 bg-gray-700">
            <motion.div 
              className="h-2 rounded-r bg-gradient-to-r from-cinema-blue to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${movie.watch_progress}%` }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute top-0 bottom-0 flex items-center right-2">
              <span className="text-xs font-semibold text-white">
                {Math.round(movie.watch_progress)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{movie.title}</h2>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="object-cover w-full rounded-lg h-80"
                  />
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleWatchClick}
                      className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                    >
                      <Play className="w-4 h-4" />
                      <span>Watch Now</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowQuickView(false);
                        navigate(`/movie/${movie.id}`);
                      }}
                      className="px-4 py-2 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      More Info
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {movie.description || movie.overview || 'No description available.'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {movie.director && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Director:</span>
                        <span className="text-white">{movie.director}</span>
                      </div>
                    )}
                    
                    {movie.year && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Year:</span>
                        <span className="text-white">{movie.year}</span>
                      </div>
                    )}
                    
                    {movie.runtime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Runtime:</span>
                        <span className="text-white">{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                    
                    {movie.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white">{movie.rating}/10</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {(movie.genres || movie.genre_ids) && (
                    <div>
                      <span className="text-sm text-gray-400">Genres:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(movie.genres || getGenreNames(movie.genre_ids)).map((genre, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs border rounded-full bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30"
                          >
                            {typeof genre === 'string' ? genre : genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {favoriteLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MovieCard;