import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, RotateCcw, Download, Share2,
  ArrowLeft, Heart, Star, Clock, Users, Subtitles,
  Loader, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import tmdbService from '../services/tmdbService';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Video Player Component
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
  setIsFullscreen
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
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

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onTimeUpdate, onDurationChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume / 100;
    }
  }, [volume]);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
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

  return (
    <div 
      ref={playerRef}
      className={`relative w-full bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onClick={() => setIsPlaying(!isPlaying)}
        onDoubleClick={toggleFullscreen}
      >
        {src && <source src={src} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {/* Buffering Indicator */}
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

      {/* Play/Pause Overlay */}
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
              className="bg-black/50 backdrop-blur-sm text-white p-6 rounded-full hover:bg-black/70 transition-colors"
            >
              <Play className="w-12 h-12 fill-current" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="w-full h-2 bg-white/30 rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-cinema-blue rounded-full relative group-hover:h-3 transition-all"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-cinema-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between text-white text-sm mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-cinema-blue transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>

                {/* Skip Buttons */}
                <motion.button
                  onClick={() => {
                    const video = videoRef.current;
                    video.currentTime = Math.max(0, video.currentTime - 10);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-cinema-blue transition-colors"
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
                  className="text-white hover:text-cinema-blue transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setVolume(volume > 0 ? 0 : 50)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white hover:text-cinema-blue transition-colors"
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

                {/* Time Display */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Subtitles */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-cinema-blue transition-colors"
                >
                  <Subtitles className="w-5 h-5" />
                </motion.button>

                {/* Settings */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-cinema-blue transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>

                {/* Fullscreen */}
                <motion.button
                  onClick={toggleFullscreen}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-cinema-blue transition-colors"
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

// Watch Movie Page
const WatchMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Watch session
  const [watchSession, setWatchSession] = useState(null);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    loadMovieDetails();
  }, [id]);

  useEffect(() => {
    // Update watch progress periodically
    const interval = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        updateWatchProgress();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, movie]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const movieData = await tmdbService.getMovieDetails(id);
      setMovie(movieData);
      
      // Check if user has already rated this movie
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

  const updateWatchProgress = async () => {
    if (!currentUser || !movie || !duration) return;

    const progressPercentage = (currentTime / duration) * 100;
    const watchData = {
      user_id: currentUser.uid,
      movie_id: movie.id,
      movie_title: movie.title,
      watch_duration: Math.floor(currentTime / 60), // Convert to minutes
      total_duration: Math.floor(duration / 60),
      progress_percentage: progressPercentage,
      completed: progressPercentage >= 90 // Consider completed if watched 90%
    };

    try {
      await axios.post(`${BACKEND_URL}/api/watch-history`, watchData);
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  const handleDownload = async () => {
    // Simulate download functionality
    console.log('Downloading movie:', movie.title);
    // In a real app, this would trigger an actual download
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: movie.title,
        text: `Watch ${movie.title} on SAYN!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleRateMovie = () => {
    navigate(`/movie/${id}#reviews`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-darker flex items-center justify-center">
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
      <div className="min-h-screen bg-cinema-darker flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Movie</h2>
          <p className="text-gray-400 mb-6">{error || 'Movie not found'}</p>
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cinema-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // Mock video URL - in a real app, this would come from your video service
  const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;

  return (
    <div className="min-h-screen bg-cinema-darker">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Video Player */}
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
      />

      {/* Movie Info (shown when not fullscreen) */}
      {!isFullscreen && (
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
                  {movie.tagline && (
                    <p className="text-cinema-blue text-lg italic mb-4">"{movie.tagline}"</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 w-5 h-5 fill-current" />
                      <span className="text-white font-semibold">{movie.rating}</span>
                      <span className="text-gray-400">({movie.voteCount} votes)</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime} min</span>
                    </div>
                    
                    <span className="text-gray-400">{movie.year}</span>
                    
                    {movie.certification && (
                      <span className="bg-white/20 text-white px-2 py-1 rounded text-sm">
                        {movie.certification}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres && movie.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-cinema-blue/20 text-cinema-blue rounded-full border border-cinema-blue/30">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-300 leading-relaxed text-lg">
                    {movie.description}
                  </p>
                </div>

                {/* Cast & Crew */}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-4">Cast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {movie.cast.slice(0, 6).map((actor) => (
                        <div key={actor.id} className="bg-white/10 rounded-lg p-3">
                          <p className="text-white font-semibold">{actor.name}</p>
                          {actor.character && (
                            <p className="text-gray-400 text-sm">{actor.character}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Sidebar */}
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="bg-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Actions</h3>
                  
                  <motion.button
                    onClick={handleDownload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </motion.button>

                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </motion.button>

                  {!hasRated && currentUser && (
                    <motion.button
                      onClick={handleRateMovie}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Star className="w-5 h-5" />
                      <span>Rate Movie</span>
                    </motion.button>
                  )}

                  {hasRated && (
                    <div className="w-full bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Already Rated</span>
                    </div>
                  )}
                </div>

                {/* Movie Stats */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="text-white font-semibold">{movie.rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Votes:</span>
                      <span className="text-white font-semibold">{movie.voteCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Runtime:</span>
                      <span className="text-white font-semibold">{movie.runtime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Release:</span>
                      <span className="text-white font-semibold">{movie.year}</span>
                    </div>
                    {movie.budget && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Budget:</span>
                        <span className="text-white font-semibold">
                          ${(movie.budget / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchMovie;