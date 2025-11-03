# SAYN Movie App - Movie Discovery Platform

A modern movie discovery application built with React and Firebase, featuring movie recommendations, favorites, and user profiles.

## 🚀 Features

- **Movie Discovery**: Browse trending, popular, top-rated, and upcoming movies via TMDB API
- **Favorites**: Save your favorite movies to Firebase Firestore
- **User Authentication**: Google OAuth authentication with Firebase
- **Multi-language Support**: English, Azerbaijani, and Turkish
- **Advanced Search**: Search and filter movies by genre, year, rating
- **Real-time Data**: Firebase Firestore for real-time favorites sync

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore enabled
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd divorer-app
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here
```

**Note**: Firebase configuration is already set in `frontend/src/firebase/config.js`. If you need to use your own Firebase project, update the config file.

## 🏃 Running Locally

### Start Frontend

```bash
cd frontend
npm start
# or
yarn start
```

The app will be available at http://localhost:3000

## 📦 Deployment on Vercel

### 1. Prepare for Deployment

- Ensure all environment variables are set
- Verify `vercel.json` is configured correctly

### 2. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### 3. Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

- `REACT_APP_TMDB_API_KEY`: Your TMDB API key
- `REACT_APP_TMDB_READ_ACCESS_TOKEN`: Your TMDB read access token

### 4. Deploy via GitHub

- Push your code to GitHub
- Import the repository in Vercel
- Vercel will automatically detect the configuration and deploy

## 🌐 API Services

### TMDB API

The app uses TMDB API for movie data:
- Movie listings (popular, trending, top-rated)
- Movie details and search
- Movie recommendations
- Genres and filters

### Firebase Services

- **Authentication**: Google OAuth
- **Firestore**: User favorites, profiles, watch history
- **Storage**: User avatars (if implemented)

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google provider)
3. Enable Firestore Database
4. Update `frontend/src/firebase/config.js` with your Firebase config

### TMDB API Setup

1. Get API key from [TMDB Settings](https://www.themoviedb.org/settings/api)
2. Add to environment variables

## 🐛 Troubleshooting

### Frontend Issues

- **Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- **Firebase Errors**: Check Firebase configuration and ensure Firestore is enabled
- **TMDB API Errors**: Verify API keys are correct and set in environment variables

### Vercel Deployment Issues

- **Build Fails**: Check that `vercel.json` is correctly configured
- **Environment Variables**: Make sure all required variables are set in Vercel project settings
- **Firebase Config**: Ensure Firebase configuration is correct for production

## 📝 Project Structure

```
divorer-app/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/  # Auth context
│   │   ├── firebase/  # Firebase config
│   │   ├── hooks/     # Custom hooks (useFavorites)
│   │   ├── pages/     # Page components
│   │   └── services/  # API services (TMDB, Favorites)
│   ├── public/
│   └── package.json
├── vercel.json        # Vercel deployment configuration
└── README.md
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository.
