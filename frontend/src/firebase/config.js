import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore} from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getPerformance } from "firebase/performance";

// Validate that all required Firebase environment variables are set
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingVars);
  console.error('Please create a .env file in the frontend directory. See env.example for reference.');
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export const messaging = getMessaging(app);

export const performance = getPerformance(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

export const trackMovieView = (movieId, movieTitle) => {
  logEvent(analytics, 'movie_view', {
    movie_id: movieId,
    movie_title: movieTitle,
    timestamp: new Date().toISOString()
  });
};

export const trackMovieSearch = (searchQuery) => {
  logEvent(analytics, 'movie_search', {
    search_term: searchQuery,
    timestamp: new Date().toISOString()
  });
};

export const trackUserEngagement = (action, content) => {
  logEvent(analytics, 'user_engagement', {
    action_type: action,
    content_type: content,
    timestamp: new Date().toISOString()
  });
};

export const trackMovieRating = (movieId, rating) => {
  logEvent(analytics, 'movie_rating', {
    movie_id: movieId,
    rating: rating,
    timestamp: new Date().toISOString()
  });
};

export const trackWatchlistAction = (movieId, action) => {
  logEvent(analytics, 'watchlist_action', {
    movie_id: movieId,
    action: action, 
    timestamp: new Date().toISOString()
  });
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY || 'BGk7qUekIh9xqlf-L9J38iuUufyndynO9FA8D3mqiU_Tw-l-4GpU9obBqBgfcSpUFdt4C4u2ism9Ol1VzjzyVtE'
      });
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const setupMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    callback(payload);
  });
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

if (
  isDevelopment &&
  !(db._delegate?._databaseId?.projectId || '').includes('localhost')
) {

}


export const collections = {
  users: 'users',
  movies: 'movies',
  reviews: 'reviews',
  watchlists: 'watchlists',
  favorites: 'favorites',
  ratings: 'ratings',
  comments: 'comments'
};

export const movieConstants = {
  GENRES: [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'TV Movie', 'Thriller', 'War', 'Western'
  ],
  RATING_SCALE: {
    MIN: 1,
    MAX: 10
  },
  IMAGE_SIZES: {
    POSTER: {
      SMALL: 'w200',
      MEDIUM: 'w500',
      LARGE: 'w780'
    },
    BACKDROP: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280'
    }
  }
};

export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  const errorMessages = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/network-request-failed': 'Network error',
    'permission-denied': 'Permission denied',
    'not-found': 'Document not found'
  };
  
  return errorMessages[error.code] || 'An unexpected error occurred';
};

export default app;