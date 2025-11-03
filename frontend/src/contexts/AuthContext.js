import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  unlink
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    language: 'en',
    theme: 'dark',
    notifications: true,
    autoplay: true
  });
  const [authHistory, setAuthHistory] = useState([]);

  const signup = async (email, password, displayName) => {
    try {
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      await sendEmailVerification(userCredential.user);
      setAuthSuccess('Account created successfully! Please check your email to verify your account.');
      
      addToAuthHistory('signup', email);
      
      return userCredential;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setAuthSuccess('Login successful!');
      
      addToAuthHistory('login', email);
      
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      setAuthSuccess('Google login successful!');
      
      addToAuthHistory('google_login', result.user.email);
      
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      setAuthError(null);
      await updateProfile(currentUser, profileData);
      setAuthSuccess('Profile updated successfully!');
      return true;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const updateUserEmail = async (newEmail, currentPassword) => {
    try {
      setAuthError(null);
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updateEmail(currentUser, newEmail);
      setAuthSuccess('Email updated successfully!');
      return true;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      setAuthError(null);
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setAuthSuccess('Password updated successfully!');
      return true;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      
      if (currentUser) {
        addToAuthHistory('logout', currentUser.email);
      }
      
      const result = await signOut(auth);
      setAuthSuccess('Logged out successfully!');
      
      setUserPreferences({
        language: 'en',
        theme: 'dark',
        notifications: true,
        autoplay: true
      });
      
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setAuthError(null);
  };
  
  const clearSuccess = () => {
    setAuthSuccess(null);
  };

  const clearAllMessages = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  const sendVerificationEmail = async () => {
    try {
      setAuthError(null);
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setAuthSuccess('Verification email sent! Please check your inbox.');
        return true;
      }
      throw new Error('No user logged in');
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const checkEmailVerification = async () => {
    try {
      if (currentUser) {
        await currentUser.reload();
        setIsEmailVerified(currentUser.emailVerified);
        return currentUser.emailVerified;
      }
      return false;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const resetPassword = async (email) => {
    try {
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
      setAuthSuccess('Password reset email sent! Please check your inbox.');
      return true;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const deleteAccount = async (password) => {
    try {
      setAuthError(null);
      if (currentUser) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        
        addToAuthHistory('account_deleted', currentUser.email);
        
        await deleteUser(currentUser);
        setAuthSuccess('Account deleted successfully!');
        return true;
      }
      throw new Error('No user logged in');
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const updateUserPreferences = (newPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }));
    
    localStorage.setItem('sayn_user_preferences', JSON.stringify({
      ...userPreferences,
      ...newPreferences
    }));
  };

  const resetUserPreferences = () => {
    const defaultPrefs = {
      language: 'en',
      theme: 'dark',
      notifications: true,
      autoplay: true
    };
    setUserPreferences(defaultPrefs);
    localStorage.removeItem('sayn_user_preferences');
  };

  const addToAuthHistory = (action, email) => {
    const historyItem = {
      id: Date.now(),
      action,
      email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    setAuthHistory(prev => [historyItem, ...prev.slice(0, 9)]); 
  };

  const clearAuthHistory = () => {
    setAuthHistory([]);
  };

  const getUserDisplayInfo = () => {
    if (!currentUser) return null;
    
    return {
      displayName: currentUser.displayName || 'Movie Lover',
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      emailVerified: currentUser.emailVerified,
      createdAt: currentUser.metadata.creationTime,
      lastSignIn: currentUser.metadata.lastSignInTime,
      uid: currentUser.uid
    };
  };

  const isSessionActive = () => {
    return currentUser !== null;
  };

  const getSessionDuration = () => {
    if (!currentUser || !currentUser.metadata.lastSignInTime) return 0;
    
    const lastSignIn = new Date(currentUser.metadata.lastSignInTime);
    const now = new Date();
    return Math.floor((now - lastSignIn) / (1000 * 60)); 
  };

  const reauthenticateUser = async (password) => {
    try {
      setAuthError(null);
      if (currentUser) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        setAuthSuccess('Re-authentication successful!');
        return true;
      }
      throw new Error('No user logged in');
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    const savedPreferences = localStorage.getItem('sayn_user_preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setUserPreferences(parsed);
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        setIsEmailVerified(user.emailVerified);
        if (!currentUser) {
          addToAuthHistory('session_start', user.email);
        }
      } else {
        setIsEmailVerified(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    authError,
    clearError,
    loading,
    
    authSuccess,
    clearSuccess,
    clearAllMessages,
    isEmailVerified,
    sendVerificationEmail,
    checkEmailVerification,
    resetPassword,
    deleteAccount,
    checkEmailExists,
    userPreferences,
    updateUserPreferences,
    resetUserPreferences,
    authHistory,
    clearAuthHistory,
    getUserDisplayInfo,
    isSessionActive,
    getSessionDuration,
    reauthenticateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};