'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
    MessageCircle, 
    Search, 
    Filter, 
    MoreVertical, 
    Send, 
    Archive, 
    CheckCircle, 
    Clock,
    AlertCircle,
    User,
    Calendar
} from 'lucide-react';

export default function AdminChats() {
    const { data: session } = useSession();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('active');
    const [pagination, setPagination] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchChats();
        }
    }, [session, filterStatus, searchTerm]);

    useEffect(() => {
        if (selectedChat) {
            fetchChatMessages(selectedChat._id);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChats = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: filterStatus,
                page: page.toString(),
                limit: '20'
            });
            
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(`/api/admin/chats?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                setChats(data.chats);
                setPagination(data.pagination);
            } else {
                console.error('Error fetching chats:', data.error);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatMessages = async (chatId) => {
        try {
            const response = await fetch(`/api/chat/${chatId}`);
            const data = await response.json();
            
            if (response.ok) {
                setMessages(data.chat.messages || []);
            } else {
                console.error('Error fetching messages:', data.error);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !selectedChat) return;
        
        const messageText = newMessage.trim();
        setNewMessage('');
        
        // Add optimistic message
        const optimisticMessage = {
            _id: Date.now().toString(),
            content: messageText,
            sender: {
                _id: session.user.id,
                name: session.user.name,
                role: session.user.role
            },
            createdAt: new Date().toISOString(),
            status: 'sending'
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        
        try {
            const response = await fetch(`/api/chat/${selectedChat._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    type: 'text'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update optimistic message with real data
                setMessages(prev => 
                    prev.map(msg => 
                        msg._id === optimisticMessage._id 
                            ? { ...data.data, status: 'sent' }
                            : msg
                    )
                );
                
                // Update chat list
                fetchChats();
            } else {
                // Remove optimistic message on error
                setMessages(prev => 
                    prev.filter(msg => msg._id !== optimisticMessage._id)
                );
                alert('Failed to send message: ' + data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => 
                prev.filter(msg => msg._id !== optimisticMessage._id)
            );
            alert('Failed to send message');
        }
    };

    const updateChatStatus = async (chatId, action, data = {}) => {
        try {
            const response = await fetch('/api/admin/chats', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId,
                    action,
                    data
                })
            });
            
            if (response.ok) {
                fetchChats();
                if (selectedChat && selectedChat._id === chatId) {
                    fetchChatMessages(chatId);
                }
            } else {
                const errorData = await response.json();
                alert('Error: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error updating chat:', error);
            alert('Failed to update chat');
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'normal': return 'text-blue-600 bg-blue-100';
            case 'low': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Access denied. Admin privileges required.</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Chat List Sidebar */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900 mb-4">Chat Support</h1>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    {/* Filter */}
                    <div className="flex space-x-2">
                        {['active', 'resolved', 'archived'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                    filterStatus === status
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No chats found</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {chat.user?.name || 'Unknown User'}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(chat.lastActivity)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {chat.user?.email}
                                            </p>
                                            {chat.lastMessage && (
                                                <p className="text-sm text-gray-500 truncate mt-1">
                                                    {chat.lastMessage.content}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(chat.priority)}`}>
                                                        {chat.priority}
                                                    </span>
                                                    {chat.category && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                            {chat.category}
                                                        </span>
                                                    )}
                                                </div>
                                                {chat.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {selectedChat.user?.name || 'Unknown User'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedChat.user?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => updateChatStatus(selectedChat._id, 'resolve')}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                        title="Mark as Resolved"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => updateChatStatus(selectedChat._id, 'archive')}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                        title="Archive Chat"
                                    >
                                        <Archive className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((message, index) => {
                                const isAdmin = message.sender.role === 'admin';
                                const showDate = index === 0 || 
                                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                                
                                return (
                                    <div key={message._id}>
                                        {showDate && (
                                            <div className="text-center text-xs text-gray-500 my-4">
                                                {formatDate(message.createdAt)}
                                            </div>
                                        )}
                                        <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                isAdmin 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-white text-gray-900 shadow-sm'
                                            }`}>
                                                <p className="text-sm">{message.content}</p>
                                                <div className={`text-xs mt-1 ${
                                                    isAdmin ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                    {formatTime(message.createdAt)}
                                                    {message.status === 'sending' && (
                                                        <span className="ml-1">⏳</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">Select a chat to start messaging</h3>
                            <p>Choose a conversation from the sidebar to view messages</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}