import { 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit,
  startAfter} from 'firebase/firestore';
import { db } from '../firebase/config';

export const addToFavorites = async (userId, movie) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    
    const existingQuery = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('movieId', '==', movie.id)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error('Movie is already in favorites');
    }

    const favoriteData = {
      userId,
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
      description: movie.description,
      genre: movie.genre || [],
      addedAt: serverTimestamp()
    };

    const docRef = await addDoc(favoritesRef, favoriteData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, movieId) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('movieId', '==', movieId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Movie not found in favorites');
    }

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const isMovieInFavorites = async (userId, movieId) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('movieId', '==', movieId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const favorites = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return favorites.sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds);
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const subscribeToFavorites = (userId, callback) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const favorites = [];
      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      const sortedFavorites = favorites.sort((a, b) => 
        b.addedAt?.seconds - a.addedAt?.seconds
      );
      
      callback(sortedFavorites);
    });
  } catch (error) {
    console.error('Error subscribing to favorites:', error);
    return null;
  }
};

export const getFavoriteMovieIds = async (userId) => {
  try {
    const favorites = await getUserFavorites(userId);
    return new Set(favorites.map(fav => fav.movieId));
  } catch (error) {
    console.error('Error getting favorite movie IDs:', error);
    return new Set();
  }
};

export const addToFavoritesWithTags = async (userId, movie, tags = [], category = 'general') => {
  try {
    const favoritesRef = collection(db, 'favorites');
    
    const existingQuery = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('movieId', '==', movie.id)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error('Movie is already in favorites');
    }

    const favoriteData = {
      userId,
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
      description: movie.description,
      genre: movie.genre || [],
      tags: tags,
      category: category,
      userRating: null,
      watchedDate: null,
      notes: '',
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(favoritesRef, favoriteData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding to favorites with tags:', error);
    throw error;
  }
};

export const updateFavoriteMovie = async (userId, movieId, updateData) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('movieId', '==', movieId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Movie not found in favorites');
    }

    const docRef = querySnapshot.docs[0].ref;
    const updatePayload = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, updatePayload);
    return true;
  } catch (error) {
    console.error('Error updating favorite movie:', error);
    throw error;
  }
};

export const getFavoritesByGenre = async (userId, genre) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('genre', 'array-contains', genre)
    );
    
    const querySnapshot = await getDocs(q);
    const favorites = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return favorites.sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds);
  } catch (error) {
    console.error('Error getting favorites by genre:', error);
    throw error;
  }
};

export const getFavoritesByYearRange = async (userId, startYear, endYear) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('year', '>=', startYear),
      where('year', '<=', endYear)
    );
    
    const querySnapshot = await getDocs(q);
    const favorites = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return favorites.sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds);
  } catch (error) {
    console.error('Error getting favorites by year range:', error);
    throw error;
  }
};

export const getFavoritesByRating = async (userId, minRating, maxRating = 10) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', userId),
      where('rating', '>=', minRating),
      where('rating', '<=', maxRating)
    );
    
    const querySnapshot = await getDocs(q);
    const favorites = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return favorites.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Error getting favorites by rating:', error);
    throw error;
  }
};

export const getFavoritesPaginated = async (userId, pageSize = 10, lastDoc = null) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    let q = query(
      favoritesRef, 
      where('userId', '==', userId),
      orderBy('addedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        favoritesRef, 
        where('userId', '==', userId),
        orderBy('addedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const favorites = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      favorites,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting paginated favorites:', error);
    throw error;
  }
};

export const searchFavorites = async (userId, searchTerm) => {
  try {
    const favorites = await getUserFavorites(userId);
    
    if (!searchTerm || searchTerm.trim() === '') {
      return favorites;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return favorites.filter(movie => 
      movie.title?.toLowerCase().includes(searchTermLower) ||
      movie.description?.toLowerCase().includes(searchTermLower) ||
      movie.genre?.some(g => g.toLowerCase().includes(searchTermLower))
    );
  } catch (error) {
    console.error('Error searching favorites:', error);
    throw error;
  }
};

export const getFavoritesStats = async (userId) => {
  try {
    const favorites = await getUserFavorites(userId);
    
    const stats = {
      totalMovies: favorites.length,
      averageRating: 0,
      topGenres: {},
      moviesByYear: {},
      recentlyAdded: favorites.slice(0, 5)
    };

    if (favorites.length > 0) {
      const totalRating = favorites.reduce((sum, movie) => sum + (movie.rating || 0), 0);
      stats.averageRating = Number((totalRating / favorites.length).toFixed(1));

      favorites.forEach(movie => {
        if (movie.genre && Array.isArray(movie.genre)) {
          movie.genre.forEach(genre => {
            stats.topGenres[genre] = (stats.topGenres[genre] || 0) + 1;
          });
        }
      });

      favorites.forEach(movie => {
        if (movie.year) {
          stats.moviesByYear[movie.year] = (stats.moviesByYear[movie.year] || 0) + 1;
        }
      });
    }

    return stats;
  } catch (error) {
    console.error('Error getting favorites stats:', error);
    throw error;
  }
};

export const exportFavorites = async (userId) => {
  try {
    const favorites = await getUserFavorites(userId);
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      totalMovies: favorites.length,
      favorites: favorites.map(movie => ({
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        genre: movie.genre,
        description: movie.description,
        addedAt: movie.addedAt?.toDate?.()?.toISOString() || null
      }))
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting favorites:', error);
    throw error;
  }
};

export const getRandomFavorite = async (userId) => {
  try {
    const favorites = await getUserFavorites(userId);
    
    if (favorites.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * favorites.length);
    return favorites[randomIndex];
  } catch (error) {
    console.error('Error getting random favorite:', error);
    throw error;
  }
};

export const bulkAddToFavorites = async (userId, movies) => {
  try {
    const results = [];
    const errors = [];

    for (const movie of movies) {
      try {
        const docId = await addToFavorites(userId, movie);
        results.push({ movieId: movie.id, docId, success: true });
      } catch (error) {
        errors.push({ movieId: movie.id, error: error.message, success: false });
      }
    }

    return { results, errors };
  } catch (error) {
    console.error('Error bulk adding to favorites:', error);
    throw error;
  }
};

export const bulkRemoveFromFavorites = async (userId, movieIds) => {
  try {
    const results = [];
    const errors = [];

    for (const movieId of movieIds) {
      try {
        await removeFromFavorites(userId, movieId);
        results.push({ movieId, success: true });
      } catch (error) {
        errors.push({ movieId, error: error.message, success: false });
      }
    }

    return { results, errors };
  } catch (error) {
    console.error('Error bulk removing from favorites:', error);
    throw error;
  }
};