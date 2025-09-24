import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import Layout from '../../components/Layout';
import Layout from '../../components/Layout';

const ProjectsPage = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock projects data for Tamil Language Society
  const mockProjects = [
    {
      id: 1,
      title: { en: 'Digital Tamil Library', ta: 'டிஜிட்டல் தமிழ் நூலகம்' },
      description: { en: 'Digitizing ancient Tamil manuscripts and literature for future generations', ta: 'எதிர்கால சந்ததியினருக்காக பழங்கால தமிழ் கையெழுத்துப் பிரதிகள் மற்றும் இலக்கியங்களை டிஜிட்டல்மயமாக்குதல்' },
      category: 'preservation',
      status: 'active',
      progress: 75,
      image: '/api/placeholder/400/250',
      startDate: '2023-01-15',
      team: 12,
      budget: '$50,000'
    },
    {
      id: 2,
      title: { en: 'Tamil Language Learning App', ta: 'தமிழ் மொழி கற்றல் செயலி' },
      description: { en: 'Interactive mobile application for learning Tamil language with AI-powered features', ta: 'AI சக்தி கொண்ட அம்சங்களுடன் தமிழ் மொழி கற்றலுக்கான ஊடாடும் மொபைல் செயலி' },
      category: 'education',
      status: 'completed',
      progress: 100,
      image: '/api/placeholder/400/250',
      startDate: '2022-06-01',
      team: 8,
      budget: '$75,000'
    },
    {
      id: 3,
      title: { en: 'Cultural Heritage Documentation', ta: 'கலாச்சார பாரம்பரிய ஆவணப்படுத்தல்' },
      description: { en: 'Comprehensive documentation and preservation of Tamil cultural traditions', ta: 'தமிழ் கலாச்சார பாரம்பரியங்களின் விரிவான ஆவணப்படுத்தல் மற்றும் பாதுகாப்பு' },
      category: 'culture',
      status: 'planning',
      progress: 25,
      image: '/api/placeholder/400/250',
      startDate: '2024-03-01',
      team: 15,
      budget: '$100,000'
    },
    {
      id: 4,
      title: { en: 'Tamil Poetry Archive', ta: 'தமிழ் கவிதை காப்பகம்' },
      description: { en: 'Digital archive of classical and contemporary Tamil poetry', ta: 'பாரம்பரிய மற்றும் சமகால தமிழ் கவிதைகளின் டிஜிட்டல் காப்பகம்' },
      category: 'literature',
      status: 'active',
      progress: 60,
      image: '/api/placeholder/400/250',
      startDate: '2023-09-15',
      team: 6,
      budget: '$30,000'
    },
    {
      id: 5,
      title: { en: 'Tamil Script Evolution Study', ta: 'தமிழ் எழுத்து வளர்ச்சி ஆய்வு' },
      description: { en: 'Research project studying the evolution of Tamil script through centuries', ta: 'நூற்றாண்டுகளாக தமிழ் எழுத்தின் வளர்ச்சியை ஆய்வு செய்யும் ஆராய்ச்சி திட்டம்' },
      category: 'research',
      status: 'completed',
      progress: 100,
      image: '/api/placeholder/400/250',
      startDate: '2022-01-01',
      team: 4,
      budget: '$25,000'
    },
    {
      id: 6,
      title: { en: 'Community Outreach Program', ta: 'சமூக விழிப்புணர்வு திட்டம்' },
      description: { en: 'Engaging communities to promote Tamil language and culture', ta: 'தமிழ் மொழி மற்றும் கலாச்சாரத்தை ஊக்குவிக்க சமூகங்களை ஈடுபடுத்துதல்' },
      category: 'outreach',
      status: 'active',
      progress: 40,
      image: '/api/placeholder/400/250',
      startDate: '2023-11-01',
      team: 20,
      budget: '$80,000'
    }
  ];

  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  const categories = [
    { value: 'all', label: { en: 'All Categories', ta: 'அனைத்து வகைகள்' } },
    { value: 'preservation', label: { en: 'Preservation', ta: 'பாதுகாப்பு' } },
    { value: 'education', label: { en: 'Education', ta: 'கல்வி' } },
    { value: 'culture', label: { en: 'Culture', ta: 'கலாச்சாரம்' } },
    { value: 'literature', label: { en: 'Literature', ta: 'இலக்கியம்' } },
    { value: 'research', label: { en: 'Research', ta: 'ஆராய்ச்சி' } },
    { value: 'outreach', label: { en: 'Outreach', ta: 'விழிப்புணர்வு' } }
  ];

  const statuses = [
    { value: 'all', label: { en: 'All Status', ta: 'அனைத்து நிலைகள்' } },
    { value: 'planning', label: { en: 'Planning', ta: 'திட்டமிடல்' } },
    { value: 'active', label: { en: 'Active', ta: 'செயலில்' } },
    { value: 'completed', label: { en: 'Completed', ta: 'முடிந்தது' } }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description[language].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      completed: { en: 'Completed', ta: 'முடிந்தது' },
      active: { en: 'Active', ta: 'செயலில்' },
      planning: { en: 'Planning', ta: 'திட்டமிடல்' }
    };
    return statusMap[status]?.[language] || status;
  };

  const projectsText = {
    title: { en: 'Our Projects', ta: 'எங்கள் திட்டங்கள்' },
    subtitle: { en: 'Innovative initiatives preserving and promoting Tamil heritage', ta: 'தமிழ் பாரம்பரியத்தை பாதுகாத்து ஊக்குவிக்கும் புதுமையான முயற்சிகள்' },
    searchPlaceholder: { en: 'Search projects...', ta: 'திட்டங்களை தேடுங்கள்...' },
    filterBy: { en: 'Filter by', ta: 'வடிகட்டு' },
    category: { en: 'Category', ta: 'வகை' },
    status: { en: 'Status', ta: 'நிலை' },
    progress: { en: 'Progress', ta: 'முன்னேற்றம்' },
    team: { en: 'Team', ta: 'குழு' },
    budget: { en: 'Budget', ta: 'பட்ஜெட்' },
    startDate: { en: 'Start Date', ta: 'தொடக்க தேதி' },
    viewDetails: { en: 'View Details', ta: 'விவரங்களை பார்க்க' },
    noProjects: { en: 'No projects found matching your criteria.', ta: 'உங்கள் அளவுகோல்களுக்கு பொருந்தும் திட்டங்கள் எதுவும் கிடைக்கவில்லை.' },
    members: { en: 'members', ta: 'உறுப்பினர்கள்' },
    featuredProjects: { en: 'Featured Projects', ta: 'சிறப்பு திட்டங்கள்' },
    allProjects: { en: 'All Projects', ta: 'அனைத்து திட்டங்கள்' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{projectsText.title[language]} - Tamil Literary Society</title>
        <meta name="description" content={projectsText.subtitle[language]} />
        <meta name="keywords" content="Tamil projects, literary projects, cultural preservation, Tamil society, digital library, education" />
        <meta property="og:title" content={`${projectsText.title[language]} - Tamil Literary Society`} />
        <meta property="og:description" content={projectsText.subtitle[language]} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/projects" />
      </Head>

      <Layout>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Hero Section */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5" />
            <div className="container mx-auto max-w-6xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  {projectsText.title[language]}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  {projectsText.subtitle[language]}
                </p>
              </motion.div>

              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder={projectsText.searchPlaceholder[language]}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label[language]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label[language]}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Projects Grid */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              {filteredProjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {projectsText.noProjects[language]}
                  </h3>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-200/50 dark:border-gray-700/50"
                    >
                      <div className="relative overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <div className="text-white text-6xl opacity-50">📚</div>
                        </div>
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {project.title[language]}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {project.description[language]}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {projectsText.progress[language]}
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {project.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            />
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{projectsText.team[language]}:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{project.team} {projectsText.members[language]}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{projectsText.budget[language]}:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{project.budget}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{projectsText.startDate[language]}:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(project.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Link href={`/projects/${project.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            {projectsText.viewDetails[language]}
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>

          {/* Statistics Section */}
          <section className="py-16 px-4 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-4 gap-8"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{projects.length}</div>
                  <div className="text-gray-600 dark:text-gray-300">{projectsText.allProjects[language]}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {projects.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {projects.reduce((sum, p) => sum + p.team, 0)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Team Members</div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </Layout>

      <style jsx global>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .container {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        @media (min-width: 640px) {
          .container {
            max-width: 640px;
          }
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 768px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 1024px;
          }
        }
        
        @media (min-width: 1280px) {
          .container {
            max-width: 1280px;
          }
        }
        
        @media (min-width: 1536px) {
          .container {
            max-width: 1536px;
          }
        }
      `}</style>
    </>
  );
};

export default ProjectsPage;
