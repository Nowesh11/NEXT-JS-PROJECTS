import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

/**
 * Hook for fetching and managing posters
 * @param {Object} initialFilters - Initial filter parameters
 * @returns {Object} - Poster data and management functions
 */
export function usePosters(initialFilters = {}) {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchPosters = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getPosters(filters);
        setPosters(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching posters:', err);
        setError(err.message || 'Failed to load posters');
        setPosters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, [filters]);

  /**
   * Update filters and trigger a new fetch
   * @param {Object} newFilters - New filter parameters to apply
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  /**
   * Reset filters to initial state
   */
  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    posters,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters
  };
}

/**
 * Hook for fetching and managing a single poster
 * @param {string} id - Poster ID
 * @returns {Object} - Poster data and loading state
 */
export function usePoster(id) {
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchPoster = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getPoster(id);
        setPoster(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching poster:', err);
        setError(err.message || 'Failed to load poster');
        setPoster(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, [id]);

  return {
    poster,
    loading,
    error
  };
}