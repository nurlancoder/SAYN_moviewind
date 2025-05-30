import { 
  doc, 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Add movie to favorites
export const addToFavorites = async (userId, movie) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    
    // Check if movie is already in favorites
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

// Remove movie from favorites
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

    // Delete all matching documents (there should be only one)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Check if movie is in favorites
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

// Get user's favorite movies
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

// Subscribe to real-time favorites updates
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

// Get favorite movie IDs for quick lookup
export const getFavoriteMovieIds = async (userId) => {
  try {
    const favorites = await getUserFavorites(userId);
    return new Set(favorites.map(fav => fav.movieId));
  } catch (error) {
    console.error('Error getting favorite movie IDs:', error);
    return new Set();
  }
};