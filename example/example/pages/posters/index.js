import Head from 'next/head';
import { useContent } from '../../contexts/ContentContext';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PosterDisplay from '../../components/PosterDisplay';
import styles from '../../styles/Posters.module.css';
import { usePosters } from '../../hooks/usePosters';

export default function Posters() {
  const initialFilters = {
    category: '',
    artist: '',
    sort: 'newest'
  };
  
  const { getContent } = useContent();
  const { posters, loading, error, filters, updateFilters } = usePosters(initialFilters);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateFilters({
      [name]: value
    });
  };

  return (
    <>
      <Head>
        <title>{getContent('posters.pageTitle', 'Posters - Tamil Language Society')}</title>
        <meta name="description" content={getContent('posters.pageDescription', 'Browse and purchase posters from Tamil Language Society.')} />
      </Head>

      <Navigation />

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{getContent('posters.heading', 'Posters')}</h1>
          
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="category">{getContent('posters.filters.category', 'Category')}:</label>
              <select 
                id="category" 
                name="category" 
                value={filters.category} 
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">{getContent('posters.filters.allCategories', 'All Categories')}</option>
                <option value="cultural">Cultural</option>
                <option value="educational">Educational</option>
                <option value="events">Events</option>
                <option value="art">Art</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="artist">{getContent('posters.filters.artist', 'Artist')}:</label>
              <select 
                id="artist" 
                name="artist" 
                value={filters.artist} 
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">{getContent('posters.filters.allArtists', 'All Artists')}</option>
                <option value="tls">Tamil Language Society</option>
                <option value="guest">Guest Artists</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="sort">{getContent('posters.filters.sort', 'Sort By')}:</label>
              <select 
                id="sort" 
                name="sort" 
                value={filters.sort} 
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="newest">{getContent('posters.filters.newest', 'Newest')}</option>
                <option value="popular">{getContent('posters.filters.popular', 'Most Popular')}</option>
                <option value="priceAsc">{getContent('posters.filters.priceAsc', 'Price: Low to High')}</option>
                <option value="priceDesc">{getContent('posters.filters.priceDesc', 'Price: High to Low')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>{getContent('posters.loading', 'Loading posters...')}</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button 
                onClick={() => updateFilters({ category: '', artist: '', sort: 'newest' })}
                className={styles.retryButton}
              >
                {getContent('posters.retry', 'Retry')}
              </button>
            </div>
          ) : posters.length === 0 ? (
            <div className={styles.emptyContainer}>
              <i className="fas fa-search"></i>
              <p>{getContent('posters.noPosters', 'No posters found matching your criteria.')}</p>
              <button 
                onClick={() => updateFilters({ category: '', artist: '', sort: 'newest' })}
                className={styles.resetButton}
              >
                {getContent('posters.resetFilters', 'Reset Filters')}
              </button>
            </div>
          ) : (
            <div className={styles.postersGrid}>
              {posters.map((poster) => (
                <div key={poster.id} className={styles.posterItem}>
                  <PosterDisplay poster={poster} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}