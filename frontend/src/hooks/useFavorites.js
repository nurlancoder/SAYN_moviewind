import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addToFavorites, 
  removeFromFavorites, 
  subscribeToFavorites,
  getFavoriteMovieIds 
} from '../services/favoritesService';

export const useFavorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to real-time favorites updates
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToFavorites(currentUser.uid, (favs) => {
      setFavorites(favs);
      setFavoriteIds(new Set(favs.map(fav => fav.movieId)));
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Add movie to favorites
  const addFavorite = async (movie) => {
    if (!currentUser) {
      setError('You must be logged in to add favorites');
      return false;
    }

    try {
      setError(null);
      await addToFavorites(currentUser.uid, movie);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Remove movie from favorites
  const removeFavorite = async (movieId) => {
    if (!currentUser) {
      setError('You must be logged in to remove favorites');
      return false;
    }

    try {
      setError(null);
      await removeFromFavorites(currentUser.uid, movieId);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (movie) => {
    if (favoriteIds.has(movie.id)) {
      return await removeFavorite(movie.id);
    } else {
      return await addFavorite(movie);
    }
  };

  // Check if movie is favorite
  const isFavorite = (movieId) => {
    return favoriteIds.has(movieId);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearError
  };
};