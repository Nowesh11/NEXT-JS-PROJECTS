'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ContactSection = ({ getText, language }) => {
  const [activeTab, setActiveTab] = useState('contact'); // contact, chat, location
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success, error
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: getText('contact.chat.welcome', 'வணக்கம்! How can I help you today?'),
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const contactMethods = [
    {
      id: 'email',
      icon: EnvelopeIcon,
      title: getText('contact.email.title', 'Email Us'),
      value: 'info@tamilsangam.org',
      description: getText('contact.email.desc', 'Send us an email and we\'ll respond within 24 hours'),
      gradient: 'gradient-digital'
    },
    {
      id: 'phone',
      icon: PhoneIcon,
      title: getText('contact.phone.title', 'Call Us'),
      value: '+91 98765 43210',
      description: getText('contact.phone.desc', 'Available Monday to Friday, 9 AM to 6 PM IST'),
      gradient: 'gradient-cultural'
    },
    {
      id: 'location',
      icon: MapPinIcon,
      title: getText('contact.location.title', 'Visit Us'),
      value: getText('contact.location.value', 'Chennai, Tamil Nadu'),
      description: getText('contact.location.desc', 'Come visit our cultural center and library'),
      gradient: 'gradient-tamil'
    },
    {
      id: 'chat',
      icon: ChatBubbleLeftRightIcon,
      title: getText('contact.chat.title', 'Live Chat'),
      value: getText('contact.chat.value', 'Available Now'),
      description: getText('contact.chat.desc', 'Get instant help from our support team'),
      gradient: 'gradient-emerald'
    }
  ];

  const messageTypes = [
    { id: 'general', label: getText('contact.type.general', 'General Inquiry') },
    { id: 'collaboration', label: getText('contact.type.collaboration', 'Collaboration') },
    { id: 'support', label: getText('contact.type.support', 'Technical Support') },
    { id: 'feedback', label: getText('contact.type.feedback', 'Feedback') },
    { id: 'donation', label: getText('contact.type.donation', 'Donation') },
    { id: 'volunteer', label: getText('contact.type.volunteer', 'Volunteer') }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
      
      // Reset status after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 2000);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: getText('contact.chat.response', 'Thank you for your message! Our team will get back to you shortly.'),
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section 
      id="contact" 
      className="relative py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-3" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-tamil-500 to-cultural-500" />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-32 right-16 w-32 h-32 bg-cultural-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-digital-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-tamil-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getText('contact.badge', 'Get in Touch')}
            </span>
          </motion.div>
          
          <h2 
            id="contact-heading"
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            <span className="gradient-emerald bg-clip-text text-transparent">
              {getText('contact.title', 'Connect With Us')}
            </span>
            <br />
            <span className="text-gray-800 dark:text-white">
              {getText('contact.subtitle', 'Let\'s Build Together')}
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {getText(
              'contact.description', 
              'Have questions, ideas, or want to collaborate? We\'d love to hear from you. Reach out through any of our channels and let\'s create something amazing together.'
            )}
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <motion.div
                key={method.id}
                variants={itemVariants}
                className="group"
              >
                <motion.div 
                  className="glass-morphism rounded-3xl p-6 h-full card-hover relative overflow-hidden"
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  onClick={() => method.id === 'chat' && setActiveTab('chat')}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 ${method.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  {/* Icon */}
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </motion.div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {method.title}
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                    {method.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {method.description}
                  </p>
                  
                  {/* Hover Effect */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cultural-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            className="glass-morphism rounded-3xl p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cultural-500 rounded-2xl flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {getText('contact.form.title', 'Send Message')}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getText('contact.form.name', 'Name')} <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      aria-describedby="name-error"
                      className="w-full pl-10 pr-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder={getText('contact.form.name.placeholder', 'Your name')}
                    />
                  </div>
                  {formStatus === 'error' && !formData.name && (
                    <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                      {getText('contact.form.name.required', 'Name is required')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getText('contact.form.email', 'Email')} <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      aria-describedby="email-error"
                      className="w-full pl-10 pr-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder={getText('contact.form.email.placeholder', 'your@email.com')}
                    />
                  </div>
                  {formStatus === 'error' && !formData.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                      {getText('contact.form.email.required', 'Email is required')}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Message Type */}
              <div>
                <label htmlFor="contact-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getText('contact.form.type', 'Message Type')}
                </label>
                <select
                  id="contact-type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  aria-describedby="type-description"
                  className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {messageTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p id="type-description" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getText('contact.form.type.description', 'Select the category that best describes your inquiry')}
                </p>
              </div>
              
              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getText('contact.form.subject', 'Subject')} <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-describedby="subject-error"
                  className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder={getText('contact.form.subject.placeholder', 'What is this about?')}
                />
                {formStatus === 'error' && !formData.subject && (
                  <p id="subject-error" className="text-red-500 text-sm mt-1" role="alert">
                    {getText('contact.form.subject.required', 'Subject is required')}
                  </p>
                )}
              </div>
              
              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getText('contact.form.message', 'Message')} <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    aria-describedby="message-error message-description"
                    rows={5}
                    className="w-full pl-10 pr-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    placeholder={getText('contact.form.message.placeholder', 'Tell us more about your inquiry...')}
                  />
                </div>
                <p id="message-description" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getText('contact.form.message.description', 'Please provide as much detail as possible to help us assist you better')}
                </p>
                {formStatus === 'error' && !formData.message && (
                  <p id="message-error" className="text-red-500 text-sm mt-1" role="alert">
                    {getText('contact.form.message.required', 'Message is required')}
                  </p>
                )}
              </div>
              
              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={formStatus === 'sending'}
                aria-describedby="submit-status"
                aria-live="polite"
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                  formStatus === 'sending'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : formStatus === 'success'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-gradient-to-r from-emerald-500 to-cultural-500 hover:from-emerald-600 hover:to-cultural-600'
                }`}
                whileHover={formStatus === 'idle' ? { scale: 1.02 } : {}}
                whileTap={formStatus === 'idle' ? { scale: 0.98 } : {}}
              >
                <span className="flex items-center justify-center gap-2">
                  {formStatus === 'sending' && (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {formStatus === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                  {formStatus === 'error' && <ExclamationTriangleIcon className="w-5 h-5" />}
                  {formStatus === 'idle' && <PaperAirplaneIcon className="w-5 h-5" />}
                  
                  {formStatus === 'sending' && getText('contact.form.sending', 'Sending...')}
                  {formStatus === 'success' && getText('contact.form.success', 'Message Sent!')}
                  {formStatus === 'error' && getText('contact.form.error', 'Try Again')}
                  {formStatus === 'idle' && getText('contact.form.submit', 'Send Message')}
                </span>
              </motion.button>
            </form>
          </motion.div>
          
          {/* Chat Interface */}
          <motion.div 
            className="glass-morphism rounded-3xl p-8 h-fit"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cultural-500 to-digital-500 rounded-2xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {getText('contact.chat.title', 'Live Chat')}
                </h3>
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  {getText('contact.chat.online', 'Online now')}
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cultural-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white'
                  }`}>
                    <p className="text-sm leading-relaxed font-tamil">{message.message}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.type === 'user' ? 'text-white' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder={getText('contact.chat.placeholder', 'Type your message...')}
                className="flex-1 px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
              />
              <motion.button
                onClick={handleChatSend}
                className="px-4 py-3 bg-gradient-to-r from-cultural-500 to-digital-500 text-white rounded-xl hover:from-cultural-600 hover:to-digital-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Additional Info */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="glass-morphism rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <HeartIcon className="w-8 h-8 text-cultural-500" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {getText('contact.community.title', 'Join Our Community')}
              </h3>
            </div>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {getText(
                'contact.community.description',
                'Be part of our growing community of Tamil language enthusiasts, researchers, and cultural preservationists. Together, we\'re building a digital future for Tamil heritage.'
              )}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                className="glass-button px-6 py-3 rounded-2xl font-medium text-gray-800 dark:text-white group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <GlobeAltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {getText('contact.community.newsletter', 'Newsletter')}
                </span>
              </motion.button>
              
              <motion.button
                className="glass-button px-6 py-3 rounded-2xl font-medium text-gray-800 dark:text-white group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {getText('contact.community.volunteer', 'Volunteer')}
                </span>
              </motion.button>
              
              <motion.button
                className="glass-button px-6 py-3 rounded-2xl font-medium text-gray-800 dark:text-white group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {getText('contact.community.donate', 'Donate')}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;