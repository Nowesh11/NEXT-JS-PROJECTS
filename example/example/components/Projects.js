'use client';

import React, { useState, useEffect } from 'react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEnglish, setIsEnglish] = useState(true);

  // Local translation function
  const getText = (key, defaultText) => {
    const translations = {
      'projects.title': isEnglish ? 'Our Projects' : 'எங்கள் திட்டங்கள்',
      'projects.subtitle': isEnglish ? 'Innovative initiatives preserving and promoting Tamil language and culture' : 'தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாக்கும் மற்றும் மேம்படுத்தும் புதுமையான முயற்சிகள்',
      'projects.search.placeholder': isEnglish ? 'Search projects...' : 'திட்டங்களைத் தேடுங்கள்...',
      'projects.filter.all': isEnglish ? 'All Projects' : 'அனைத்து திட்டங்கள்',
      'projects.filter.digital': isEnglish ? 'Digital Innovation' : 'டிஜிட்டல் புதுமை',
      'projects.filter.education': isEnglish ? 'Education' : 'கல்வி',
      'projects.filter.community': isEnglish ? 'Community' : 'சமூகம்',
      'projects.filter.research': isEnglish ? 'Research' : 'ஆராய்ச்சி',
      'projects.viewDetails': isEnglish ? 'View Details' : 'விவரங்களைப் பார்க்கவும்',
      'projects.progress': isEnglish ? 'Progress' : 'முன்னேற்றம்',
      'projects.noProjects': isEnglish ? 'No projects found' : 'திட்டங்கள் எதுவும் கிடைக்கவில்லை',
      'projects.loading': isEnglish ? 'Loading projects...' : 'திட்டங்கள் ஏற்றப்படுகின்றன...'
    };
    return translations[key] || defaultText;
  };

  // Static project data as fallback
  const staticProjects = [
    {
      _id: 'project_001',
      title: {
        en: 'Tamil Language Preservation',
        ta: 'தமிழ் மொழி பாதுகாப்பு'
      },
      description: {
        en: 'Initiative to preserve and promote Tamil language among youth through digital platforms and community engagement',
        ta: 'டிஜிட்டல் தளங்கள் மற்றும் சமூக ஈடுபாட்டின் மூலம் இளைஞர்களிடையே தமிழ் மொழியைப் பாதுகாக்கும் மற்றும் மேம்படுத்தும் முயற்சி'
      },
      bureau: 'Cultural',
      status: 'active',
      progress: 75,
      participants: 150,
      primary_image: '/assets/projects/tamil-preservation.jpg',
      slug: 'tamil-language-preservation'
    },
    {
      _id: 'project_002',
      title: {
        en: 'Digital Tamil Archive',
        ta: 'டிஜிட்டல் தமிழ் காப்பகம்'
      },
      description: {
        en: 'Creating a comprehensive digital repository of Tamil literature, manuscripts, and cultural artifacts',
        ta: 'தமிழ் இலக்கியம், கையெழுத்துப் பிரதிகள் மற்றும் கலாச்சார கலைப்பொருட்களின் விரிவான டிஜிட்டல் களஞ்சியத்தை உருவாக்குதல்'
      },
      bureau: 'Technology',
      status: 'in development',
      progress: 60,
      participants: 85,
      primary_image: '/assets/projects/digital-archive.jpg',
      slug: 'digital-tamil-archive'
    },
    {
      _id: 'project_003',
      title: {
        en: 'Tamil AI Language Model',
        ta: 'தமிழ் AI மொழி மாதிரி'
      },
      description: {
        en: 'Advanced AI model specifically trained for Tamil language processing, translation, and content generation',
        ta: 'தமிழ் மொழி செயலாக்கம், மொழிபெயர்ப்பு மற்றும் உள்ளடக்க உருவாக்கத்திற்காக குறிப்பாக பயிற்சி பெற்ற மேம்பட்ட AI மாதிரி'
      },
      bureau: 'Research',
      status: 'active',
      progress: 80,
      participants: 25,
      primary_image: '/assets/projects/tamil-ai.jpg',
      slug: 'tamil-ai-language-model'
    },
    {
      _id: 'project_004',
      title: {
        en: 'Community Learning Centers',
        ta: 'சமூக கற்றல் மையங்கள்'
      },
      description: {
        en: 'Establishing local centers for Tamil language education and cultural activities',
        ta: 'தமிழ் மொழி கல்வி மற்றும் கலாச்சார நடவடிக்கைகளுக்கான உள்ளூர் மையங்களை நிறுவுதல்'
      },
      bureau: 'Education',
      status: 'active',
      progress: 65,
      participants: 200,
      primary_image: '/assets/projects/learning-centers.jpg',
      slug: 'community-learning-centers'
    },
    {
      _id: 'project_005',
      title: {
        en: 'Tamil Mobile Learning App',
        ta: 'தமிழ் மொபைல் கற்றல் பயன்பாடு'
      },
      description: {
        en: 'Interactive mobile application for learning Tamil language with gamification and AR features',
        ta: 'கேமிஃபிகேஷன் மற்றும் AR அம்சங்களுடன் தமிழ் மொழி கற்றலுக்கான ஊடாடும் மொபைல் பயன்பாடு'
      },
      bureau: 'Technology',
      status: 'active',
      progress: 90,
      participants: 18,
      primary_image: '/assets/projects/mobile-app.jpg',
      slug: 'tamil-mobile-learning-app'
    },
    {
      _id: 'project_006',
      title: {
        en: 'Cultural Heritage Documentation',
        ta: 'கலாச்சார பாரம்பரிய ஆவணப்படுத்தல்'
      },
      description: {
        en: 'Systematic documentation and preservation of Tamil cultural practices, festivals, and traditions',
        ta: 'தமிழ் கலாச்சார நடைமுறைகள், திருவிழாக்கள் மற்றும் பாரம்பரியங்களின் முறையான ஆவணப்படுத்தல் மற்றும் பாதுகாப்பு'
      },
      bureau: 'Cultural',
      status: 'active',
      progress: 70,
      participants: 35,
      primary_image: '/assets/projects/heritage.jpg',
      slug: 'cultural-heritage-documentation'
    }
  ];

  // Filter options
  const filters = [
    { id: 'all', label: getText('projects.filter.all', 'All Projects') },
    { id: 'Technology', label: getText('projects.filter.digital', 'Technology') },
    { id: 'Education', label: getText('projects.filter.education', 'Education') },
    { id: 'Cultural', label: getText('projects.filter.community', 'Cultural') },
    { id: 'Research', label: getText('projects.filter.research', 'Research') }
  ];

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects when search term or active filter changes
  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, activeFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      // For now, use static data as the API integration will be handled separately
      setProjects(staticProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to static data
      setProjects(staticProjects);
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by bureau/category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(project => project.bureau === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project => {
        const title = typeof project.title === 'object' 
          ? (project.title.en || project.title.ta || '')
          : (project.title || '');
        const description = typeof project.description === 'object'
          ? (project.description.en || project.description.ta || '')
          : (project.description || '');
        
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (project.bureau || '').toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getProjectTitle = (project) => {
    if (typeof project.title === 'object') {
      return isEnglish ? (project.title.en || project.title.ta) : (project.title.ta || project.title.en);
    }
    return project.title || 'Untitled Project';
  };

  const getProjectDescription = (project) => {
    if (typeof project.description === 'object') {
      return isEnglish ? (project.description.en || project.description.ta) : (project.description.ta || project.description.en);
    }
    return project.description || 'No description available';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'in development': return '#F59E0B';
      case 'completed': return '#3B82F6';
      case 'on hold': return '#6B7280';
      default: return '#10B981';
    }
  };

  const navigateToDetail = (slug) => {
    // For now, just show an alert. In a real app, this would navigate to the detail page
    alert(`Navigating to project: ${slug}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <p>{getText('projects.loading', 'Loading projects...')}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '6rem 1rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '2rem',
          padding: '3rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            textShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            {getText('projects.title', 'Our Projects')}
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: 0.9,
            lineHeight: 1.6
          }}>
            {getText('projects.subtitle', 'Innovative initiatives preserving and promoting Tamil language and culture')}
          </p>

          {/* Language Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50px',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}>
              <button
                onClick={() => setIsEnglish(true)}
                style={{
                  background: isEnglish ? 'rgba(255, 255, 255, 0.2)' : 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                English
              </button>
              <button
                onClick={() => setIsEnglish(false)}
                style={{
                  background: !isEnglish ? 'rgba(255, 255, 255, 0.2)' : 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '4rem 1rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Search Bar */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{
              position: 'relative',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <span style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.2rem'
              }}>🔍</span>
              <input
                type="text"
                placeholder={getText('projects.search.placeholder', 'Search projects...')}
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: activeFilter === filter.id ? 'none' : '2px solid #667eea',
                  background: activeFilter === filter.id 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                    : 'white',
                  color: activeFilter === filter.id ? 'white' : '#667eea',
                  borderRadius: '2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  boxShadow: activeFilter === filter.id 
                    ? '0 8px 25px rgba(102, 126, 234, 0.3)' 
                    : '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => {
                  if (activeFilter !== filter.id) {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeFilter !== filter.id) {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ color: '#64748b', marginBottom: '1rem' }}>
                {getText('projects.noProjects', 'No projects found')}
              </h3>
              <p style={{ color: '#94a3b8' }}>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem'
            }}>
              {filteredProjects.map((project, index) => (
                <div
                  key={project._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: '420px',
                    animationDelay: `${index * 0.1}s`
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Project Image */}
                  <div style={{
                    height: '200px',
                    background: `linear-gradient(135deg, ${getStatusColor(project.status)}, #667eea)`,
                    backgroundImage: project.primary_image ? `url(${project.primary_image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!project.primary_image && (
                      <span style={{ fontSize: '3rem', color: 'white' }}>📊</span>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {project.bureau || 'General'}
                    </div>
                  </div>

                  {/* Project Content */}
                  <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}>
                    <h3 style={{
                      color: '#1e293b',
                      marginBottom: '1rem',
                      fontWeight: '600',
                      fontSize: '1.25rem',
                      minHeight: '2.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {getProjectTitle(project)}
                    </h3>

                    <p style={{
                      color: '#64748b',
                      lineHeight: 1.6,
                      marginBottom: '1.5rem',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {getProjectDescription(project)}
                    </p>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {getText('projects.progress', 'Progress')}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#667eea',
                          fontWeight: '600'
                        }}>
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div style={{
                        background: '#e2e8f0',
                        height: '8px',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: `linear-gradient(90deg, ${getStatusColor(project.status)}, #667eea)`,
                          height: '100%',
                          width: `${project.progress || 0}%`,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => navigateToDetail(project.slug || project._id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        borderRadius: '0.5rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span>👁️</span>
                      {getText('projects.viewDetails', 'View Details')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;