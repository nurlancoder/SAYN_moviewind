import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Film, 
  Star, 
  Calendar, 
  Trash2, 
  Loader, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Download,
  Share2,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const FavoritesPage = () => {
  const { currentUser } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('addedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterGenre, setFilterGenre] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState('');

  const handleRemoveFavorite = async (movieId) => {
    await removeFavorite(movieId);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredAndSortedFavorites = useMemo(() => {
    let filtered = favorites.filter(favorite => {
      const matchesSearch = favorite.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !filterGenre || favorite.genre?.includes(parseInt(filterGenre));
      const matchesYear = !selectedYear || favorite.year?.toString() === selectedYear;
      const matchesRating = !minRating || parseFloat(favorite.rating) >= parseFloat(minRating);
      
      return matchesSearch && matchesGenre && matchesYear && matchesRating;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'rating':
          aValue = parseFloat(a.rating) || 0;
          bValue = parseFloat(b.rating) || 0;
          break;
        case 'addedAt':
        default:
          aValue = a.addedAt?.seconds || 0;
          bValue = b.addedAt?.seconds || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [favorites, searchTerm, sortBy, sortOrder, filterGenre, selectedYear, minRating]);

  const uniqueGenres = useMemo(() => {
    const genres = new Set();
    favorites.forEach(fav => {
      if (fav.genre) {
        fav.genre.forEach(g => genres.add(g));
      }
    });
    return Array.from(genres);
  }, [favorites]);

  const uniqueYears = useMemo(() => {
    const years = new Set();
    favorites.forEach(fav => {
      if (fav.year) years.add(fav.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [favorites]);

  const stats = useMemo(() => {
    const totalRating = favorites.reduce((sum, fav) => sum + (parseFloat(fav.rating) || 0), 0);
    const avgRating = favorites.length > 0 ? (totalRating / favorites.length).toFixed(1) : 0;
    const highestRated = favorites.reduce((max, fav) => 
      (parseFloat(fav.rating) || 0) > (parseFloat(max.rating) || 0) ? fav : max, favorites[0]);
    const recentlyAdded = favorites.filter(fav => {
      if (!fav.addedAt) return false;
      const date = fav.addedAt.toDate ? fav.addedAt.toDate() : new Date(fav.addedAt.seconds * 1000);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    return {
      total: favorites.length,
      avgRating,
      totalRating: totalRating.toFixed(1),
      highestRated,
      recentlyAdded
    };
  }, [favorites]);

  const exportFavorites = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'my-favorite-movies.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const shareFavorites = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Favorite Movies',
          text: `Check out my ${favorites.length} favorite movies with an average rating of ${stats.avgRating}!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      const text = `Check out my ${favorites.length} favorite movies with an average rating of ${stats.avgRating}!\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24 bg-cinema-darker">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 text-cinema-blue animate-spin" />
          <p className="text-white">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-cinema-darker">
      <div className="px-6 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center mb-4 space-x-3">
            <Heart className="w-10 h-10 fill-current text-cinema-blue" />
            <h1 className="text-4xl font-bold text-white">My Favorites</h1>
          </div>
          <p className="text-lg text-gray-400">
            Hello {currentUser?.displayName || 'Movie Lover'}! Here are your favorite movies
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="p-4 text-center border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
            <Film className="w-8 h-8 mx-auto mb-2 text-cinema-blue" />
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Movies</div>
          </div>
          <div className="p-4 text-center border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
            <div className="text-sm text-gray-400">Average Rating</div>
          </div>
          <div className="p-4 text-center border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
            <Award className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">{stats.highestRated?.rating || 'N/A'}</div>
            <div className="text-sm text-gray-400">Highest Rated</div>
          </div>
          <div className="p-4 text-center border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{stats.recentlyAdded}</div>
            <div className="text-sm text-gray-400">Added This Week</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center flex-1 space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-cinema-accent/50 border-white/20 focus:outline-none focus:border-cinema-blue"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 space-x-2 transition-colors border rounded-lg bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30 hover:bg-cinema-blue/30"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center p-1 space-x-2 rounded-lg bg-cinema-accent/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cinema-blue text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-cinema-blue text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={exportFavorites}
                className="px-3 py-2 text-green-400 transition-colors border rounded-lg bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={shareFavorites}
                className="px-3 py-2 text-purple-400 transition-colors border rounded-lg bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-xl"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 text-white border rounded-lg bg-cinema-accent/50 border-white/20 focus:outline-none focus:border-cinema-blue"
                    >
                      <option value="addedAt">Date Added</option>
                      <option value="title">Title</option>
                      <option value="year">Year</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Order</label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center justify-center w-full px-3 py-2 space-x-2 text-white transition-colors border rounded-lg bg-cinema-accent/50 border-white/20 hover:bg-cinema-accent/70"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Genre</label>
                    <select
                      value={filterGenre}
                      onChange={(e) => setFilterGenre(e.target.value)}
                      className="w-full px-3 py-2 text-white border rounded-lg bg-cinema-accent/50 border-white/20 focus:outline-none focus:border-cinema-blue"
                    >
                      <option value="">All Genres</option>
                      {uniqueGenres.map(genre => (
                        <option key={genre} value={genre}>Genre {genre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 text-white border rounded-lg bg-cinema-accent/50 border-white/20 focus:outline-none focus:border-cinema-blue"
                    >
                      <option value="">All Years</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Min Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 text-white border rounded-lg bg-cinema-accent/50 border-white/20 focus:outline-none focus:border-cinema-blue"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {searchTerm || filterGenre || selectedYear || minRating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-400">
              Showing {filteredAndSortedFavorites.length} of {favorites.length} favorites
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </motion.div>
        ) : null}

        {filteredAndSortedFavorites.length === 0 ? (
          favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Heart className="w-24 h-24 mx-auto mb-6 text-gray-600" />
              <h3 className="mb-4 text-2xl font-bold text-white">No favorites yet</h3>
              <p className="mb-8 text-lg text-gray-400">
                Start exploring movies and add them to your favorites by clicking the heart icon
              </p>
              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
              >
                <Film className="w-5 h-5" />
                <span>Discover Movies</span>
              </motion.a>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Search className="w-24 h-24 mx-auto mb-6 text-gray-600" />
              <h3 className="mb-4 text-2xl font-bold text-white">No matches found</h3>
              <p className="mb-8 text-lg text-gray-400">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterGenre('');
                  setSelectedYear('');
                  setMinRating('');
                }}
                className="inline-flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
              >
                <span>Clear All Filters</span>
              </button>
            </motion.div>
          )
        ) : (
          <motion.div
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }
            layout
          >
            {filteredAndSortedFavorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={viewMode === 'grid' 
                  ? "bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-4 group hover:scale-105 transition-transform duration-300"
                  : "bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl p-4 group hover:shadow-lg transition-shadow duration-300 flex space-x-4"
                }
              >
                <div className={viewMode === 'grid' ? "relative overflow-hidden rounded-lg mb-4" : "relative overflow-hidden rounded-lg flex-shrink-0"}>
                  {favorite.poster ? (
                    <img 
                      src={favorite.poster} 
                      alt={favorite.title}
                      className={viewMode === 'grid' ? "w-full h-80 object-cover" : "w-24 h-36 object-cover"}
                      loading="lazy"
                    />
                  ) : (
                    <div className={viewMode === 'grid' ? "w-full h-80 bg-cinema-accent flex items-center justify-center" : "w-24 h-36 bg-cinema-accent flex items-center justify-center"}>
                      <Film className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveFavorite(favorite.movieId)}
                    className="absolute p-2 text-white transition-colors rounded-full top-2 right-2 bg-red-500/80 backdrop-blur-sm hover:bg-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className={viewMode === 'grid' ? "" : "flex-1"}>
                  <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cinema-blue">
                    {favorite.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-300">{favorite.year}</span>
                      {favorite.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-white">{favorite.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mb-3 space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      Added {formatDate(favorite.addedAt)}
                    </span>
                  </div>

                  <p className={`text-gray-400 text-sm ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                    {favorite.description}
                  </p>

                  {favorite.genre && favorite.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {favorite.genre.slice(0, 2).map((genreId, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 text-xs border rounded-full bg-cinema-blue/20 text-cinema-blue border-cinema-blue/30"
                        >
                          Genre {genreId}
                        </span>
                      ))}
                      {favorite.genre.length > 2 && (
                        <span className="px-2 py-1 text-xs text-gray-400 rounded-full bg-gray-600/20">
                          +{favorite.genre.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-block p-6 border bg-glass-gradient backdrop-blur-glass border-white/20 rounded-2xl">
              <h3 className="flex items-center justify-center mb-4 space-x-2 font-semibold text-white">
                <BarChart3 className="w-5 h-5" />
                <span>Your Collection Analytics</span>
              </h3>
              <div className="flex items-center space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total Movies</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">{stats.totalRating}</div>
                  <div className="text-sm text-gray-400">Total Rating Points</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">{stats.avgRating}</div>
                  <div className="text-sm text-gray-400">Average Rating</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-2xl font-bold text-cinema-blue">{stats.recentlyAdded}</div>
                  <div className="text-sm text-gray-400">Added This Week</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;