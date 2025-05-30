import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const READ_ACCESS_TOKEN = process.env.REACT_APP_TMDB_READ_ACCESS_TOKEN;

// Create axios instance with default headers
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// Image size options
export const IMAGE_SIZES = {
  poster: {
    small: 'w342',
    medium: 'w500',
    large: 'w780',
    original: 'original'
  },
  backdrop: {
    small: 'w780',
    medium: 'w1280',
    large: 'original'
  },
  profile: {
    small: 'w185',
    medium: 'w500',
    large: 'original'
  }
};

// Get full image URL
export const getImageUrl = (path, size = 'medium', type = 'poster') => {
  if (!path) return null;
  const sizeStr = IMAGE_SIZES[type][size] || IMAGE_SIZES[type]['medium'];
  return `${TMDB_IMAGE_BASE_URL}/${sizeStr}${path}`;
};

// Transform movie data to our format
const transformMovie = (movie) => ({
  id: movie.id,
  title: movie.title || movie.name,
  genre: movie.genre_ids || [],
  year: movie.release_date ? new Date(movie.release_date).getFullYear() : 
         movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : 'N/A',
  rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
  poster: getImageUrl(movie.poster_path, 'medium', 'poster'),
  backdrop: getImageUrl(movie.backdrop_path, 'medium', 'backdrop'),
  description: movie.overview || 'No description available',
  popularity: movie.popularity,
  voteCount: movie.vote_count,
  adult: movie.adult,
  originalTitle: movie.original_title || movie.original_name,
  releaseDate: movie.release_date || movie.first_air_date
});

// Transform person data
const transformPerson = (person) => ({
  id: person.id,
  name: person.name,
  profilePicture: getImageUrl(person.profile_path, 'medium', 'profile'),
  character: person.character,
  job: person.job,
  department: person.known_for_department,
  popularity: person.popularity
});

// API Service Functions

// Get trending movies
export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data.results.map(transformMovie);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

// Search movies
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { 
        query,
        page,
        include_adult: false
      }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
      tmdbApi.get(`/movie/${movieId}`),
      tmdbApi.get(`/movie/${movieId}/credits`),
      tmdbApi.get(`/movie/${movieId}/videos`)
    ]);

    const movie = movieResponse.data;
    const credits = creditsResponse.data;
    const videos = videosResponse.data;

    return {
      ...transformMovie(movie),
      genres: movie.genres || [],
      runtime: movie.runtime,
      budget: movie.budget,
      revenue: movie.revenue,
      tagline: movie.tagline,
      status: movie.status,
      homepage: movie.homepage,
      cast: credits.cast ? credits.cast.slice(0, 10).map(transformPerson) : [],
      crew: credits.crew ? credits.crew.filter(person => 
        ['Director', 'Producer', 'Writer'].includes(person.job)
      ).map(transformPerson) : [],
      trailers: videos.results ? videos.results.filter(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) : []
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

// Get movie genres
export const getMovieGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    throw error;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: { 
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

// Get person details
export const getPersonDetails = async (personId) => {
  try {
    const [personResponse, creditsResponse] = await Promise.all([
      tmdbApi.get(`/person/${personId}`),
      tmdbApi.get(`/person/${personId}/movie_credits`)
    ]);

    const person = personResponse.data;
    const credits = creditsResponse.data;

    return {
      ...transformPerson(person),
      biography: person.biography,
      birthday: person.birthday,
      deathday: person.deathday,
      placeOfBirth: person.place_of_birth,
      alsoKnownAs: person.also_known_as,
      homepage: person.homepage,
      movies: credits.cast ? credits.cast.map(transformMovie) : []
    };
  } catch (error) {
    console.error('Error fetching person details:', error);
    throw error;
  }
};

// Get similar movies
export const getSimilarMovies = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return response.data.results.map(transformMovie);
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

// Get movie recommendations
export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`);
    return response.data.results.map(transformMovie);
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
};

export default {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  searchMovies,
  getMovieDetails,
  getMovieGenres,
  getMoviesByGenre,
  getPersonDetails,
  getSimilarMovies,
  getMovieRecommendations,
  getImageUrl
};