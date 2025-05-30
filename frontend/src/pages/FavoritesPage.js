import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Film, Star, Calendar, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const FavoritesPage = () => {
  const { currentUser } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();

  const handleRemoveFavorite = async (movieId) => {
    await removeFavorite(movieId);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-darker pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-cinema-blue animate-spin mx-auto mb-4" />
          <p className="text-white">Loading your favorites...</p>
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
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="text-cinema-blue w-10 h-10 fill-current" />
            <h1 className="text-4xl font-bold text-white">My Favorites</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Hello {currentUser?.displayName || 'Movie Lover'}! Here are your favorite movies
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>{favorites.length} movies</span>
            <span>•</span>
            <span>Updated in real-time</span>
          </div>
        </motion.div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No favorites yet</h3>
            <p className="text-gray-400 text-lg mb-8">
              Start exploring movies and add them to your favorites by clicking the heart icon
            </p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 bg-cinema-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors"
            >
              <Film className="w-5 h-5" />
              <span>Discover Movies</span>
            </motion.a>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-4 group hover:scale-105 transition-transform duration-300"
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  {favorite.poster ? (
                    <img 
                      src={favorite.poster} 
                      alt={favorite.title}
                      className="w-full h-80 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-80 bg-cinema-accent flex items-center justify-center">
                      <Film className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveFavorite(favorite.movieId)}
                    className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Movie Info */}
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cinema-blue transition-colors">
                  {favorite.title}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300 text-sm">{favorite.year}</span>
                    {favorite.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 w-4 h-4 fill-current" />
                        <span className="text-white text-sm font-semibold">{favorite.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Added Date */}
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="text-gray-400 w-4 h-4" />
                  <span className="text-gray-400 text-xs">
                    Added {formatDate(favorite.addedAt)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-3">
                  {favorite.description}
                </p>

                {/* Genres */}
                {favorite.genre && favorite.genre.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {favorite.genre.slice(0, 2).map((genreId, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-cinema-blue/20 text-cinema-blue text-xs rounded-full border border-cinema-blue/30"
                      >
                        Genre {genreId}
                      </span>
                    ))}
                    {favorite.genre.length > 2 && (
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                        +{favorite.genre.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats Footer */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-2xl p-6 inline-block">
              <h3 className="text-white font-semibold mb-4">Your Collection Stats</h3>
              <div className="flex items-center space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">{favorites.length}</div>
                  <div className="text-gray-400 text-sm">Favorite Movies</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">
                    {favorites.reduce((sum, fav) => sum + (parseFloat(fav.rating) || 0), 0).toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Rating Points</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">
                    {Math.round(favorites.reduce((sum, fav) => sum + (parseFloat(fav.rating) || 0), 0) / favorites.length * 10) / 10 || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Avg Rating</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;