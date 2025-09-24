import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShare, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaLink,
  FaExpand,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaFlag,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaInfoCircle,
  FaHeart,
  FaBookmark,
  FaUsers,
  FaTrophy,
  FaClock,
  FaTarget,
  FaBullseye,
  FaChartLine,
  FaCheckCircle,
  FaCalendarPlus,
  FaCalendarEdit,
  FaUserTie,
  FaSearchPlus,
  FaCopy,
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaStar
} from 'react-icons/fa';
import RecruitmentSection from './RecruitmentSection';

const Detail = ({ itemData, itemType = 'project', onJoinProject, onShareProject, language = 'en' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Bilingual text helper
  const getText = (key) => {
    const texts = {
      goals: { en: 'Goals', ta: 'இலக்குகள்' },
      detailedDescription: { en: 'Detailed Description', ta: 'விரிவான விளக்கம்' },
      achievements: { en: 'Achievements', ta: 'சாதனைகள்' },
      projectInfo: { en: 'Project Information', ta: 'திட்ட தகவல்' },
      progress: { en: 'Progress', ta: 'முன்னேற்றம்' },
      shareActions: { en: 'Share & Actions', ta: 'பகிர்வு மற்றும் செயல்கள்' },
      shareProject: { en: 'Share Project', ta: 'திட்டத்தை பகிரவும்' },
      saveForLater: { en: 'Save for Later', ta: 'பின்னர் சேமிக்கவும்' },
      supportProject: { en: 'Support Project', ta: 'திட்டத்தை ஆதரிக்கவும்' },
      bureau: { en: 'Bureau', ta: 'பணியகம்' },
      director: { en: 'Director', ta: 'இயக்குனர்' },
      status: { en: 'Status', ta: 'நிலை' },
      createdDate: { en: 'Created', ta: 'உருவாக்கப்பட்டது' },
      category: { en: 'Category', ta: 'வகை' },
      participants: { en: 'Participants', ta: 'பங்கேற்பாளர்கள்' },
      requirements: { en: 'Requirements', ta: 'தேவைகள்' },
      benefits: { en: 'Benefits', ta: 'நன்மைகள்' },
      milestones: { en: 'Milestones', ta: 'மைல்கற்கள்' },
      copyLink: { en: 'Copy Link', ta: 'இணைப்பை நகலெடுக்கவும்' },
      shareSupport: { en: 'Share & Support', ta: 'பகிர்வு மற்றும் ஆதரவு' }
    };
    return texts[key]?.[currentLanguage] || texts[key]?.en || key;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLanguage);
  }, []);

  // Helper function to get bilingual content
  const getBilingualContent = (content, lang = language) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[lang] || content.en || content.ta || '';
    }
    return '';
  };

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/default-project.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
  };

  const images = itemData?.images || [];
  const primaryImage = images.find(img => img.is_primary || img.isPrimary) || images[0];

  // Handle keyboard navigation for image modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showImageModal) return;
      
      if (e.key === 'Escape') {
        setShowImageModal(false);
      } else if (e.key === 'ArrowLeft') {
        setModalImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight') {
        setModalImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showImageModal, images.length]);

  const openImageModal = (index) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    setModalImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const prevImage = () => {
    setModalImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: title || 'TLS Project',
      text: `Check out this ${itemType}: ${title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
      alert(currentLanguage === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
    } catch (error) {
      console.log('Error copying link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(currentLanguage === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
    }
  };
  const title = getBilingualContent(itemData?.title);
  const titleTamil = itemData?.titleTamil || (itemData?.title?.ta);
  const description = getBilingualContent(itemData?.description);
  const status = itemData?.status || 'planning';
  const category = itemData?.category || 'other';
  const progress = itemData?.progress || 0;

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Gallery Modal Component
  const GalleryModal = () => (
    <AnimatePresence>
      {showGalleryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowGalleryModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowGalleryModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <FaTimes size={24} />
            </button>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <FaChevronRight size={24} />
                </button>
              </>
            )}
            
            <img
              src={getImageUrl(images[selectedImage]?.file_path || images[selectedImage]?.url)}
              alt={`${title} - Image ${selectedImage + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="text-sm opacity-75">{selectedImage + 1} of {images.length}</p>
              {images[selectedImage]?.description && (
                <p className="text-sm mt-1">{images[selectedImage].description}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4"
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              {title}
            </motion.h1>

            {/* Tamil Title */}
            {titleTamil && language === 'en' && titleTamil !== title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-semibold text-amber-600 mb-6"
                style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
              >
                {titleTamil}
              </motion.h2>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              {description}
            </motion.p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold ${getStatusColor(status)}`}
            >
              <FaInfoCircle className="mr-2" />
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            {images.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Gallery</h3>
                  
                  {/* Main Image */}
                  <div className="relative mb-6">
                    <img
                      src={getImageUrl(images[selectedImage]?.file_path || images[selectedImage]?.url)}
                      alt={`${title} - Main Image`}
                      className="w-full h-96 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openImageModal(selectedImage)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100">
                      <FaSearchPlus className="text-white text-3xl" />
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                      {images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className={`relative cursor-pointer rounded-lg overflow-hidden ${
                            selectedImage === index ? 'ring-4 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedImage(index)}
                          onDoubleClick={() => openImageModal(index)}
                        >
                          <img
                            src={getImageUrl(image.file_path || image.url)}
                            alt={`${title} - Thumbnail ${index + 1}`}
                            className="w-full h-24 object-cover hover:opacity-80 transition-opacity"
                          />
                          {index === 3 && images.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                              +{images.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Goals Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FaBullseye className="text-blue-600 mr-3" />
                {getText('goals')} & Objectives
              </h3>
              <div className="goals-content">
                {itemData?.goals ? (
                  Array.isArray(itemData.goals) ? (
                    <ul className="space-y-3">
                      {itemData.goals.map((goal, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{getBilingualContent(goal)}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{getBilingualContent(itemData.goals)}</p>
                  )
                ) : (
                  <p className="text-gray-500 italic">No specific goals defined for this {itemType}.</p>
                )}
              </div>
            </motion.section>

            {/* Detailed Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{getText('detailedDescription')}</h3>
              <div className="detailed-description prose prose-lg max-w-none">
                {itemData?.detailedDescription ? (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {getBilingualContent(itemData.detailedDescription)}
                    </p>
                    
                    {/* Director Information */}
                    {itemData?.director && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <FaUserTie className="text-blue-600 mr-2" />
                          Project Director
                        </h4>
                        <div className="text-gray-700">
                          <p className="font-medium">{itemData.director.name}</p>
                          {itemData.director.email && (
                            <p className="text-sm text-gray-600">{itemData.director.email}</p>
                          )}
                          {itemData.director.phone && (
                            <p className="text-sm text-gray-600">{itemData.director.phone}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Sections */}
                    {itemData?.requirements && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                        <div className="text-gray-700">
                          {Array.isArray(itemData.requirements) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {itemData.requirements.map((req, index) => (
                                <li key={index}>{getBilingualContent(req)}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{getBilingualContent(itemData.requirements)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {itemData?.benefits && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                        <div className="text-gray-700">
                          {Array.isArray(itemData.benefits) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {itemData.benefits.map((benefit, index) => (
                                <li key={index}>{getBilingualContent(benefit)}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{getBilingualContent(itemData.benefits)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No detailed description available.</p>
                )}
              </div>
            </motion.section>

            {/* Achievements */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FaTrophy className="text-yellow-500 mr-3" />
                {getText('achievements')}
              </h3>
              <div className="achievements-content">
                {itemData?.achievements && itemData.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {itemData.achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-400"
                      >
                        <div className="flex items-start space-x-3">
                          <FaTrophy className="text-yellow-500 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {getBilingualContent(achievement.title || achievement)}
                            </h4>
                            {achievement.description && (
                              <p className="text-gray-700 mt-1">
                                {getBilingualContent(achievement.description)}
                              </p>
                            )}
                            {achievement.date && (
                              <p className="text-sm text-gray-500 mt-2 flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaTrophy className="text-gray-300 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">No achievements recorded yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later for updates on milestones and accomplishments.</p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Project Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{getText('projectInfo')}</h3>
              <div className="project-info space-y-4">
                <div className="info-item flex justify-between items-start">
                  <span className="font-medium text-gray-600 flex items-center">
                    <FaBuilding className="mr-2 text-blue-600" />
                    {getText('bureau')}:
                  </span>
                  <span className="text-gray-900 text-right">
                    {itemData?.bureau || 'Tamil Cultural Bureau'}
                  </span>
                </div>
                
                {itemData?.director && (
                  <div className="info-item">
                    <span className="font-medium text-gray-600 flex items-center mb-2">
                      <FaUserTie className="mr-2 text-blue-600" />
                      {getText('director')}:
                    </span>
                    <div className="director-info bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{itemData.director.name}</div>
                      {itemData.director.email && (
                        <div className="text-sm text-gray-600 mt-1">{itemData.director.email}</div>
                      )}
                      {itemData.director.phone && (
                        <div className="text-sm text-gray-600">{itemData.director.phone}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="info-item flex justify-between items-center">
                  <span className="font-medium text-gray-600 flex items-center">
                    <FaFlag className="mr-2 text-blue-600" />
                    {getText('status')}:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    itemData?.status === 'active' ? 'bg-green-100 text-green-800' :
                    itemData?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    itemData?.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {itemData?.status || 'Active'}
                  </span>
                </div>
                
                {itemData?.createdAt && (
                  <div className="info-item flex justify-between items-center">
                    <span className="font-medium text-gray-600 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      {getText('createdDate')}:
                    </span>
                    <span className="text-gray-900">
                      {new Date(itemData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {itemData?.category && (
                  <div className="info-item flex justify-between items-center">
                    <span className="font-medium text-gray-600">{getText('category')}:</span>
                    <span className="text-gray-900 bg-blue-50 px-2 py-1 rounded text-sm">
                      {itemData.category}
                    </span>
                  </div>
                )}
                
                {itemData?.participants && (
                  <div className="info-item flex justify-between items-center">
                    <span className="font-medium text-gray-600 flex items-center">
                      <FaUsers className="mr-2 text-blue-600" />
                      {getText('participants')}:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {itemData.participants}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Progress */}
            {progress > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="text-green-500 mr-2" />
                  {getText('progress')}
                </h3>
                
                {/* Overall Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{currentLanguage === 'ta' ? 'முழுமை' : 'Completion'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-4 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>

                {/* Progress Milestones */}
                {itemData?.milestones && itemData.milestones.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {currentLanguage === 'ta' ? 'மைல்கற்கள்' : 'Milestones'}
                    </h4>
                    {itemData.milestones.slice(0, 3).map((milestone, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          milestone.completed 
                            ? 'bg-green-500' 
                            : milestone.inProgress 
                            ? 'bg-yellow-500 animate-pulse' 
                            : 'bg-gray-300'
                        }`} />
                        <span className={`text-sm ${
                          milestone.completed 
                            ? 'text-green-700 line-through' 
                            : milestone.inProgress 
                            ? 'text-yellow-700 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {milestone.title?.[currentLanguage] || milestone.title || milestone}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Progress Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {itemData?.completedTasks || Math.floor(progress / 10)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {currentLanguage === 'ta' ? 'முடிந்த பணிகள்' : 'Tasks Done'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {itemData?.totalTasks || Math.floor(100 / 10)}
                    </div>
                    <div className="text-xs text-green-600">
                      {currentLanguage === 'ta' ? 'மொத்த பணிகள்' : 'Total Tasks'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Share & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaShare className="text-blue-500 mr-2" />
                {getText('shareSupport')}
              </h3>
              
              {/* Social Media Share Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out this project: ${itemData?.title || 'TLS Project'}`);
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                  }}
                  className="bg-blue-400 text-white py-2 px-3 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center text-sm"
                >
                  <FaTwitter className="mr-2" />
                  Twitter
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  }}
                  className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                >
                  <FaFacebook className="mr-2" />
                  Facebook
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out this project: ${itemData?.title || 'TLS Project'}`);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                  }}
                  className="bg-blue-700 text-white py-2 px-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center text-sm"
                >
                  <FaLinkedin className="mr-2" />
                  LinkedIn
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out this project: ${itemData?.title || 'TLS Project'}`);
                    window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
                  }}
                  className="bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
                >
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </button>
              </div>

              {/* General Share and Copy Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaShare className="mr-2" />
                  {getText('shareProject')}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  {getText('copyLink')}
                </button>
              </div>

              {/* Support Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  {currentLanguage === 'ta' ? 'ஆதரவு' : 'Support'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center text-sm">
                    <FaHeart className="mr-1" />
                    {currentLanguage === 'ta' ? 'விரும்பு' : 'Like'}
                  </button>
                  <button className="bg-yellow-50 text-yellow-600 py-2 px-3 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center text-sm">
                    <FaStar className="mr-1" />
                    {currentLanguage === 'ta' ? 'புக்மார்க்' : 'Bookmark'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Recruitment Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <RecruitmentSection 
                entityId={itemData?._id || itemData?.id}
                entityType={itemData?.type || 'project'}
                language={currentLanguage}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <GalleryModal />

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <div className="relative max-w-7xl max-h-full flex items-center justify-center">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <FaTimes size={24} />
              </button>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                  >
                    <FaChevronRight size={24} />
                  </button>
                </>
              )}
              
              <motion.img
                key={modalImageIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                src={getImageUrl(images[modalImageIndex]?.file_path || images[modalImageIndex]?.url)}
                alt={`${title} - Image ${modalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 rounded-lg px-4 py-2">
                <p className="text-sm opacity-90">{modalImageIndex + 1} of {images.length}</p>
                {images[modalImageIndex]?.description && (
                  <p className="text-sm mt-1">{images[modalImageIndex].description}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Detail;