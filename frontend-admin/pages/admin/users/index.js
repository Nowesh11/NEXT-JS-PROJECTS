'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../../components/layout/AdminLayout';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  BookOpenIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,XMarkIcon,
  UserPlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { 
  UserCircleIcon as UserCircleSolidIcon,
  ShieldCheckIcon as ShieldCheckSolidIcon 
} from '@heroicons/react/24/solid';

const UsersManagement = ({ getText, language, theme, toggleTheme, toggleLanguage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [editUser, setEditUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);

  // Sample users data
  const sampleUsers = [
    {
      id: 1,
      name: 'Dr. Kamala Subramaniam',
      email: 'kamala.s@example.com',
      phone: '+91 98765 43210',
      role: 'author',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinedDate: '2024-01-15',
      lastActive: '2024-03-20',
      location: 'Chennai, Tamil Nadu',
      totalBooks: 12,
      totalEarnings: 45000,
      followers: 1250,
      bio: 'Renowned Tamil literature author and cultural researcher.',
      verified: true,
      subscription: 'premium',
      tags: ['Author', 'Literature', 'Cultural Studies']
    },
    {
      id: 2,
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      phone: '+91 87654 32109',
      role: 'reader',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinedDate: '2024-02-10',
      lastActive: '2024-03-21',
      location: 'Coimbatore, Tamil Nadu',
      totalBooks: 0,
      totalEarnings: 0,
      followers: 45,
      bio: 'Passionate reader of Tamil literature and poetry.',
      verified: false,
      subscription: 'basic',
      tags: ['Reader', 'Poetry Enthusiast']
    },
    {
      id: 3,
      name: 'Prof. Meera Rajesh',
      email: 'meera.rajesh@university.edu',
      phone: '+91 76543 21098',
      role: 'educator',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinedDate: '2024-01-05',
      lastActive: '2024-03-19',
      location: 'Madurai, Tamil Nadu',
      totalBooks: 8,
      totalEarnings: 32000,
      followers: 890,
      bio: 'Professor of Tamil Studies and Digital Education specialist.',
      verified: true,
      subscription: 'premium',
      tags: ['Educator', 'Digital Learning', 'Tamil Studies']
    },
    {
      id: 4,
      name: 'Arjun Krishnan',
      email: 'arjun.k@example.com',
      phone: '+91 65432 10987',
      role: 'reader',
      status: 'inactive',
      avatar: '/api/placeholder/100/100',
      joinedDate: '2024-03-01',
      lastActive: '2024-03-10',
      location: 'Trichy, Tamil Nadu',
      totalBooks: 0,
      totalEarnings: 0,
      followers: 12,
      bio: 'Student interested in Tamil culture and history.',
      verified: false,
      subscription: 'basic',
      tags: ['Student', 'History']
    },
    {
      id: 5,
      name: 'Admin User',
      email: 'admin@tls.com',
      phone: '+91 54321 09876',
      role: 'admin',
      status: 'active',
      avatar: '/api/placeholder/100/100',
      joinedDate: '2023-12-01',
      lastActive: '2024-03-21',
      location: 'Chennai, Tamil Nadu',
      totalBooks: 0,
      totalEarnings: 0,
      followers: 0,
      bio: 'System administrator for Tamil Literary Society platform.',
      verified: true,
      subscription: 'admin',
      tags: ['Administrator', 'System Management']
    },
    {
      id: 6,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 43210 98765',
      role: 'author',
      status: 'pending',
      avatar: '/api/placeholder/100/100',
      joinedDate: '2024-03-18',
      lastActive: '2024-03-20',
      location: 'Salem, Tamil Nadu',
      totalBooks: 2,
      totalEarnings: 5000,
      followers: 156,
      bio: 'Emerging author focusing on contemporary Tamil fiction.',
      verified: false,
      subscription: 'basic',
      tags: ['New Author', 'Fiction', 'Contemporary']
    }
  ];

  const roles = ['all', 'admin', 'author', 'educator', 'reader'];
  const statuses = ['all', 'active', 'inactive', 'pending', 'suspended'];

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.joinedDate) - new Date(a.joinedDate);
      case 'oldest':
        return new Date(a.joinedDate) - new Date(b.joinedDate);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'earnings':
        return b.totalEarnings - a.totalEarnings;
      case 'books':
        return b.totalBooks - a.totalBooks;
      case 'followers':
        return b.followers - a.followers;
      case 'active':
        return new Date(b.lastActive) - new Date(a.lastActive);
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowAddModal(true);
  };

  const resetNewUser = () => {
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      status: 'active'
    });
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new user object
    const userToAdd = {
      id: users.length + 1,
      ...newUser,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      totalBooks: 0,
      totalEarnings: 0,
      followers: 0,
      avatar: '/api/placeholder/100/100',
      verified: false,
      subscription: 'basic',
      tags: ['New User']
    };
    
    // Add user to the list
    setUsers([...users, userToAdd]);
    
    // Reset form and close modal
    resetNewUser();
    setShowAddModal(false);
    
    console.log('User added:', userToAdd);
  };

  const handleNewUserChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      id: user._id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  const resetEditUser = () => {
    setEditUser({
      id: '',
      name: '',
      email: '',
      role: 'user',
      status: 'active'
    });
  };

  // Export CSV functionality
  const exportToCSV = () => {
    const csvHeaders = ['Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const csvData = users.map(user => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.joinedDate || ''
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editUser.name || !editUser.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token-for-admin' // 在实际环境中使用真实token
        },
        body: JSON.stringify(editUser)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const data = await response.json();
      
      // Update user in the list
      setUsers(users.map(user => 
        user._id === editUser.id 
          ? { ...user, ...data.user }
          : user
      ));
      
      // Reset form and close modal
      resetEditUser();
      setShowEditModal(false);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.message}`);
    }
  };

  const handleEditUserChange = (field, value) => {
    setEditUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer mock-token-for-admin' // 在实际环境中使用真实token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      // 从列表中移除用户
      setUsers(users.filter(user => user._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  // Bulk operations handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
      setSelectAll(true);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBulkActivate = () => {
    setUsers(users.map(user => 
      selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
    ));
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleBulkDeactivate = () => {
    setUsers(users.map(user => 
      selectedUsers.includes(user.id) ? { ...user, status: 'inactive' } : user
    ));
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    setUsers(users.filter(user => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
    setSelectAll(false);
    setShowBulkDeleteModal(false);
  };

  const handleExportCSV = () => {
    const csvData = filteredUsers.map(user => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: user.role,
      Status: user.status,
      Location: user.location,
      'Joined Date': user.joinedDate,
      'Last Active': user.lastActive,
      'Total Books': user.totalBooks,
      'Total Earnings': user.totalEarnings,
      Followers: user.followers
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'author': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'educator': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'reader': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldCheckSolidIcon className="w-4 h-4" />;
      case 'author': return <PencilIcon className="w-4 h-4" />;
      case 'educator': return <BookOpenIcon className="w-4 h-4" />;
      case 'reader': return <UserCircleSolidIcon className="w-4 h-4" />;
      default: return <UserCircleIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout 
        getText={getText} 
        language={language} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleLanguage={toggleLanguage}
      >
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="w-16 h-16 border-4 border-cultural-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      getText={getText} 
      language={language} 
      theme={theme} 
      toggleTheme={toggleTheme} 
      toggleLanguage={toggleLanguage}
    >
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getText ? getText('admin.users.title', 'Users Management') : 'Users Management'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getText ? getText('admin.users.subtitle', 'Manage user accounts, roles, and permissions') : 'Manage user accounts, roles, and permissions'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </motion.button>
            
            <motion.button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export CSV
            </motion.button>
            
            <motion.button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 bg-cultural-500 text-white rounded-xl font-medium hover:bg-cultural-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-5 h-5" />
              {getText ? getText('admin.users.addUser', 'Add User') : 'Add User'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cultural-100 dark:bg-cultural-900/20 rounded-xl">
                <UsersIcon className="w-6 h-6 text-cultural-600 dark:text-cultural-400" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400">Total Users</h3>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400">Active Users</h3>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <PencilIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.filter(u => u.role === 'author').length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400">Authors</h3>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.filter(u => u.status === 'pending').length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400">Pending Approval</h3>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="glass-morphism rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={getText ? getText('admin.users.search.placeholder', 'Search users, emails, tags...') : 'Search users, emails, tags...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="earnings">Highest Earnings</option>
              <option value="books">Most Books</option>
              <option value="followers">Most Followers</option>
              <option value="active">Recently Active</option>
            </select>
          </div>

          {/* Bulk Operations Bar */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleBulkActivate}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckIcon className="w-4 h-4 inline mr-1" />
                    Activate
                  </motion.button>
                  <motion.button
                    onClick={handleBulkDeactivate}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XMarkIcon className="w-4 h-4 inline mr-1" />
                    Deactivate
                  </motion.button>
                  <motion.button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TrashIcon className="w-4 h-4 inline mr-1" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </span>
              {viewMode === 'list' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-cultural-500 focus:ring-cultural-500"
                  />
                  <span>Select All</span>
                </label>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 hover:text-cultural-500 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Export CSV
              </button>
              <button className="flex items-center gap-2 hover:text-cultural-500 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Import
              </button>
            </div>
          </div>
        </motion.div>

        {/* Users Grid/List */}
        <motion.div variants={itemVariants}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentUsers.map((user) => (
                <motion.div
                  key={user.id}
                  className="glass-morphism rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* User Header */}
                  <div className="relative p-6 bg-gradient-to-br from-cultural-100 to-digital-100 dark:from-cultural-900/20 dark:to-digital-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800"
                        />
                        {user.verified && (
                          <div className="absolute -bottom-1 -right-1 p-1 bg-blue-500 rounded-full">
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {user.email}
                    </p>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <motion.button
                        onClick={() => handleEditUser(user)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditUser(user)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      </motion.button>
                      {user.role !== 'admin' && (
                        <motion.button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl text-white hover:bg-red-500/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {user.bio}
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 dark:text-white">
                          {user.totalBooks}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Books
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 dark:text-white">
                          {user.followers}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Followers
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-cultural-600 dark:text-cultural-400">
                          ₹{user.totalEarnings.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Earnings
                        </div>
                      </div>
                    </div>
                    
                    {/* Location and Join Date */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="truncate">{user.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Joined {formatDate(user.joinedDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>Active {getTimeAgo(user.lastActive)}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {user.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-digital-100 dark:bg-digital-900/20 text-digital-600 dark:text-digital-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {user.tags.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          +{user.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {currentUsers.map((user) => (
                <motion.div
                  key={user.id}
                  className={`glass-morphism rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${
                    selectedUsers.includes(user.id) ? 'ring-2 ring-cultural-500 bg-cultural-50 dark:bg-cultural-900/10' : ''
                  }`}
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  <div className="flex items-center gap-6">
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-cultural-500 focus:ring-cultural-500"
                      />
                    </div>
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800"
                      />
                      {user.verified && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-blue-500 rounded-full">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                            {user.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                        {user.bio}
                      </p>
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.totalBooks} books
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <HeartIcon className="w-5 h-5 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.followers} followers
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <BanknotesIcon className="w-5 h-5 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            ₹{user.totalEarnings.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.location}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Active {getTimeAgo(user.lastActive)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {user.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-digital-100 dark:bg-digital-900/20 text-digital-600 dark:text-digital-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        onClick={() => handleEditUser(user)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditUser(user)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-cultural-600 dark:hover:text-cultural-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      </motion.button>
                      {user.role !== 'admin' && (
                        <motion.button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-cultural-500 text-white'
                      : 'glass-morphism text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <motion.div
              className="relative glass-morphism rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Delete User
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedUser?.name}"? This will permanently remove the user account and all associated data.
              </p>
              
              <div className="flex items-center gap-3 justify-end">
                <motion.button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBulkDeleteModal(false)} />
            <motion.div
              className="relative glass-morphism rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Delete Multiple Users
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}? This will permanently remove all selected user accounts and their associated data.
              </p>
              
              <div className="flex items-center gap-3 justify-end">
                <motion.button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-4 py-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAddModal(false); resetNewUser(); }} />
            <motion.div
              className="relative glass-morphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                    <UserPlusIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Add New User
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create a new user account
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => { setShowAddModal(false); resetNewUser(); }}
                  className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => handleNewUserChange('name', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => handleNewUserChange('email', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Role and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => handleNewUserChange('role', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={newUser.status}
                      onChange={(e) => handleNewUserChange('status', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetNewUser(); }}
                    className="px-6 py-3 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add User
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowEditModal(false); resetEditUser(); }} />
            <motion.div
              className="relative glass-morphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <PencilIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Edit User
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Update user information and permissions
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => { setShowEditModal(false); resetEditUser(); }}
                  className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleEditUserSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editUser.name}
                      onChange={(e) => handleEditUserChange('name', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => handleEditUserChange('email', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Role and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={editUser.role}
                      onChange={(e) => handleEditUserChange('role', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editUser.status}
                      onChange={(e) => handleEditUserChange('status', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>



                {/* Form Actions */}
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    onClick={() => { setShowEditModal(false); resetEditUser(); }}
                    className="px-6 py-3 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Update User
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default UsersManagement;