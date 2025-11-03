import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, Download, Share2,
  ArrowLeft, Heart, Star, Clock, Subtitles,
  Loader, AlertCircle, CheckCircle, Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import tmdbService from '../services/tmdbService';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const VideoPlayer = ({ 
  src, 
  poster, 
  onTimeUpdate, 
  onDurationChange,
  currentTime,
  duration,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  isFullscreen,
  setIsFullscreen,
  qualityOptions,
  subtitleOptions,
  playbackSpeedOptions
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSetting, setActiveSetting] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(qualityOptions?.[0]);
  const [selectedSubtitle, setSelectedSubtitle] = useState(subtitleOptions?.[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handleDurationChange = () => {
      onDurationChange(video.duration);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.code === 'ArrowRight') {
        video.currentTime = Math.min(duration, video.currentTime + 5);
      }
      if (e.code === 'ArrowLeft') {
        video.currentTime = Math.max(0, video.currentTime - 5);
      }
      if (e.code === 'KeyM') {
        setVolume(volume > 0 ? 0 : 50);
      }
      if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTimeUpdate, onDurationChange, isPlaying, volume, duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Playback failed:', error);
          setIsPlaying(false);
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume / 100;
      video.playbackRate = playbackSpeed;
    }
  }, [volume, playbackSpeed]);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen?.().catch(err => {
        console.error('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const toggleSettings = (setting = null) => {
    if (activeSetting === setting) {
      setActiveSetting(null);
      setShowSettings(false);
    } else {
      setActiveSetting(setting);
      setShowSettings(true);
    }
  };

  const handleQualityChange = (quality) => {
    setSelectedQuality(quality);
    setShowSettings(false);
    setActiveSetting(null);
  };

  const handleSubtitleChange = (subtitle) => {
    setSelectedSubtitle(subtitle);
    setShowSettings(false);
    setActiveSetting(null);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    setShowSettings(false);
    setActiveSetting(null);
  };

  return (
    <div 
      ref={playerRef}
      className={`relative w-full bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="object-contain w-full h-full"
        poster={poster}
        onClick={() => setIsPlaying(!isPlaying)}
        onDoubleClick={toggleFullscreen}
      >
        {src && <source src={src} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-12 h-12 text-white" />
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {!isPlaying && !isBuffering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.button
              onClick={() => setIsPlaying(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-6 text-white transition-colors rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
            >
              <Play className="w-12 h-12 fill-current" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          >
            <div className="mb-4">
              <div 
                className="w-full h-2 rounded-full cursor-pointer bg-white/30 group"
                onClick={handleSeek}
              >
                <div 
                  className="relative h-full transition-all rounded-full bg-cinema-blue group-hover:h-3"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 w-4 h-4 transition-opacity transform -translate-y-1/2 rounded-full opacity-0 top-1/2 bg-cinema-blue group-hover:opacity-100" />
                </div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-white">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white transition-colors hover:text-cinema-blue"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>

                <motion.button
                  onClick={() => {
                    const video = videoRef.current;
                    video.currentTime = Math.max(0, video.currentTime - 10);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white transition-colors hover:text-cinema-blue"
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={() => {
                    const video = videoRef.current;
                    video.currentTime = Math.min(duration, video.currentTime + 10);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white transition-colors hover:text-cinema-blue"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setVolume(volume > 0 ? 0 : 50)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white transition-colors hover:text-cinema-blue"
                  >
                    {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-20 accent-cinema-blue"
                  />
                </div>

                <span className="text-sm text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <motion.button
                    onClick={() => toggleSettings('subtitles')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`text-white hover:text-cinema-blue transition-colors ${activeSetting === 'subtitles' ? 'text-cinema-blue' : ''}`}
                  >
                    <Subtitles className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="relative">
                  <motion.button
                    onClick={() => toggleSettings('settings')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`text-white hover:text-cinema-blue transition-colors ${activeSetting === 'settings' ? 'text-cinema-blue' : ''}`}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>

                  <AnimatePresence>
                    {showSettings && activeSetting === 'settings' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute right-0 z-50 w-48 overflow-hidden rounded-lg shadow-lg bottom-10 bg-cinema-darker"
                      >
                        <button 
                          onClick={() => toggleSettings('quality')}
                          className="flex items-center justify-between w-full px-4 py-2 text-left text-white hover:bg-white/10"
                        >
                          <span>Quality</span>
                          <span>{selectedQuality?.label || 'Auto'}</span>
                        </button>
                        <button 
                          onClick={() => toggleSettings('speed')}
                          className="flex items-center justify-between w-full px-4 py-2 text-left text-white hover:bg-white/10"
                        >
                          <span>Speed</span>
                          <span>{playbackSpeed}x</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showSettings && activeSetting === 'quality' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute right-0 z-50 w-48 overflow-hidden rounded-lg shadow-lg bottom-10 bg-cinema-darker"
                      >
                        {qualityOptions?.map((quality) => (
                          <button
                            key={quality.value}
                            onClick={() => handleQualityChange(quality)}
                            className={`w-full px-4 py-2 text-left ${selectedQuality?.value === quality.value ? 'text-cinema-blue' : 'text-white'} hover:bg-white/10 flex items-center`}
                          >
                            {quality.label}
                            {selectedQuality?.value === quality.value && (
                              <CheckCircle className="w-4 h-4 ml-2" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showSettings && activeSetting === 'speed' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute right-0 z-50 w-48 overflow-hidden rounded-lg shadow-lg bottom-10 bg-cinema-darker"
                      >
                        {playbackSpeedOptions?.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full px-4 py-2 text-left ${playbackSpeed === speed ? 'text-cinema-blue' : 'text-white'} hover:bg-white/10 flex items-center`}
                          >
                            {speed}x
                            {playbackSpeed === speed && (
                              <CheckCircle className="w-4 h-4 ml-2" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showSettings && activeSetting === 'subtitles' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute right-0 z-50 w-48 overflow-hidden rounded-lg shadow-lg bottom-10 bg-cinema-darker"
                      >
                        {subtitleOptions?.map((subtitle) => (
                          <button
                            key={subtitle.value}
                            onClick={() => handleSubtitleChange(subtitle)}
                            className={`w-full px-4 py-2 text-left ${selectedSubtitle?.value === subtitle.value ? 'text-cinema-blue' : 'text-white'} hover:bg-white/10 flex items-center`}
                          >
                            {subtitle.label}
                            {selectedSubtitle?.value === subtitle.value && (
                              <CheckCircle className="w-4 h-4 ml-2" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={toggleFullscreen}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white transition-colors hover:text-cinema-blue"
                >
                  <Maximize className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WatchMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [watchSession, setWatchSession] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const qualityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: '1080', label: '1080p' },
    { value: '720', label: '720p' },
    { value: '480', label: '480p' }
  ];

  const subtitleOptions = [
    { value: 'none', label: 'None' },
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' }
  ];

  const playbackSpeedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    loadMovieDetails();
    checkUserLists();
    loadRecommendations();
    
    return () => {
      if (currentUser && movie && duration > 0) {
        updateWatchProgress();
      }
    };
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && currentTime > 0 && movie) {
        updateWatchProgress();
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, movie]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const movieData = await tmdbService.getMovieDetails(id);
      setMovie(movieData);
      
      if (currentUser) {
        try {
          const ratingsResponse = await axios.get(`${BACKEND_URL}/api/movies/${id}/ratings`);
          const userRating = ratingsResponse.data.ratings?.find(r => r.user_id === currentUser.uid);
          setHasRated(!!userRating);
        } catch (error) {
          console.error('Error checking user rating:', error);
        }
      }
    } catch (error) {
      console.error('Error loading movie:', error);
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserLists = async () => {
    if (!currentUser) return;
    
    try {
      const [favoritesRes, watchlistRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/users/${currentUser.uid}/favorites`),
        axios.get(`${BACKEND_URL}/api/users/${currentUser.uid}/watchlist`)
      ]);
      
      setIsFavorite(favoritesRes.data.some(m => m.id === id));
      setIsWatchlist(watchlistRes.data.some(m => m.id === id));
    } catch (error) {
      console.error('Error checking user lists:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await tmdbService.getMovieRecommendations(id);
      setRecommendations(response.results.slice(0, 6));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const updateWatchProgress = async () => {
    if (!currentUser || !movie || !duration) return;

    const progressPercentage = (currentTime / duration) * 100;
    const watchData = {
      user_id: currentUser.uid,
      movie_id: movie.id,
      movie_title: movie.title,
      movie_poster: movie.poster,
      watch_duration: Math.floor(currentTime / 60), 
      total_duration: Math.floor(duration / 60),
      progress_percentage: progressPercentage,
      completed: progressPercentage >= 90 
    };

    try {
      await axios.post(`${BACKEND_URL}/api/watch-history`, watchData);
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        await axios.delete(`${BACKEND_URL}/api/users/${currentUser.uid}/favorites/${id}`);
      } else {
        await axios.post(`${BACKEND_URL}/api/users/${currentUser.uid}/favorites`, {
          movie_id: id,
          movie_title: movie.title,
          movie_poster: movie.poster
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleWatchlist = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isWatchlist) {
        await axios.delete(`${BACKEND_URL}/api/users/${currentUser.uid}/watchlist/${id}`);
      } else {
        await axios.post(`${BACKEND_URL}/api/users/${currentUser.uid}/watchlist`, {
          movie_id: id,
          movie_title: movie.title,
          movie_poster: movie.poster
        });
      }
      setIsWatchlist(!isWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  const handleDownload = async () => {
    console.log('Downloading movie:', movie.title);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.title,
          text: `Watch ${movie.title} on SAYN!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateMovie = () => {
    navigate(`/movie/${id}#reviews`);
  };

  const handleRecommendationClick = (movieId) => {
    navigate(`/watch/${movieId}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cinema-darker">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-12 h-12 text-cinema-blue" />
        </motion.div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cinema-darker">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">Error Loading Movie</h2>
          <p className="mb-6 text-gray-400">{error || 'Movie not found'}</p>
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 mx-auto space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </motion.button>
        </div>
      </div>
    );
  }

  const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;

  return (
    <div className="min-h-screen bg-cinema-darker">
      <div className="absolute z-50 top-6 left-6">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 text-white transition-colors rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
      </div>

      <VideoPlayer
        src={videoUrl}
        poster={movie.poster}
        onTimeUpdate={setCurrentTime}
        onDurationChange={setDuration}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        volume={volume}
        setVolume={setVolume}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        qualityOptions={qualityOptions}
        subtitleOptions={subtitleOptions}
        playbackSpeedOptions={playbackSpeedOptions}
      />

      {!isFullscreen && (
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div>
                  <div className="flex items-start justify-between">
                    <h1 className="mb-4 text-4xl font-bold text-white">{movie.title}</h1>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={toggleFavorite}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </motion.button>
                      <motion.button
                        onClick={toggleWatchlist}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full ${isWatchlist ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white'}`}
                      >
                        <Bookmark className={`w-5 h-5 ${isWatchlist ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </div>
                  
                  {movie.tagline && (
                    <p className="mb-4 text-lg italic text-cinema-blue">"{movie.tagline}"</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-white">{movie.rating}</span>
                      <span className="text-gray-400">({movie.voteCount} votes)</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime} min</span>
                    </div>
                    
                    <span className="text-gray-400">{movie.year}</span>
                    
                    {movie.certification && (
                      <span className="px-2 py-1 text-sm text-white rounded bg-white/20">
                        {movie.certification}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres && movie.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 border rounded-full bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-lg leading-relaxed text-gray-300">
                    {movie.description}
                  </p>
                </div>

                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-white">Cast</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {movie.cast.slice(0, 6).map((actor) => (
                        <div key={actor.id} className="p-3 transition-colors rounded-lg cursor-pointer bg-white/10 hover:bg-white/20">
                          <p className="font-semibold text-white">{actor.name}</p>
                          {actor.character && (
                            <p className="text-sm text-gray-400">{actor.character}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">You May Also Like</h3>
                      <button 
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="transition-colors text-cinema-blue hover:text-cinema-blue/80"
                      >
                        {showRecommendations ? 'Hide' : 'Show All'}
                      </button>
                    </div>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${showRecommendations ? '6' : '3'} gap-4`}>
                      {recommendations.slice(0, showRecommendations ? 6 : 3).map((rec) => (
                        <motion.div
                          key={rec.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleRecommendationClick(rec.id)}
                          className="overflow-hidden rounded-lg cursor-pointer bg-white/10"
                        >
                          <img 
                            src={rec.poster} 
                            alt={rec.title} 
                            className="w-full aspect-[2/3] object-cover"
                          />
                          <div className="p-2">
                            <p className="font-semibold text-white truncate">{rec.title}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400">{rec.rating}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-6 space-y-4 bg-white/10 rounded-xl">
                  <h3 className="mb-4 text-lg font-bold text-white">Actions</h3>
                  
                  <motion.button
                    onClick={handleDownload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-semibold text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </motion.button>

                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </motion.button>

                  {!hasRated && currentUser && (
                    <motion.button
                      onClick={handleRateMovie}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-semibold text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
                    >
                      <Star className="w-5 h-5" />
                      <span>Rate Movie</span>
                    </motion.button>
                  )}

                  {hasRated && (
                    <div className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-semibold text-green-400 border rounded-lg bg-green-500/20 border-green-500/30">
                      <CheckCircle className="w-5 h-5" />
                      <span>Already Rated</span>
                    </div>
                  )}

                  {currentUser && (
                    <>
                      <motion.button
                        onClick={toggleFavorite}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full ${isFavorite ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-white/10 text-white'} px-4 py-3 rounded-lg font-semibold border flex items-center justify-center space-x-2`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </motion.button>

                      <motion.button
                        onClick={toggleWatchlist}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full ${isWatchlist ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : 'bg-white/10 text-white'} px-4 py-3 rounded-lg font-semibold border flex items-center justify-center space-x-2`}
                      >
                        <Bookmark className={`w-5 h-5 ${isWatchlist ? 'fill-current' : ''}`} />
                        <span>{isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
                      </motion.button>
                    </>
                  )}
                </div>

                <div className="p-6 bg-white/10 rounded-xl">
                  <h3 className="mb-4 text-lg font-bold text-white">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="font-semibold text-white">{movie.rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Votes:</span>
                      <span className="font-semibold text-white">{movie.voteCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Runtime:</span>
                      <span className="font-semibold text-white">{movie.runtime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Release:</span>
                      <span className="font-semibold text-white">{movie.year}</span>
                    </div>
                    {movie.budget && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Budget:</span>
                        <span className="font-semibold text-white">
                          ${(movie.budget / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}
                    {movie.revenue && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue:</span>
                        <span className="font-semibold text-white">
                          ${(movie.revenue / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}
                    {movie.originalLanguage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Language:</span>
                        <span className="font-semibold text-white">
                          {movie.originalLanguage.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                  <div className="p-6 bg-white/10 rounded-xl">
                    <h3 className="mb-4 text-lg font-bold text-white">Production</h3>
                    <div className="space-y-4">
                      {movie.productionCompanies.slice(0, 3).map((company) => (
                        <div key={company.id} className="flex items-center space-x-3">
                          {company.logo && (
                            <img 
                              src={company.logo} 
                              alt={company.name} 
                              className="object-contain h-8"
                            />
                          )}
                          <span className="text-white">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchMovie;