'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'

const ChatSystem = () => {
  const { data: session } = useSession()
  const user = session?.user
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat._id)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatMessages = async (chatId) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/chat/${chatId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const messageData = {
      content: newMessage.trim(),
      sender: 'admin',
      senderName: session?.user?.name || 'Admin',
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch(`/api/admin/chat/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        onNewMessage(selectedChat._id, data.message)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const markAsRead = async (chatId) => {
    try {
      await fetch(`/api/admin/chat/${chatId}/mark-read`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error marking chat as read:', error)
    }
  }

  const filteredChats = activeChats.filter(chat => 
    chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-2">Active Chats ({activeChats.length})</h3>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div className="overflow-y-auto h-full">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  onChatSelect(chat)
                  markAsRead(chat._id)
                }}
                className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                  selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">
                    {chat.userName || 'Anonymous User'}
                  </div>
                  <div className="flex items-center space-x-1">
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {chat.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {chat.userEmail}
                </div>
                {chat.lastMessage && (
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {chat.lastMessage.content}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm">No active chats found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{selectedChat.userName || 'Anonymous User'}</h4>
                  <p className="text-sm text-gray-600">{selectedChat.userEmail}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Started: {formatDate(selectedChat.createdAt)}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.senderName} • {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">Select a Chat</h3>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}