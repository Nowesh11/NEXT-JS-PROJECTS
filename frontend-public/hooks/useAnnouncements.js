import { useState, useEffect } from 'react';

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API
        const response = await fetch('/api/announcements');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setAnnouncements(data);
        } else {
          // If API doesn't return expected format, use empty array
          setAnnouncements([]);
        }
      } catch (err) {
        console.warn('Failed to fetch announcements from API:', err.message);
        setError(err.message);
        
        // Fallback to mock data or empty array
        setAnnouncements([
          {
            id: 1,
            title: 'Tamil Cultural Festival 2024',
            description: 'Join us for our annual Tamil Cultural Festival featuring traditional music, dance, and literature. Experience the rich heritage of Tamil culture with performances by renowned artists.',
            image: '/assets/cultural-festival.jpg',
            url: '/events/cultural-festival-2024',
            buttonText: 'Register Now',
            createdAt: new Date().toISOString(),
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const refreshAnnouncements = async () => {
    await fetchAnnouncements();
  };

  return {
    announcements,
    loading,
    error,
    refreshAnnouncements
  };
};

export { useAnnouncements };