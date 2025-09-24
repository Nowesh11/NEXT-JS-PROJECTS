import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Head from 'next/head';
import ChatModals from '../../../components/admin/ChatModals';

export default function ChatManagement() {
  const { language } = useLanguage();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'delete', 'export'
  const [modalChat, setModalChat] = useState(null);
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    unreadMessages: 0,
    pendingChats: 0
  });
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);

  // Bilingual text helper
  const getText = (key) => {
    const texts = {
      // Page titles and headers
      'chat.management': {
        en: 'Chat Management',
        ta: 'அரட்டை மேலாண்மை'
      },
      'chat.export.csv': {
        en: 'Export CSV',
        ta: 'CSV ஏற்றுமதி'
      },
      'chat.refresh': {
        en: 'Refresh',
        ta: 'புதுப்பிக்கவும்'
      },
      
      // Statistics
      'chat.stats.total': {
        en: 'Total Chats',
        ta: 'மொத்த அரட்டைகள்'
      },
      'chat.stats.active': {
        en: 'Active Chats',
        ta: 'செயலில் உள்ள அரட்டைகள்'
      },
      'chat.stats.unread': {
        en: 'Unread Messages',
        ta: 'படிக்காத செய்திகள்'
      },
      'chat.stats.pending': {
        en: 'Pending Response',
        ta: 'பதில் நிலுவையில்'
      },
      
      // Chat interface
      'chat.conversations': {
        en: 'Conversations',
        ta: 'உரையாடல்கள்'
      },
      'chat.search.placeholder': {
        en: 'Search chats...',
        ta: 'அரட்டைகளைத் தேடுங்கள்...'
      },
      'chat.status.all': {
        en: 'All Status',
        ta: 'அனைத்து நிலை'
      },
      'chat.status.active': {
        en: 'Active',
        ta: 'செயலில்'
      },
      'chat.status.pending': {
        en: 'Pending',
        ta: 'நிலுவையில்'
      },
      'chat.status.resolved': {
        en: 'Resolved',
        ta: 'தீர்க்கப்பட்டது'
      },
      'chat.status.closed': {
        en: 'Closed',
        ta: 'மூடப்பட்டது'
      },
      
      // Messages
      'chat.select.conversation': {
        en: 'Select a conversation to start chatting',
        ta: 'அரட்டையைத் தொடங்க ஒரு உரையாடலைத் தேர்ந்தெடுக்கவும்'
      },
      'chat.message.placeholder': {
        en: 'Type your message...',
        ta: 'உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...'
      },
      'chat.update.status': {
        en: 'Update',
        ta: 'புதுப்பிக்கவும்'
      },
      'chat.no.chats': {
        en: 'No active chats',
        ta: 'செயலில் உள்ள அரட்டைகள் இல்லை'
      },
      'chat.user.unknown': {
        en: 'Unknown User',
        ta: 'அறியப்படாத பயனர்'
      },
      'chat.no.email': {
        en: 'No email',
        ta: 'மின்னஞ்சல் இல்லை'
      },
      'chat.no.messages': {
        en: 'No messages yet',
        ta: 'இன்னும் செய்திகள் இல்லை'
      },
      'chat.send.success': {
        en: 'Message sent successfully',
        ta: 'செய்தி வெற்றிகரமாக அனுப்பப்பட்டது'
      },
      'chat.send.error': {
        en: 'Failed to send message',
        ta: 'செய்தி அனுப்புவதில் தோல்வி'
      },
      'chat.status.updated': {
        en: 'Chat status updated successfully',
        ta: 'அரட்டை நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது'
      },
      'chat.export.success': {
        en: 'Chat data exported successfully',
        ta: 'அரட்டை தரவு வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது'
      }
    };
    
    return texts[key] ? texts[key][language] || texts[key].en : key;
  };

  // Load chats
  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      const data = await response.json();
      const formattedChats = data.chats.map(chat => {
        // Find the user who is not the admin
        const userParticipant = chat.participants.find(p => p.role !== 'admin');
        const user = userParticipant ? userParticipant.user : null;
        
        return {
          _id: chat._id,
          user: {
            name: user ? `${user.firstName} ${user.lastName}` : getText('chat.user.unknown'),
            email: user ? user.email : getText('chat.no.email'),
            _id: user ? user._id : null
          },
          status: chat.status || 'active',
          unreadCount: chat.unreadCount || 0,
          lastMessage: chat.lastMessage || { content: '', sentAt: chat.updatedAt },
          updatedAt: chat.updatedAt
        };
      });
      
      // Sort by most recent activity
      formattedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setChats(formattedChats);
      updateStats(formattedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (chatList) => {
    const totalChats = chatList.length;
    const activeChats = chatList.filter(chat => chat.status === 'active').length;
    const pendingChats = chatList.filter(chat => chat.status === 'pending').length;
    const unreadMessages = chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
    
    setStats({
      totalChats,
      activeChats,
      unreadMessages,
      pendingChats
    });
  };

  // Load chat messages
  const loadChatMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      
      const data = await response.json();
      
      // Format messages for display
      const formattedMessages = data.messages.map(msg => ({
        _id: msg._id,
        content: msg.content,
        senderRole: msg.isAdminMessage ? 'admin' : 'user',
        sentAt: msg.createdAt
      }));
      
      setMessages(formattedMessages);
      scrollToBottom();
      
      // Mark messages as read if there are unread messages
      if (data.chat.unreadCount > 0) {
        await fetch(`/api/chat/${chatId}/read`, {
          method: 'POST'
        });
        
        // Update the unread count in the chats list
        setChats(prev => prev.map(chat => 
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        ));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      // Optimistically add message to UI
      const tempMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        senderRole: 'admin',
        sentAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      scrollToBottom();
      
      // Send message to API
      const response = await fetch(`/api/chat/${selectedChat._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          type: 'text'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Refresh messages to get the actual message with server ID
      loadChatMessages(selectedChat._id);
      
      // Refresh chat list to update last message
      loadChats();
      
      // Show success notification
      showNotification(getText('chat.send.success'), 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification(getText('chat.send.error'), 'error');
    }
  };

  // Update chat status
  const updateChatStatus = async (chatId, newStatus) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update chat status');
      }
      
      // Update local state
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, status: newStatus } : chat
      ));
      
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(prev => ({ ...prev, status: newStatus }));
      }
      
      showNotification(getText('chat.status.updated'), 'success');
    } catch (error) {
      console.error('Error updating chat status:', error);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const csvData = chats.map(chat => ({
        'Chat ID': chat._id,
        'User Name': chat.user?.name || getText('chat.user.unknown'),
        'User Email': chat.user?.email || getText('chat.no.email'),
        'Status': chat.status,
        'Unread Count': chat.unreadCount || 0,
        'Last Message': chat.lastMessage?.content || getText('chat.no.messages'),
        'Updated At': new Date(chat.updatedAt).toLocaleString()
      }));
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showNotification(getText('chat.export.success'), 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Modal handlers
  const handleViewChat = (chat) => {
    setModalChat(chat);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditChat = (chat) => {
    setModalChat(chat);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteChat = (chat) => {
    setModalChat(chat);
    setModalType('delete');
    setShowModal(true);
  };

  const handleExportChat = (chat) => {
    setModalChat(chat);
    setModalType('export');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalChat(null);
  };

  const handleModalSave = (chatId, formData) => {
    // Update chat in the chats array
    setChats(prevChats => 
      prevChats.map(chat => 
        chat._id === chatId 
          ? { ...chat, ...formData, updatedAt: new Date().toISOString() }
          : chat
      )
    );
    console.log('Chat updated:', chatId, formData);
  };

  const handleModalDelete = (chatId) => {
    // Remove chat from the chats array
    setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
    // Clear selected chat if it was deleted
    if (selectedChat && selectedChat._id === chatId) {
      setSelectedChat(null);
      setMessages([]);
    }
    console.log('Chat deleted:', chatId);
  };

  const handleModalExport = (chatId, format, dateRange) => {
    const chat = chats.find(c => c._id === chatId);
    if (!chat) return;

    // Filter messages based on date range
    let filteredMessages = messages;
    const now = new Date();
    
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredMessages = messages.filter(msg => new Date(msg.sentAt) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredMessages = messages.filter(msg => new Date(msg.sentAt) >= monthAgo);
    }

    if (format === 'csv') {
      const csvData = filteredMessages.map(msg => ({
        'Timestamp': new Date(msg.sentAt).toLocaleString(),
        'Sender': msg.senderRole,
        'Message': msg.content,
        'Type': 'text'
      }));

      const csvContent = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `chat_${chat.user?.name || 'unknown'}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const jsonData = {
        chat: {
          id: chat._id,
          customerName: chat.user?.name || getText('chat.user.unknown'),
          status: chat.status,
          createdAt: chat.updatedAt
        },
        messages: filteredMessages,
        exportedAt: new Date().toISOString(),
        dateRange: dateRange
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `chat_${chat.user?.name || 'unknown'}_${dateRange}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    console.log('Chat exported:', chatId, format, dateRange);
  };

  // Utility functions
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const showNotification = (message, type) => {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Filter chats
  const filteredChats = chats.filter(chat => {
    const matchesSearch = !searchTerm || 
      chat.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || chat.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle chat selection
  const selectChat = (chat) => {
    setSelectedChat(chat);
    loadChatMessages(chat._id);
  };

  // Handle Enter key in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Initialize component
  useEffect(() => {
    loadChats();
    
    // Set up polling for real-time updates
    pollInterval.current = setInterval(() => {
      loadChats();
    }, 30000); // Poll every 30 seconds
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>{getText('chat.management')} - Admin Dashboard</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-comments text-blue-600"></i>
            {getText('chat.management')}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              {getText('chat.export.csv')}
            </button>
            <button
              onClick={loadChats}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              {getText('chat.refresh')}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getText('chat.stats.total')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalChats}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-comments text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getText('chat.stats.active')}</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeChats}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-comment-dots text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getText('chat.stats.unread')}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.unreadMessages}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-envelope text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getText('chat.stats.pending')}</p>
                <p className="text-3xl font-bold text-red-600">{stats.pendingChats}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{getText('chat.conversations')}</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={getText('chat.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{getText('chat.status.all')}</option>
                  <option value="active">{getText('chat.status.active')}</option>
                  <option value="pending">{getText('chat.status.pending')}</option>
                  <option value="resolved">{getText('chat.status.resolved')}</option>
                  <option value="closed">{getText('chat.status.closed')}</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-120px)]">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Loading chats...</p>
                </div>
              ) : filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => selectChat(chat)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {chat.user?.name || getText('chat.user.unknown')}
                          </h4>
                          <div className="flex items-center gap-2">
                            {chat.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {chat.unreadCount}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(chat.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.user?.email || getText('chat.no.email')}
                        </p>
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {chat.lastMessage.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            chat.status === 'active' ? 'bg-green-100 text-green-800' :
                            chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            chat.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getText(`chat.status.${chat.status}`)}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewChat(chat);
                              }}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditChat(chat);
                              }}
                              className="text-green-500 hover:text-green-700 text-xs"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportChat(chat);
                              }}
                              className="text-purple-500 hover:text-purple-700 text-xs"
                              title="Export"
                            >
                              <i className="fas fa-download"></i>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-comments text-3xl mb-2 opacity-30"></i>
                  <p>{getText('chat.no.chats')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-600"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedChat.user?.name || getText('chat.user.unknown')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.user?.email || getText('chat.no.email')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedChat.status}
                      onChange={(e) => updateChatStatus(selectedChat._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">{getText('chat.status.active')}</option>
                      <option value="pending">{getText('chat.status.pending')}</option>
                      <option value="resolved">{getText('chat.status.resolved')}</option>
                      <option value="closed">{getText('chat.status.closed')}</option>
                    </select>
                    <button
                      onClick={() => updateChatStatus(selectedChat._id, selectedChat.status)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      {getText('chat.update.status')}
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => {
                    const isAdmin = message.senderRole === 'admin';
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isAdmin 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-900 shadow-sm border'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-xs mt-1 ${
                            isAdmin ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.sentAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={getText('chat.message.placeholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-comments text-6xl mb-4 opacity-30"></i>
                  <p className="text-lg">{getText('chat.select.conversation')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Modals */}
        <ChatModals
          show={showModal}
          type={modalType}
          chat={modalChat}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onExport={handleModalExport}
          getText={getText}
        />
      </div>
    </>
  );
}