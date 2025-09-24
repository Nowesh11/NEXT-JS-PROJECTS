import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const ChatManager = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const statuses = [
    { value: 'open', label: 'Open', color: 'bg-green-100 text-green-800', icon: 'fa-circle' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock' },
    { value: 'resolved', label: 'Resolved', color: 'bg-blue-100 text-blue-800', icon: 'fa-check-circle' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: 'fa-times-circle' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadChats();
    startPolling();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = () => {
    // Poll for new messages every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      if (selectedChat) {
        loadMessages(selectedChat._id, false); // Don't show loading for polling
      }
      loadChats(false); // Update chat list
    }, 5000);
  };

  const loadChats = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || data.data || []);
      } else {
        if (showLoading) toast.error('Failed to load chats');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      if (showLoading) toast.error('Error loading chats');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadMessages = async (chatId, showLoading = true) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || data.data || []);
        
        // Mark messages as read
        await markAsRead(chatId);
      } else {
        if (showLoading) toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (showLoading) toast.error('Error loading messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          sender: 'admin'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message || data.data]);
        loadChats(false); // Update chat list to reflect new message
      } else {
        toast.error('Failed to send message');
        setNewMessage(messageText); // Restore message on error
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (chatId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await fetch(`/api/admin/chats/${chatId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const updateChatStatus = async (chatId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/chats/${chatId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        setSelectedChat(prev => ({ ...prev, status }));
        loadChats(false);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const updateChatPriority = async (chatId, priority) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/chats/${chatId}/priority`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority })
      });

      if (response.ok) {
        toast.success('Priority updated successfully');
        setSelectedChat(prev => ({ ...prev, priority }));
        loadChats(false);
      } else {
        toast.error('Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Error updating priority');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[0];
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = !searchTerm || 
      chat.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || chat.status === statusFilter;
    const matchesPriority = !priorityFilter || chat.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i className="fas fa-comments text-blue-600"></i>
          Chat Management
        </h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoReply}
              onChange={(e) => setAutoReply(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-reply</span>
          </label>
          <button
            onClick={() => loadChats()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat List */}
        <div className="w-1/3 bg-white rounded-lg shadow-sm border flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b space-y-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Priority</option>
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-3xl mb-2 opacity-50"></i>
                <p>No chats found</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const statusInfo = getStatusInfo(chat.status);
                const priorityInfo = getPriorityInfo(chat.priority);
                const isSelected = selectedChat?._id === chat._id;
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-gray-600 text-sm"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {chat.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {chat.lastMessage || chat.subject || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <i className={`fas ${statusInfo.icon} mr-1`}></i>
                          {statusInfo.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.updatedAt || chat.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-gray-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedChat.user?.name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={selectedChat.status}
                    onChange={(e) => updateChatStatus(selectedChat._id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedChat.priority}
                    onChange={(e) => updateChatPriority(selectedChat._id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  const isAdmin = message.sender === 'admin';
                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isAdmin
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          isAdmin ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <i className="fas fa-comments text-6xl mb-4 opacity-50"></i>
                <h3 className="text-xl font-medium mb-2">Select a chat to start messaging</h3>
                <p>Choose a conversation from the list to view and respond to messages.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManager;