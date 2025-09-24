import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function Team() {
  const [language, setLanguage] = useState('english');
  const [hoveredMember, setHoveredMember] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedMember, setSelectedMember] = useState(null);
  const { announceToScreenReader } = useAccessibility();

  const teamMembers = [
    {
      id: 1,
      name: {
        english: 'Dr. Rajesh Kumar',
        tamil: 'டாக்டர் ராஜேஷ் குமார்'
      },
      position: {
        english: 'Founder & CEO',
        tamil: 'நிறுவனர் மற்றும் தலைமை நிர்வாக அதிகாரி'
      },
      bio: {
        english: 'Leading Tamil literature scholar with 20+ years of experience in publishing and education.',
        tamil: 'வெளியீடு மற்றும் கல்வியில் 20+ ஆண்டுகள் அனுபவம் கொண்ட முன்னணி தமிழ் இலக்கிய அறிஞர்.'
      },
      image: '/images/team/rajesh-kumar.jpg',
      email: 'rajesh@tamiliterature.com',
      phone: '+91 98765 43210',
      linkedin: 'https://linkedin.com/in/rajeshkumar',
      twitter: 'https://twitter.com/rajeshkumar',
      specialties: {
        english: ['Tamil Literature', 'Publishing', 'Education'],
        tamil: ['தமிழ் இலக்கியம்', 'வெளியீடு', 'கல்வி']
      }
    },
    {
      id: 2,
      name: {
        english: 'Priya Selvam',
        tamil: 'பிரியா செல்வம்'
      },
      position: {
        english: 'Head of Content',
        tamil: 'உள்ளடக்கத் தலைவர்'
      },
      bio: {
        english: 'Expert in Tamil content creation and digital publishing with a passion for preserving Tamil heritage.',
        tamil: 'தமிழ் பாரம்பரியத்தைப் பாதுகாக்கும் ஆர்வத்துடன் தமிழ் உள்ளடக்க உருவாக்கம் மற்றும் டிஜிட்டல் வெளியீட்டில் நிபுணர்.'
      },
      image: '/images/team/priya-selvam.jpg',
      email: 'priya@tamiliterature.com',
      phone: '+91 98765 43211',
      linkedin: 'https://linkedin.com/in/priyaselvam',
      instagram: 'https://instagram.com/priyaselvam',
      specialties: {
        english: ['Content Strategy', 'Digital Publishing', 'Tamil Heritage'],
        tamil: ['உள்ளடக்க உத்தி', 'டிஜிட்டல் வெளியீடு', 'தமிழ் பாரம்பரியம்']
      }
    },
    {
      id: 3,
      name: {
        english: 'Arjun Murugan',
        tamil: 'அர்ஜுன் முருகன்'
      },
      position: {
        english: 'Technology Director',
        tamil: 'தொழில்நுட்ப இயக்குநர்'
      },
      bio: {
        english: 'Full-stack developer specializing in modern web technologies and Tamil language processing.',
        tamil: 'நவீன வலை தொழில்நுட்பங்கள் மற்றும் தமிழ் மொழி செயலாக்கத்தில் நிபுணத்துவம் பெற்ற முழு-அடுக்கு டெவலப்பர்.'
      },
      image: '/images/team/arjun-murugan.jpg',
      email: 'arjun@tamiliterature.com',
      phone: '+91 98765 43212',
      linkedin: 'https://linkedin.com/in/arjunmurugan',
      github: 'https://github.com/arjunmurugan',
      specialties: {
        english: ['Web Development', 'Tamil NLP', 'System Architecture'],
        tamil: ['வலை மேம்பாடு', 'தமிழ் NLP', 'கணினி கட்டமைப்பு']
      }
    },
    {
      id: 4,
      name: {
        english: 'Meera Krishnan',
        tamil: 'மீரா கிருஷ்ணன்'
      },
      position: {
        english: 'Marketing Manager',
        tamil: 'சந்தைப்படுத்தல் மேலாளர்'
      },
      bio: {
        english: 'Digital marketing expert focused on promoting Tamil literature and culture through innovative campaigns.',
        tamil: 'புதுமையான பிரச்சாரங்கள் மூலம் தமிழ் இலக்கியம் மற்றும் கலாச்சாரத்தை மேம்படுத்துவதில் கவனம் செலுத்தும் டிஜிட்டல் மார்க்கெட்டிங் நிபுணர்.'
      },
      image: '/images/team/meera-krishnan.jpg',
      email: 'meera@tamiliterature.com',
      phone: '+91 98765 43213',
      linkedin: 'https://linkedin.com/in/meerakrishnan',
      twitter: 'https://twitter.com/meerakrishnan',
      specialties: {
        english: ['Digital Marketing', 'Brand Strategy', 'Cultural Promotion'],
        tamil: ['டிஜிட்டல் மார்க்கெட்டிங்', 'பிராண்ட் உத்தி', 'கலாச்சார மேம்பாடு']
      }
    },
    {
      id: 5,
      name: {
        english: 'Karthik Raman',
        tamil: 'கார்த்திக் ராமன்'
      },
      position: {
        english: 'Operations Manager',
        tamil: 'செயல்பாட்டு மேலாளர்'
      },
      bio: {
        english: 'Operations specialist ensuring smooth delivery of books and maintaining quality standards.',
        tamil: 'புத்தகங்களின் மென்மையான விநியோகத்தை உறுதி செய்து தரத் தரங்களைப் பராமரிக்கும் செயல்பாட்டு நிபுணர்.'
      },
      image: '/images/team/karthik-raman.jpg',
      email: 'karthik@tamiliterature.com',
      phone: '+91 98765 43214',
      linkedin: 'https://linkedin.com/in/karthikraman',
      specialties: {
        english: ['Operations Management', 'Quality Control', 'Logistics'],
        tamil: ['செயல்பாட்டு மேலாண்மை', 'தர கட்டுப்பாடு', 'தளவாடங்கள்']
      }
    },
    {
      id: 6,
      name: {
        english: 'Lakshmi Devi',
        tamil: 'லக்ஷ்மி தேவி'
      },
      position: {
        english: 'Customer Relations',
        tamil: 'வாடிக்கையாளர் உறவுகள்'
      },
      bio: {
        english: 'Dedicated to providing excellent customer service and building lasting relationships with our readers.',
        tamil: 'சிறந்த வாடிக்கையாளர் சேவையை வழங்குவதற்கும் எங்கள் வாசகர்களுடன் நீடித்த உறவுகளை உருவாக்குவதற்கும் அர்ப்பணிப்புடன்.'
      },
      image: '/images/team/lakshmi-devi.jpg',
      email: 'lakshmi@tamiliterature.com',
      phone: '+91 98765 43215',
      linkedin: 'https://linkedin.com/in/lakshmidevi',
      specialties: {
        english: ['Customer Service', 'Relationship Management', 'Communication'],
        tamil: ['வாடிக்கையாளர் சேவை', 'உறவு மேலாண்மை', 'தொடர்பு']
      }
    }
  ];

  const toggleLanguage = () => {
    const newLanguage = language === 'english' ? 'tamil' : 'english';
    setLanguage(newLanguage);
    announceToScreenReader(`Language switched to ${newLanguage === 'english' ? 'English' : 'Tamil'}`);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    announceToScreenReader(`View mode changed to ${newMode}`);
  };

  const getGradientColors = (index) => {
    const gradients = [
      'from-orange-400 to-red-500',
      'from-blue-400 to-purple-500',
      'from-green-400 to-teal-500',
      'from-pink-400 to-rose-500',
      'from-indigo-400 to-blue-500',
      'from-yellow-400 to-orange-500'
    ];
    return gradients[index % gradients.length];
  };

  const handleContactClick = (member, contactType) => {
    switch (contactType) {
      case 'email':
        window.open(`mailto:${member.email}`);
        break;
      case 'phone':
        window.open(`tel:${member.phone}`);
        break;
      case 'linkedin':
        window.open(member.linkedin, '_blank');
        break;
      case 'twitter':
        window.open(member.twitter, '_blank');
        break;
      case 'instagram':
        window.open(member.instagram, '_blank');
        break;
      case 'github':
        window.open(member.github, '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-200 rounded-full opacity-30"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <motion.button
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-md shadow-lg rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-all border border-gray-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${language === 'english' ? 'Tamil' : 'English'}`}
        >
          {language === 'english' ? 'தமிழ்' : 'English'}
        </motion.button>
        
        <motion.button
          onClick={toggleViewMode}
          className="bg-white/80 backdrop-blur-md shadow-lg rounded-full p-2 text-gray-700 hover:bg-white transition-all border border-gray-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        >
          <i className={`fas ${viewMode === 'grid' ? 'fa-list' : 'fa-th-large'} text-sm`}></i>
        </motion.button>
      </div>

      {/* Hero Section */}
      <motion.div 
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {language === 'english' ? 'Our Team' : 'எங்கள் குழு'}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {language === 'english'
              ? 'Meet the passionate individuals dedicated to preserving and promoting Tamil literature'
              : 'தமிழ் இலக்கியத்தைப் பாதுகாத்து மேம்படுத்துவதில் அர்ப்பணிப்புடன் செயல்படும் ஆர்வமுள்ள நபர்களைச் சந்திக்கவும்'}
          </motion.p>
        </div>
      </motion.div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div 
          className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}
          layout
        >
          <AnimatePresence mode="wait">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className={`group relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/20 ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: viewMode === 'grid' ? 1.05 : 1.02,
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                onMouseEnter={() => {
                  setHoveredMember(member.id);
                  announceToScreenReader(`Viewing ${member.name[language]}, ${member.position[language]}`);
                }}
                onMouseLeave={() => setHoveredMember(null)}
                onClick={() => setSelectedMember(member)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${member.name[language]}`}
              >
                {/* Member Image */}
                <motion.div 
                  className={`relative bg-gradient-to-br ${getGradientColors(index)} ${
                    viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-64'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                        animate={{
                          x: [0, 30, 0],
                          y: [0, -30, 0],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                      />
                    ))}
                  </div>

                  {member.image || (member.profilePicture && member.profilePicture.url) ? (
                    <motion.img
                      src={member.image || (member.profilePicture ? member.profilePicture.url : '')}
                      alt={member.name[language] || (member.name ? member.name : '')}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <motion.div 
                        className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <i className="fas fa-user text-4xl text-white"></i>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Glassmorphism Overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredMember === member.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Contact Overlay */}
                  <AnimatePresence>
                    {hoveredMember === member.id && (
                      <motion.div 
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="flex space-x-4"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {/* Email */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactClick(member, 'email');
                            }}
                            className="bg-white/90 backdrop-blur-md text-gray-800 p-3 rounded-full hover:bg-white transition-all border border-white/20"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            title={`Email: ${member.email}`}
                            aria-label={`Send email to ${member.name[language]}`}
                          >
                            <i className="fas fa-envelope text-lg"></i>
                          </motion.button>
                          
                          {/* Phone */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactClick(member, 'phone');
                            }}
                            className="bg-white/90 backdrop-blur-md text-gray-800 p-3 rounded-full hover:bg-white transition-all border border-white/20"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            title={`Phone: ${member.phone}`}
                            aria-label={`Call ${member.name[language]}`}
                          >
                            <i className="fas fa-phone text-lg"></i>
                          </motion.button>
                          
                          {/* LinkedIn */}
                          {member.linkedin && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(member, 'linkedin');
                              }}
                              className="bg-white/90 backdrop-blur-md text-blue-600 p-3 rounded-full hover:bg-white transition-all border border-white/20"
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              title="LinkedIn Profile"
                              aria-label={`View ${member.name[language]}'s LinkedIn profile`}
                            >
                              <i className="fab fa-linkedin text-lg"></i>
                            </motion.button>
                          )}
                          
                          {/* Twitter */}
                          {member.twitter && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(member, 'twitter');
                              }}
                              className="bg-white/90 backdrop-blur-md text-blue-400 p-3 rounded-full hover:bg-white transition-all border border-white/20"
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              title="Twitter Profile"
                              aria-label={`View ${member.name[language]}'s Twitter profile`}
                            >
                              <i className="fab fa-twitter text-lg"></i>
                            </motion.button>
                          )}
                          
                          {/* Instagram */}
                          {member.instagram && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(member, 'instagram');
                              }}
                              className="bg-white/90 backdrop-blur-md text-pink-600 p-3 rounded-full hover:bg-white transition-all border border-white/20"
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              title="Instagram Profile"
                              aria-label={`View ${member.name[language]}'s Instagram profile`}
                            >
                              <i className="fab fa-instagram text-lg"></i>
                            </motion.button>
                          )}
                          
                          {/* GitHub */}
                          {member.github && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(member, 'github');
                              }}
                              className="bg-white/90 backdrop-blur-md text-gray-800 p-3 rounded-full hover:bg-white transition-all border border-white/20"
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              title="GitHub Profile"
                              aria-label={`View ${member.name[language]}'s GitHub profile`}
                            >
                              <i className="fab fa-github text-lg"></i>
                            </motion.button>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Member Info */}
                <motion.div 
                  className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    {member.name && typeof member.name === 'object' && member.name[language] ? 
                      member.name[language] : 
                      (member.name || '')}
                  </motion.h3>
                  <motion.p 
                    className="text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text font-medium mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {member.position && typeof member.position === 'object' && member.position[language] ? 
                      member.position[language] : 
                      (member.position || '')}
                  </motion.p>
                  <motion.p 
                    className="text-gray-600 text-sm mb-4 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {member.bio && typeof member.bio === 'object' && member.bio[language] ? 
                      member.bio[language] : 
                      (member.bio || '')}
                  </motion.p>
                  
                  {/* Specialties */}
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      {language === 'english' ? 'Specialties:' : 'சிறப்புகள்:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties[language].map((specialty, specIndex) => (
                        <motion.span
                          key={specIndex}
                          className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs px-3 py-1 rounded-full border border-orange-200"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + specIndex * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          {specialty}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Contact Info */}
                  <motion.div 
                    className="border-t border-gray-200 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div 
                      className="flex items-center text-sm text-gray-600 mb-2"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-envelope w-4 mr-2 text-orange-500"></i>
                      <span className="truncate">{member.email}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center text-sm text-gray-600"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-phone w-4 mr-2 text-orange-500"></i>
                      <span>{member.phone}</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Contact CTA Section */}
      <motion.div 
        className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-white/10 rounded-full blur-xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {language === 'english' ? 'Get in Touch' : 'தொடர்பில் இருங்கள்'}
          </motion.h2>
          <motion.p 
            className="text-orange-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {language === 'english'
              ? 'Have questions or want to collaborate? Our team is here to help!'
              : 'கேள்விகள் உள்ளதா அல்லது ஒத்துழைக்க விரும்புகிறீர்களா? எங்கள் குழு உதவ இங்கே உள்ளது!'}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="mailto:info@tamiliterature.com"
              className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center group"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#ea580c"
              }}
              whileTap={{ scale: 0.95 }}
              aria-label={language === 'english' ? 'Send email to Tamil Literature' : 'தமிழ் இலக்கியத்திற்கு மின்னஞ்சல் அனுப்பவும்'}
            >
              <motion.i 
                className="fas fa-envelope mr-3 text-lg"
                whileHover={{ rotate: 10 }}
              ></motion.i>
              {language === 'english' ? 'Send Email' : 'மின்னஞ்சல் அனுப்பவும்'}
            </motion.a>
            <motion.a
              href="tel:+919876543210"
              className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center group backdrop-blur-sm"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.8)"
              }}
              whileTap={{ scale: 0.95 }}
              aria-label={language === 'english' ? 'Call Tamil Literature' : 'தமிழ் இலக்கியத்தை அழைக்கவும்'}
            >
              <motion.i 
                className="fas fa-phone mr-3 text-lg"
                whileHover={{ rotate: 15 }}
              ></motion.i>
              {language === 'english' ? 'Call Us' : 'எங்களை அழைக்கவும்'}
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}