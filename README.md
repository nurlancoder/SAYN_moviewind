# SAYN Movie App - Advanced Movie Discovery Platform

A full-stack movie discovery application built with React and FastAPI, featuring AI-powered recommendations, user profiles, and real-time comments.

## 🚀 Features

- **Movie Discovery**: Browse trending, popular, top-rated, and upcoming movies
- **AI Recommendations**: Personalized movie recommendations based on user behavior
- **User Profiles**: Create and manage user profiles with watch history and favorites
- **Reviews & Ratings**: Rate and review movies with social features
- **Multi-language Support**: English, Azerbaijani, and Turkish
- **Advanced Search**: Filter movies by genre, year, rating, and more
- **Real-time Comments**: Interactive comment system with likes and replies

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB database (local or MongoDB Atlas)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd divorer-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example backend/.env

# Edit backend/.env with your configuration:
# - MONGO_URL: Your MongoDB connection string
# - DB_NAME: Database name (default: sayn_movies)
# - TMDB_API_KEY: Your TMDB API key
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file (optional, uses defaults if not set)
# REACT_APP_BACKEND_URL=http://localhost:8001
# REACT_APP_TMDB_API_KEY=your_key_here
# REACT_APP_TMDB_READ_ACCESS_TOKEN=your_token_here
```

## 🏃 Running Locally

### Start Backend

```bash
cd backend
uvicorn server:app --reload --port 8001
```

### Start Frontend

```bash
cd frontend
npm start
# or
yarn start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

## 📦 Deployment

### Deploy to Vercel

1. **Prepare for Deployment**

   - Make sure all environment variables are set in your `.env` files
   - Ensure `vercel.json` is configured correctly

2. **Deploy via Vercel CLI**

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

3. **Set Environment Variables in Vercel**

   Go to your Vercel project settings and add these environment variables:

   **Backend Variables:**
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: Database name
   - `TMDB_API_KEY`: Your TMDB API key
   - `IMDB_API_KEY`: (Optional) IMDb API key
   - `IMDB_HOST`: (Optional) IMDb host

   **Frontend Variables:**
   - `REACT_APP_BACKEND_URL`: Your deployed backend URL (will be auto-set by Vercel)
   - `REACT_APP_TMDB_API_KEY`: Your TMDB API key
   - `REACT_APP_TMDB_READ_ACCESS_TOKEN`: Your TMDB read access token

4. **Deploy via GitHub**

   - Push your code to GitHub
   - Import the repository in Vercel
   - Vercel will automatically detect the configuration and deploy

### Project Structure

```
divorer-app/
├── api/              # Vercel serverless functions
│   ├── index.py      # API entry point for Vercel
│   └── requirements.txt
├── backend/          # FastAPI backend
│   ├── server.py     # Main API server
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json       # Vercel deployment configuration
└── README.md
```

## 🌐 API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /api/` - API status
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/{movie_id}` - Get movie details
- `GET /api/movies/search` - Search movies
- `GET /api/recommendations/{user_id}` - Get user recommendations
- `POST /api/profile` - Create user profile
- `GET /api/profile/{user_id}` - Get user profile
- And more...

See `/docs` endpoint for full API documentation when running locally.

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables.

### MongoDB Setup

1. **Local MongoDB:**
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=sayn_movies
   ```

2. **MongoDB Atlas (Recommended for Production):**
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=sayn_movies
   ```

## 🐛 Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Check your `MONGO_URL` and ensure MongoDB is running
- **API Key Errors**: Verify your TMDB API key is correct and active
- **Import Errors**: Make sure all dependencies are installed: `pip install -r requirements.txt`

### Frontend Issues

- **Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- **API Connection Errors**: Check `REACT_APP_BACKEND_URL` environment variable
- **CORS Errors**: Backend CORS is configured to allow all origins in development

### Vercel Deployment Issues

- **Build Fails**: Check that `vercel.json` is correctly configured
- **API Routes Not Working**: Verify `api/index.py` exists and imports are correct
- **Environment Variables**: Make sure all required variables are set in Vercel project settings

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository.
