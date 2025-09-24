'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChevronDownIcon,
  FaceSmileIcon,
  PaperClipIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  Bars3Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Contact = ({ getText, language }) => {
  const { data: session } = useSession();
  const messagesEndRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [adminList, setAdminList] = useState([]);
  
  // Fetch admin list when component mounts
  useEffect(() => {
    if (session) {
      fetchAdminList();
      checkExistingChat();
    }
  }, [session]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchAdminList = async () => {
    try {
      const response = await axios.get('/api/admin/users?role=admin');
      if (response.data && response.data.users) {
        setAdminList(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching admin list:', error);
    }
  };
  
  const checkExistingChat = async () => {
    if (!session) return;
    
    try {
      setChatLoading(true);
      const response = await axios.get('/api/chat');
      
      if (response.data && response.data.chats && response.data.chats.length > 0) {
        // Find the first admin chat
        const adminChat = response.data.chats.find(chat => 
          chat.participant && chat.participant.role === 'admin'
        );
        
        if (adminChat) {
          setCurrentChat(adminChat);
          loadChatMessages(adminChat._id);
        }
      }
    } catch (error) {
      console.error('Error checking existing chats:', error);
    } finally {
      setChatLoading(false);
    }
  };
  
  const loadChatMessages = async (chatId) => {
    try {
      setChatLoading(true);
      const response = await axios.get(`/api/chat/${chatId}`);
      
      if (response.data && response.data.chat && response.data.chat.messages) {
        setChatMessages(response.data.chat.messages);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setChatLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!chatInput.trim() || !session) return;
    
    try {
      setChatLoading(true);
      
      let recipientId;
      let chatId;
      
      if (currentChat) {
        // Send message to existing chat
        chatId = currentChat._id;
        
        const response = await axios.post(`/api/chat/${chatId}`, {
          message: chatInput.trim(),
          type: 'text'
        });
        
        if (response.data && response.data.message) {
          // Refresh messages
          loadChatMessages(chatId);
        }
      } else {
        // Start new chat with first admin
        if (adminList.length === 0) {
          throw new Error('No administrators available');
        }
        
        recipientId = adminList[0]._id;
        
        const response = await axios.post('/api/chat', {
          recipientId,
          message: chatInput.trim(),
          type: 'text'
        });
        
        if (response.data && response.data.chat) {
          setCurrentChat({
            _id: response.data.chat._id,
            chatId: response.data.chat.chatId
          });
          
          // Add the sent message to the chat
          setChatMessages(prev => [...prev, response.data.chat.message]);
        }
      }
      
      // Clear input
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const contactInfo = [
    {
      id: 'address',
      icon: MapPinIcon,
      title: getText('contact.address.title', 'Visit Us'),
      content: [
        'Tamil Language Society',
        '123 Tamil Heritage Street',
        'Chennai, Tamil Nadu 600001',
        'India'
      ],
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'phone',
      icon: PhoneIcon,
      title: getText('contact.phone.title', 'Call Us'),
      content: [
        'Phone: +91 44 2345 6789',
        'Mobile: +91 98765 43210',
        'Toll Free: 1800 123 4567'
      ],
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'email',
      icon: EnvelopeIcon,
      title: getText('contact.email.title', 'Email Us'),
      content: [
        'info@tamillanguagesociety.org',
        'support@tamillanguagesociety.org',
        'media@tamillanguagesociety.org'
      ],
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'hours',
      icon: ClockIcon,
      title: getText('contact.hours.title', 'Office Hours'),
      content: [
        'Monday - Friday: 9:00 AM - 6:00 PM',
        'Saturday: 10:00 AM - 4:00 PM',
        'Sunday: Closed'
      ],
      gradient: 'from-purple-500 to-pink-600'
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

  const faqItems = [
    {
      id: 1,
      question: getText('contact.faq.1.question', 'How can I join the Tamil Language Society?'),
      answer: getText('contact.faq.1.answer', 'You can join our society by signing up on our website or visiting our office. Membership is open to all Tamil language enthusiasts regardless of their proficiency level.')
    },
    {
      id: 2,
      question: getText('contact.faq.2.question', 'Do you offer Tamil language classes?'),
      answer: getText('contact.faq.2.answer', 'Yes, we offer various Tamil language classes for different skill levels, from beginners to advanced speakers. We also have specialized courses for children and adults.')
    },
    {
      id: 3,
      question: getText('contact.faq.3.question', 'How can I contribute to your projects?'),
      answer: getText('contact.faq.3.answer', 'There are many ways to contribute: volunteering for events, donating to our projects, sharing your expertise, or helping with translations and content creation.')
    },
    {
      id: 4,
      question: getText('contact.faq.4.question', 'What services do you provide?'),
      answer: getText('contact.faq.4.answer', 'We provide Tamil language education, cultural events, digital resources, translation services, and community support for Tamil speakers worldwide.')
    }
  ];

  const emojis = ['😊', '👍', '❤️', '🙏', '👋', '😄', '🎉', '✨', '🌟', '💫'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
      
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    }
  };

  const startLiveChat = async () => {
    setShowChat(true);
    
    try {
      // Check if user has existing support chat
      const response = await fetch('/api/chat/support', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.chat.messages.map(msg => ({
          id: msg._id,
          sender: msg.sender.role === 'admin' ? 'admin' : 'user',
          text: msg.content,
          timestamp: new Date(msg.createdAt)
        }));
        setChatMessages(messages);
      } else {
        // No existing chat, start with welcome message
        setChatMessages([
          {
            id: 1,
            sender: 'admin',
            text: 'Welcome! How can I help you today?',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      setChatMessages([
        {
          id: 1,
          sender: 'admin',
          text: 'Welcome! How can I help you today?',
          timestamp: new Date()
        }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !session) return;
    
    try {
      setChatLoading(true);
      
      let recipientId;
      let chatId;
      
      if (currentChat) {
        // Send message to existing chat
        chatId = currentChat._id;
        
        const response = await axios.post(`/api/chat/${chatId}`, {
          message: chatInput.trim(),
          type: 'text'
        });
        
        if (response.data && response.data.message) {
          // Refresh messages
          loadChatMessages(chatId);
        }
      } else {
        // Start new chat with first admin
        if (adminList.length === 0) {
          throw new Error('No administrators available');
        }
        
        recipientId = adminList[0]._id;
        
        const response = await axios.post('/api/chat', {
          recipientId,
          message: chatInput.trim(),
          type: 'text'
        });
        
        if (response.data && response.data.chat) {
          setCurrentChat({
            _id: response.data.chat._id,
            chatId: response.data.chat.chatId
          });
          
          // Add the sent message to the chat
          setChatMessages(prev => [...prev, response.data.chat.message]);
        }
      }
      
      // Clear input
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const insertEmoji = (emoji) => {
    setChatInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const openMaps = () => {
    window.open('https://maps.google.com/maps?q=Chennai,Tamil+Nadu,India', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
        >
          {showChat ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          )}
        </button>

        {/* Chat Window */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
            >
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <h3 className="font-medium">
                    {getText('contact.chat.title', 'Chat with Admin')}
                  </h3>
                </div>
                <button onClick={() => setShowChat(false)}>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-50">
                {!session ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <UserIcon className="h-12 w-12 mb-2" />
                    <p>{getText('contact.chat.login_required', 'Please login to start a chat')}</p>
                  </div>
                ) : chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mb-2" />
                    <p>{getText('contact.chat.start', 'Start a conversation with our team')}</p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-4 flex ${
                          msg.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender._id === session?.user?.id
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              {session && (
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={getText('contact.chat.type_message', 'Type a message...')}
                      className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className={`p-2 rounded-full ${
                        !chatInput.trim() || chatLoading
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-900/30 dark:to-purple-900/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-20" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
              {getText('contact.hero.title', 'Contact Us')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {getText('contact.hero.subtitle', "We'd love to hear from you. Send us a message and we'll respond as soon as possible.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <motion.div
                  key={info.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${info.gradient} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                    {info.title}
                  </h3>
                  <div className="space-y-2">
                    {info.content.map((line, idx) => (
                      <p key={idx} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Chat Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-6">
              {getText('contact.chat.title', 'Connect with Us')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              {getText('contact.chat.description', 'Start a live chat with our admin team for immediate assistance and support.')}
            </p>
            
            <motion.button
              onClick={startLiveChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              {getText('contact.chat.button', 'Start Live Chat with Admin')}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
              {getText('contact.map.title', 'Find Us')}
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-slate-200 dark:bg-slate-700 h-96 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center"
          >
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                {getText('contact.map.interactive', 'Interactive Map')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {getText('contact.map.location', 'Chennai, Tamil Nadu, India')}
              </p>
              <button
                onClick={openMaps}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                <MapPinIcon className="w-5 h-5" />
                {getText('contact.map.button', 'Open in Maps')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
              {getText('contact.faq.title', 'Frequently Asked Questions')}
            </h2>
          </motion.div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/20 dark:border-slate-700/50"
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-300"
                >
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                      openFaq === item.id ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowChat(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden"
            >
              {/* Chat Header */}
              <div className="flex-1 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {getText('contact.chat.header', 'Live Chat with Admin')}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {getText('contact.chat.status', 'Online')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {typingIndicator && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                  {showEmojiPicker && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => insertEmoji(emoji)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-end gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                      >
                        <FaceSmileIcon className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder={getText('contact.chat.placeholder', 'Type your message...')}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        rows={1}
                      />
                    </div>
                    
                    <button
                      onClick={sendMessage}
                      disabled={!chatInput.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;