import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addToFavorites,
  removeFromFavorites,
  subscribeToFavorites,
} from '../services/favoritesService';

export const useFavorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(new Set()); 

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

  const addFavorite = useCallback(async (movie) => {
    if (!currentUser) {
      setError('You must be logged in to add favorites');
      return false;
    }

    try {
      setError(null);
      setActionLoading(prev => new Set(prev).add(movie.id));
      await addToFavorites(currentUser.uid, movie);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(movie.id);
        return newSet;
      });
    }
  }, [currentUser]);

  const removeFavorite = useCallback(async (movieId) => {
    if (!currentUser) {
      setError('You must be logged in to remove favorites');
      return false;
    }

    try {
      setError(null);
      setActionLoading(prev => new Set(prev).add(movieId));
      await removeFromFavorites(currentUser.uid, movieId);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }
  }, [currentUser]);

  const toggleFavorite = useCallback(async (movie) => {
    if (favoriteIds.has(movie.id)) {
      return await removeFavorite(movie.id);
    } else {
      return await addFavorite(movie);
    }
  }, [favoriteIds, addFavorite, removeFavorite]);

  const isFavorite = useCallback((movieId) => {
    return favoriteIds.has(movieId);
  }, [favoriteIds]);

  const isActionLoading = useCallback((movieId) => {
    return actionLoading.has(movieId);
  }, [actionLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getFavoritesByGenre = useCallback((genreId) => {
    return favorites.filter(movie => 
      movie.genre_ids && movie.genre_ids.includes(genreId)
    );
  }, [favorites]);

  const getFavoritesByYear = useCallback((year) => {
    return favorites.filter(movie => {
      const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
      return movieYear === year;
    });
  }, [favorites]);

  const getFavoritesByRating = useCallback((minRating, maxRating) => {
    return favorites.filter(movie => 
      movie.vote_average >= minRating && movie.vote_average <= maxRating
    );
  }, [favorites]);

  const searchFavorites = useCallback((query) => {
    if (!query) return favorites;
    
    const lowercaseQuery = query.toLowerCase();
    return favorites.filter(movie => 
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.overview.toLowerCase().includes(lowercaseQuery)
    );
  }, [favorites]);

  const getSortedFavorites = useCallback((sortBy = 'dateAdded', order = 'desc') => {
    const sorted = [...favorites].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'rating':
          aValue = a.vote_average;
          bValue = b.vote_average;
          break;
        case 'releaseDate':
          aValue = new Date(a.release_date);
          bValue = new Date(b.release_date);
          break;
        case 'dateAdded':
        default:
          aValue = a.addedAt ? new Date(a.addedAt) : new Date(0);
          bValue = b.addedAt ? new Date(b.addedAt) : new Date(0);
          break;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  }, [favorites]);

  const addMultipleFavorites = useCallback(async (movies) => {
    if (!currentUser) {
      setError('You must be logged in to add favorites');
      return false;
    }

    try {
      setError(null);
      setLoading(true);
      
      const promises = movies.map(movie => addToFavorites(currentUser.uid, movie));
      await Promise.all(promises);
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const removeMultipleFavorites = useCallback(async (movieIds) => {
    if (!currentUser) {
      setError('You must be logged in to remove favorites');
      return false;
    }

    try {
      setError(null);
      setLoading(true);
      
      const promises = movieIds.map(movieId => removeFromFavorites(currentUser.uid, movieId));
      await Promise.all(promises);
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const clearAllFavorites = useCallback(async () => {
    if (!currentUser) {
      setError('You must be logged in to clear favorites');
      return false;
    }

    try {
      setError(null);
      setLoading(true);
      
      const movieIds = favorites.map(movie => movie.id);
      await removeMultipleFavorites(movieIds);
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, favorites, removeMultipleFavorites]);

  const favoriteStats = useMemo(() => {
    const totalFavorites = favorites.length;
    const averageRating = favorites.length > 0 
      ? favorites.reduce((sum, movie) => sum + movie.vote_average, 0) / favorites.length
      : 0;
    
    const genreCount = favorites.reduce((acc, movie) => {
      if (movie.genre_ids) {
        movie.genre_ids.forEach(genreId => {
          acc[genreId] = (acc[genreId] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    const yearCount = favorites.reduce((acc, movie) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalFavorites,
      averageRating: Math.round(averageRating * 10) / 10,
      genreCount,
      yearCount,
      mostFavoriteGenre: Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b, null),
      mostFavoriteYear: Object.keys(yearCount).reduce((a, b) => yearCount[a] > yearCount[b] ? a : b, null)
    };
  }, [favorites]);

  const exportFavorites = useCallback(() => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `favorites_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [favorites]);

  const importFavorites = useCallback(async (file) => {
    if (!currentUser) {
      setError('You must be logged in to import favorites');
      return false;
    }

    try {
      setError(null);
      const text = await file.text();
      const importedFavorites = JSON.parse(text);
      
      if (!Array.isArray(importedFavorites)) {
        throw new Error('Invalid file format');
      }
      
      await addMultipleFavorites(importedFavorites);
      return true;
    } catch (error) {
      setError(`Import failed: ${error.message}`);
      return false;
    }
  }, [currentUser, addMultipleFavorites]);

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearError,
    
    isActionLoading,
    getFavoritesByGenre,
    getFavoritesByYear,
    getFavoritesByRating,
    searchFavorites,
    getSortedFavorites,
    addMultipleFavorites,
    removeMultipleFavorites,
    clearAllFavorites,
    favoriteStats,
    exportFavorites,
    importFavorites
  };
};