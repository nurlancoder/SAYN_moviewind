import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const READ_ACCESS_TOKEN = process.env.REACT_APP_TMDB_READ_ACCESS_TOKEN;

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8'
  }
});

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

export const getImageUrl = (path, size = 'medium', type = 'poster') => {
  if (!path) return null;
  const sizeStr = IMAGE_SIZES[type][size] || IMAGE_SIZES[type]['medium'];
  return `${TMDB_IMAGE_BASE_URL}/${sizeStr}${path}`;
};

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

const transformPerson = (person) => ({
  id: person.id,
  name: person.name,
  profilePicture: getImageUrl(person.profile_path, 'medium', 'profile'),
  character: person.character,
  job: person.job,
  department: person.known_for_department,
  popularity: person.popularity
});

const transformTVShow = (show) => ({
  id: show.id,
  title: show.name || show.title,
  genre: show.genre_ids || [],
  year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A',
  rating: show.vote_average ? show.vote_average.toFixed(1) : 'N/A',
  poster: getImageUrl(show.poster_path, 'medium', 'poster'),
  backdrop: getImageUrl(show.backdrop_path, 'medium', 'backdrop'),
  description: show.overview || 'No description available',
  popularity: show.popularity,
  voteCount: show.vote_count,
  adult: show.adult,
  originalTitle: show.original_name || show.original_title,
  releaseDate: show.first_air_date,
  lastAirDate: show.last_air_date,
  numberOfSeasons: show.number_of_seasons,
  numberOfEpisodes: show.number_of_episodes,
  status: show.status,
  type: 'tv'
});

const transformReview = (review) => ({
  id: review.id,
  author: review.author,
  authorDetails: {
    name: review.author_details.name,
    username: review.author_details.username,
    avatarPath: review.author_details.avatar_path,
    rating: review.author_details.rating
  },
  content: review.content,
  createdAt: review.created_at,
  updatedAt: review.updated_at,
  url: review.url
});

export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data.results.map(transformMovie);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

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

export const getMovieGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    throw error;
  }
};

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

export const getSimilarMovies = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return response.data.results.map(transformMovie);
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`);
    return response.data.results.map(transformMovie);
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
};


export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/now_playing', {
      params: { page }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export const getUpcomingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: { page }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const getTrendingTVShows = async (timeWindow = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/tv/${timeWindow}`);
    return response.data.results.map(transformTVShow);
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw error;
  }
};

export const getPopularTVShows = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/tv/popular', {
      params: { page }
    });
    return {
      tvShows: response.data.results.map(transformTVShow),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
};

export const getTopRatedTVShows = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/tv/top_rated', {
      params: { page }
    });
    return {
      tvShows: response.data.results.map(transformTVShow),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    throw error;
  }
};

export const searchTVShows = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/tv', {
      params: { 
        query,
        page,
        include_adult: false
      }
    });
    return {
      tvShows: response.data.results.map(transformTVShow),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error searching TV shows:', error);
    throw error;
  }
};

export const searchAll = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/multi', {
      params: { 
        query,
        page,
        include_adult: false
      }
    });
    
    const results = response.data.results.map(item => {
      if (item.media_type === 'movie') {
        return { ...transformMovie(item), media_type: 'movie' };
      } else if (item.media_type === 'tv') {
        return { ...transformTVShow(item), media_type: 'tv' };
      } else if (item.media_type === 'person') {
        return { ...transformPerson(item), media_type: 'person' };
      }
      return item;
    });

    return {
      results,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error searching all:', error);
    throw error;
  }
};

export const getMovieReviews = async (movieId, page = 1) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/reviews`, {
      params: { page }
    });
    return {
      reviews: response.data.results.map(transformReview),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};

export const getMovieKeywords = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/keywords`);
    return response.data.keywords;
  } catch (error) {
    console.error('Error fetching movie keywords:', error);
    throw error;
  }
};

export const getMovieImages = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/images`);
    return {
      backdrops: response.data.backdrops.map(img => ({
        ...img,
        url: getImageUrl(img.file_path, 'large', 'backdrop')
      })),
      posters: response.data.posters.map(img => ({
        ...img,
        url: getImageUrl(img.file_path, 'large', 'poster')
      })),
      logos: response.data.logos.map(img => ({
        ...img,
        url: getImageUrl(img.file_path, 'large', 'poster')
      }))
    };
  } catch (error) {
    console.error('Error fetching movie images:', error);
    throw error;
  }
};

export const discoverMovies = async (filters = {}, page = 1) => {
  try {
    const params = {
      page,
      sort_by: filters.sortBy || 'popularity.desc',
      include_adult: filters.includeAdult || false,
      include_video: filters.includeVideo || false,
      ...filters
    };

    const response = await tmdbApi.get('/discover/movie', { params });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw error;
  }
};

export const getTVGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/tv/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    throw error;
  }
};

export const getMoviesByYear = async (year, page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: { 
        year,
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
    console.error('Error fetching movies by year:', error);
    throw error;
  }
};

export const getMoviesByRating = async (minRating, maxRating, page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: { 
        'vote_average.gte': minRating,
        'vote_average.lte': maxRating,
        page,
        sort_by: 'vote_average.desc'
      }
    });
    return {
      movies: response.data.results.map(transformMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    };
  } catch (error) {
    console.error('Error fetching movies by rating:', error);
    throw error;
  }
};

export const getPersonCombinedCredits = async (personId) => {
  try {
    const response = await tmdbApi.get(`/person/${personId}/combined_credits`);
    return {
      cast: response.data.cast.map(item => {
        if (item.media_type === 'movie') {
          return { ...transformMovie(item), media_type: 'movie' };
        } else {
          return { ...transformTVShow(item), media_type: 'tv' };
        }
      }),
      crew: response.data.crew.map(item => {
        if (item.media_type === 'movie') {
          return { ...transformMovie(item), media_type: 'movie', job: item.job };
        } else {
          return { ...transformTVShow(item), media_type: 'tv', job: item.job };
        }
      })
    };
  } catch (error) {
    console.error('Error fetching person combined credits:', error);
    throw error;
  }
};

export const getMovieWatchProviders = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movie watch providers:', error);
    throw error;
  }
};

export const getMovieCollection = async (collectionId) => {
  try {
    const response = await tmdbApi.get(`/collection/${collectionId}`);
    return {
      ...response.data,
      poster: getImageUrl(response.data.poster_path, 'large', 'poster'),
      backdrop: getImageUrl(response.data.backdrop_path, 'large', 'backdrop'),
      parts: response.data.parts.map(transformMovie)
    };
  } catch (error) {
    console.error('Error fetching movie collection:', error);
    throw error;
  }
};

export const getConfiguration = async () => {
  try {
    const response = await tmdbApi.get('/configuration');
    return response.data;
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await tmdbApi.get('/configuration/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const getLanguages = async () => {
  try {
    const response = await tmdbApi.get('/configuration/languages');
    return response.data;
  } catch (error) {
    console.error('Error fetching languages:', error);
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
  getImageUrl,
  
  getNowPlayingMovies,
  getUpcomingMovies,
  getTrendingTVShows,
  getPopularTVShows,
  getTopRatedTVShows,
  searchTVShows,
  searchAll,
  getMovieReviews,
  getMovieKeywords,
  getMovieImages,
  discoverMovies,
  getTVGenres,
  getMoviesByYear,
  getMoviesByRating,
  getPersonCombinedCredits,
  getMovieWatchProviders,
  getMovieCollection,
  getConfiguration,
  getCountries,
  getLanguages
};