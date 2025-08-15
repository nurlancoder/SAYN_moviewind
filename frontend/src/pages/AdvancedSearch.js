import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Calendar, Star, Globe, Clock, TrendingUp,
  SlidersHorizontal, X, RotateCcw, Download, Save, ChevronDown, ChevronUp
} from 'lucide-react';
import tmdbService from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl shadow-lg shadow-black/30 ${className}`}
    whileHover={{ scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    {...props}
  >
    {children}
  </motion.div>
);

const MovieCardSkeleton = () => (
  <div className="h-full overflow-hidden bg-white/10 rounded-xl">
    <div className="relative pt-[150%] bg-white/5 animate-pulse" />
    <div className="p-4">
      <div className="w-3/4 h-6 mb-2 rounded bg-white/5 animate-pulse" />
      <div className="w-1/2 h-4 rounded bg-white/5 animate-pulse" />
    </div>
  </div>
);

const RangeSlider = ({ min, max, value, onChange, label, step = 1 }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-medium text-white">{label}</label>
        <span className="font-semibold text-cinema-blue">{value[0]} - {value[1]}</span>
      </div>
      <div className="relative h-4">
        <div className="absolute w-full h-1 transform -translate-y-1/2 bg-gray-700 rounded-full top-1/2" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([parseFloat(e.target.value), value[1]])}
          className="absolute z-20 w-full h-1 bg-transparent appearance-none pointer-events-none"
          style={{
            WebkitAppearance: 'none',
            pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], parseFloat(e.target.value)])}
          className="absolute z-20 w-full h-1 bg-transparent appearance-none pointer-events-none"
          style={{
            WebkitAppearance: 'none',
            pointerEvents: 'none',
          }}
        />
        <div 
          className="absolute h-1 transform -translate-y-1/2 rounded-full bg-cinema-blue top-1/2"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((value[1] - min) / (max - min)) * 100}%`
          }}
        />
        <div 
          className="absolute z-10 w-4 h-4 transform -translate-y-1/2 rounded-full cursor-pointer bg-cinema-blue top-1/2"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute z-10 w-4 h-4 transform -translate-y-1/2 rounded-full cursor-pointer bg-cinema-blue top-1/2"
          style={{
            left: `${((value[1] - min) / (max - min)) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  );
};

const MultiSelect = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleOption = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected.length === 0 ? 'text-gray-400' : 'text-white'}>
          {selected.length === 0 
            ? placeholder 
            : selected.length === 1
              ? selected[0].name
              : `${selected.length} selected`
          }
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 z-50 flex flex-col mt-2 overflow-hidden border rounded-lg shadow-xl top-full bg-cinema-dark border-white/20 max-h-60"
          >
            <div className="p-2 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search genres..."
                  className="w-full px-3 py-2 text-sm text-white placeholder-gray-400 border rounded bg-white/5 border-white/10 focus:outline-none focus:border-cinema-blue"
                />
                <Search className="absolute w-3 h-3 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center ${
                      selected.includes(option) ? 'bg-cinema-blue/20 text-cinema-blue' : 'text-white'
                    }`}
                    role="option"
                    aria-selected={selected.includes(option)}
                  >
                    <span className="flex-1">{option.name}</span>
                    {selected.includes(option) && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400">No genres found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SavedSearches = ({ searches, onLoad, onDelete, onSave, currentFilters }) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const handleSave = () => {
    if (!searchName.trim()) return;
    
    const newSearch = {
      id: Date.now(),
      name: searchName,
      filters: currentFilters,
      tags: searchTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      created_at: new Date().toISOString()
    };
    
    onSave(newSearch);
    setSearchName('');
    setSearchTags('');
    setShowSaveForm(false);
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Saved Searches</h3>
        <motion.button
          onClick={() => setShowSaveForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="transition-colors text-cinema-blue hover:text-cinema-blue/80"
          aria-label="Save current search"
        >
          <Save className="w-5 h-5" />
        </motion.button>
      </div>

      {showSaveForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 space-y-3 overflow-hidden"
        >
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search name..."
            className="w-full px-3 py-2 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
            aria-label="Search name"
          />
          <input
            type="text"
            value={searchTags}
            onChange={(e) => setSearchTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full px-3 py-2 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
            aria-label="Search tags"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-3 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {searches.length > 0 ? (
          searches.map(search => (
            <motion.div 
              key={search.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
            >
              <div className="flex-1">
                <h4 className="font-medium text-white">{search.name}</h4>
                <div className="flex flex-wrap gap-1 mt-1 mb-1">
                  {search.tags?.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded bg-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">{new Date(search.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onLoad(search.filters)}
                  className="transition-colors text-cinema-blue hover:text-cinema-blue/80"
                  aria-label={`Load search ${search.name}`}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(search.id)}
                  className="text-red-400 transition-colors hover:text-red-300"
                  aria-label={`Delete search ${search.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-4 text-sm text-center text-gray-400">
            {currentUser ? 'No saved searches yet' : 'Sign in to save searches'}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

const AdvancedSearch = () => {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState({
    query: '',
    genres: [],
    yearRange: [1990, new Date().getFullYear()],
    ratingRange: [5, 10],
    language: '',
    sortBy: 'popularity.desc',
    includeAdult: false,
    minVotes: 100,
    runtimeRange: [60, 180],
    keywords: []
  });

  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [expandedFilter, setExpandedFilter] = useState(null);

  const debouncedQuery = useDebounce(filters.query, 500);

  useEffect(() => {
    loadGenres();
    loadLanguages();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    if (debouncedQuery || filters.genres.length > 0 || filters.keywords.length > 0) {
      handleSearch();
    }
  }, [debouncedQuery, filters, currentPage]);

  const loadGenres = async () => {
    try {
      const genreData = await tmdbService.getMovieGenres();
      setGenres(genreData);
    } catch (error) {
      console.error('Error loading genres:', error);
      setError('Failed to load genres. Please try again later.');
    }
  };

  const loadLanguages = async () => {
    try {
      const languageData = await tmdbService.getLanguages();
      setLanguages([
        { id: '', name: 'All Languages' },
        ...languageData.sort((a, b) => a.english_name.localeCompare(b.english_name))
      ]);
    } catch (error) {
      console.error('Error loading languages:', error);
      setLanguages([
        { id: '', name: 'All Languages' },
        { id: 'en', name: 'English' },
        { id: 'es', name: 'Spanish' },
        { id: 'fr', name: 'French' },
        { id: 'de', name: 'German' },
        { id: 'it', name: 'Italian' },
        { id: 'ja', name: 'Japanese' },
        { id: 'ko', name: 'Korean' },
        { id: 'zh', name: 'Chinese' },
        { id: 'ru', name: 'Russian' }
      ]);
    }
  };

  const loadKeywords = async (query) => {
    if (!query) return;
    try {
      const keywordData = await tmdbService.searchKeywords(query);
      setKeywords(keywordData);
    } catch (error) {
      console.error('Error loading keywords:', error);
    }
  };

  const loadSavedSearches = () => {
    try {
      const saved = localStorage.getItem('savedSearches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      let searchResults;
      
      if (filters.query) {
        const data = await tmdbService.searchMovies(filters.query, currentPage);
        searchResults = data;
      } else {
        const params = {
          page: currentPage,
          sort_by: filters.sortBy,
          'vote_average.gte': filters.ratingRange[0],
          'vote_average.lte': filters.ratingRange[1],
          'primary_release_date.gte': `${filters.yearRange[0]}-01-01`,
          'primary_release_date.lte': `${filters.yearRange[1]}-12-31`,
          'vote_count.gte': filters.minVotes,
          'with_runtime.gte': filters.runtimeRange[0],
          'with_runtime.lte': filters.runtimeRange[1],
          include_adult: filters.includeAdult
        };

        if (filters.genres.length > 0) {
          params.with_genres = filters.genres.map(g => g.id).join(',');
        }

        if (filters.language) {
          params.with_original_language = filters.language;
        }

        if (filters.keywords.length > 0) {
          params.with_keywords = filters.keywords.map(k => k.id).join(',');
        }

        const data = await tmdbService.discoverMovies(params);
        searchResults = data;
      }

      if (currentPage === 1) {
        setResults(searchResults.movies || []);
        setTotalResults(searchResults.total_results || 0);
      } else {
        setResults(prev => [...prev, ...(searchResults.movies || [])]);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to load results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      genres: [],
      yearRange: [1990, new Date().getFullYear()],
      ratingRange: [5, 10],
      language: '',
      sortBy: 'popularity.desc',
      includeAdult: false,
      minVotes: 100,
      runtimeRange: [60, 180],
      keywords: []
    });
    setResults([]);
    setCurrentPage(1);
    setError(null);
  };

  const handleSaveSearch = (searchData) => {
    const updated = [...savedSearches, searchData];
    setSavedSearches(updated);
    try {
      localStorage.setItem('savedSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleLoadSearch = (searchFilters) => {
    setFilters(searchFilters);
    setCurrentPage(1);
  };

  const handleDeleteSearch = (searchId) => {
    const updated = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updated);
    try {
      localStorage.setItem('savedSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const loadMoreResults = () => {
    setCurrentPage(prev => prev + 1);
  };

  const toggleFilterSection = (section) => {
    setExpandedFilter(expandedFilter === section ? null : section);
  };

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular', icon: TrendingUp },
    { value: 'popularity.asc', label: 'Least Popular', icon: TrendingUp },
    { value: 'release_date.desc', label: 'Newest First', icon: Calendar },
    { value: 'release_date.asc', label: 'Oldest First', icon: Calendar },
    { value: 'vote_average.desc', label: 'Highest Rated', icon: Star },
    { value: 'vote_average.asc', label: 'Lowest Rated', icon: Star },
    { value: 'revenue.desc', label: 'Highest Revenue', icon: TrendingUp },
    { value: 'original_title.asc', label: 'A-Z', icon: TrendingUp },
    { value: 'runtime.desc', label: 'Longest Runtime', icon: Clock },
    { value: 'runtime.asc', label: 'Shortest Runtime', icon: Clock }
  ];

  const Row = ({ index, style }) => {
    const movie = results[index];
    return (
      <div style={style} className="px-2 pb-4">
        <MovieCard movie={movie} />
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-cinema-darker md:py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="flex items-center mb-3 space-x-3 text-3xl font-bold text-white sm:text-4xl">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-cinema-blue" />
            <span>Advanced Search</span>
          </h1>
          <p className="text-base text-gray-400 sm:text-lg">
            Find movies with precision using advanced filters and save your favorite searches
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 lg:col-span-1"
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Search Filters</h3>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => setShowFilters(!showFilters)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="transition-colors text-cinema-blue hover:text-cinema-blue/80"
                    aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                  >
                    <Filter className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={resetFilters}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-400 transition-colors hover:text-white"
                    aria-label="Reset filters"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="search-query" className="block mb-2 font-medium text-white">
                    Search Query
                  </label>
                  <div className="relative">
                    <input
                      id="search-query"
                      type="text"
                      value={filters.query}
                      onChange={(e) => handleFilterChange('query', e.target.value)}
                      placeholder="Enter movie title, actor, director..."
                      className="w-full py-3 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                      aria-label="Search movies"
                    />
                    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleFilterSection('genres')}
                          className="flex items-center justify-between w-full py-2 font-medium text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4" />
                            <span>Genres</span>
                          </div>
                          {expandedFilter === 'genres' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFilter === 'genres' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <MultiSelect
                              options={genres}
                              selected={filters.genres}
                              onChange={(selected) => handleFilterChange('genres', selected)}
                              placeholder="Select genres..."
                            />
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => toggleFilterSection('years')}
                          className="flex items-center justify-between w-full py-2 font-medium text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Release Year</span>
                          </div>
                          {expandedFilter === 'years' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFilter === 'years' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <RangeSlider
                              min={1900}
                              max={new Date().getFullYear()}
                              value={filters.yearRange}
                              onChange={(value) => handleFilterChange('yearRange', value)}
                              label="Release Year"
                            />
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => toggleFilterSection('ratings')}
                          className="flex items-center justify-between w-full py-2 font-medium text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4" />
                            <span>Rating & Runtime</span>
                          </div>
                          {expandedFilter === 'ratings' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFilter === 'ratings' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <RangeSlider
                              min={0}
                              max={10}
                              step={0.1}
                              value={filters.ratingRange}
                              onChange={(value) => handleFilterChange('ratingRange', value)}
                              label="IMDb Rating"
                            />
                            <RangeSlider
                              min={0}
                              max={300}
                              step={5}
                              value={filters.runtimeRange}
                              onChange={(value) => handleFilterChange('runtimeRange', value)}
                              label="Runtime (minutes)"
                            />
                            <div>
                              <label className="block mb-2 font-medium text-white">Minimum Votes</label>
                              <input
                                type="number"
                                value={filters.minVotes}
                                onChange={(e) => handleFilterChange('minVotes', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                                min="0"
                                step="100"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => toggleFilterSection('language')}
                          className="flex items-center justify-between w-full py-2 font-medium text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Language</span>
                          </div>
                          {expandedFilter === 'language' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFilter === 'language' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <select
                              value={filters.language}
                              onChange={(e) => handleFilterChange('language', e.target.value)}
                              className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                              aria-label="Select language"
                            >
                              {languages.map(lang => (
                                <option key={lang.id} value={lang.id} className="bg-cinema-dark">
                                  {lang.name}
                                </option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => toggleFilterSection('sort')}
                          className="flex items-center justify-between w-full py-2 font-medium text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Sort Options</span>
                          </div>
                          {expandedFilter === 'sort' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFilter === 'sort' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <select
                              value={filters.sortBy}
                              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                              className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                              aria-label="Sort by"
                            >
                              {sortOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-cinema-dark">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="font-medium text-white">Include Adult Content</label>
                        <button
                          type="button"
                          onClick={() => handleFilterChange('includeAdult', !filters.includeAdult)}
                          className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors ${
                            filters.includeAdult ? 'bg-cinema-blue' : 'bg-gray-600'
                          }`}
                          aria-label={filters.includeAdult ? 'Exclude adult content' : 'Include adult content'}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            filters.includeAdult ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>

            {currentUser && (
              <SavedSearches
                searches={savedSearches}
                onLoad={handleLoadSearch}
                onDelete={handleDeleteSearch}
                onSave={handleSaveSearch}
                currentFilters={filters}
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Search Results</h2>
                {totalResults > 0 && (
                  <p className="text-gray-400">
                    Found {totalResults.toLocaleString()} movies
                    {filters.query && ` for "${filters.query}"`}
                  </p>
                )}
              </div>
              
              {results.length > 0 && (
                <div className="flex items-center space-x-4">
                  <TrendingUp className="w-5 h-5 text-cinema-blue" />
                  <span className="text-gray-400">Showing {results.length} of {totalResults}</span>
                </div>
              )}
            </div>

            {error && (
              <GlassCard className="p-6 mb-6">
                <div className="flex items-start space-x-3 text-red-400">
                  <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="mb-1 font-semibold">Error</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {loading && results.length === 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="h-full">
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        height={height}
                        itemCount={results.length}
                        itemSize={300}
                        width={width}
                        overscanCount={3}
                      >
                        {Row}
                      </List>
                    )}
                  </AutoSizer>
                </div>

                {results.length < totalResults && (
                  <div className="flex justify-center mt-6">
                    <motion.button
                      onClick={loadMoreResults}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center px-8 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Search className="w-5 h-5" />
                          </motion.div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Load More</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </>
            )}

            {!loading && results.length === 0 && (filters.query || filters.genres.length > 0) && (
              <GlassCard className="p-8 text-center sm:p-12">
                <Search className="w-12 h-12 mx-auto mb-6 text-gray-500 sm:w-16 sm:h-16" />
                <h3 className="mb-3 text-xl font-semibold text-white">No Results Found</h3>
                <p className="mb-6 text-gray-400">
                  Try adjusting your search criteria or filters to find more movies.
                </p>
                <motion.button
                  onClick={resetFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-6 py-3 mx-auto space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset Filters</span>
                </motion.button>
              </GlassCard>
            )}

            {!loading && results.length === 0 && !filters.query && filters.genres.length === 0 && (
              <GlassCard className="p-6 text-center sm:p-12">
                <Search className="w-12 h-12 mx-auto mb-6 sm:w-16 sm:h-16 text-cinema-blue" />
                <h3 className="mb-4 text-2xl font-bold text-white">Advanced Movie Search</h3>
                <p className="mb-6 text-lg text-gray-400">
                  Use the filters on the left to discover movies that match your exact preferences.
                </p>
                <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-white/5">
                    <Filter className="w-6 h-6 mb-3 sm:w-8 sm:h-8 text-cinema-blue" />
                    <h4 className="mb-2 font-semibold text-white">Smart Filters</h4>
                    <p className="text-sm text-gray-400">Filter by genre, year, rating, language and more</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <Save className="w-6 h-6 mb-3 text-green-400 sm:w-8 sm:h-8" />
                    <h4 className="mb-2 font-semibold text-white">Save Searches</h4>
                    <p className="text-sm text-gray-400">Save your favorite filter combinations for quick access</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <TrendingUp className="w-6 h-6 mb-3 text-purple-400 sm:w-8 sm:h-8" />
                    <h4 className="mb-2 font-semibold text-white">Smart Sorting</h4>
                    <p className="text-sm text-gray-400">Sort results by popularity, rating, release date and more</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;