import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, ArrowUpDown, Calendar, User, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import websiteContentAPI from '../services/websiteContentApi';

const RecentActivityTable = ({ onViewDetails }) => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  // Mock data for demonstration
  const mockActivityData = [
    {
      id: 1,
      page: 'Home',
      section: 'Hero Section',
      action: 'Updated',
      user: 'Admin',
      userRole: 'Administrator',
      timestamp: '2024-01-15 10:30:25',
      status: 'published',
      changes: 'Updated hero title and subtitle',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      page: 'About',
      section: 'Team Section',
      action: 'Created',
      user: 'Editor',
      userRole: 'Content Editor',
      timestamp: '2024-01-15 09:15:42',
      status: 'draft',
      changes: 'Added new team member profile',
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      page: 'Books',
      section: 'Book List',
      action: 'Updated',
      user: 'Admin',
      userRole: 'Administrator',
      timestamp: '2024-01-14 16:45:18',
      status: 'published',
      changes: 'Updated book descriptions and prices',
      ipAddress: '192.168.1.100'
    },
    {
      id: 4,
      page: 'Projects',
      section: 'Project Gallery',
      action: 'Deleted',
      user: 'Admin',
      userRole: 'Administrator',
      timestamp: '2024-01-14 14:20:33',
      status: 'archived',
      changes: 'Removed outdated project entry',
      ipAddress: '192.168.1.100'
    },
    {
      id: 5,
      page: 'Contact',
      section: 'Contact Form',
      action: 'Updated',
      user: 'Editor',
      userRole: 'Content Editor',
      timestamp: '2024-01-13 11:30:15',
      status: 'published',
      changes: 'Updated contact information and form fields',
      ipAddress: '192.168.1.102'
    },
    {
      id: 6,
      page: 'Global',
      section: 'Navigation',
      action: 'Updated',
      user: 'Admin',
      userRole: 'Administrator',
      timestamp: '2024-01-13 08:45:22',
      status: 'published',
      changes: 'Added new menu items and updated links',
      ipAddress: '192.168.1.100'
    },
    {
      id: 7,
      page: 'E-books',
      section: 'E-book Catalog',
      action: 'Created',
      user: 'Content Manager',
      userRole: 'Content Manager',
      timestamp: '2024-01-12 15:20:44',
      status: 'review',
      changes: 'Added new e-book collection section',
      ipAddress: '192.168.1.103'
    },
    {
      id: 8,
      page: 'Login',
      section: 'Login Form',
      action: 'Updated',
      user: 'Developer',
      userRole: 'Developer',
      timestamp: '2024-01-12 12:10:33',
      status: 'published',
      changes: 'Enhanced form validation and styling',
      ipAddress: '192.168.1.104'
    }
  ];

  // Fetch activity data on component mount
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        const response = await websiteContentAPI.getRecentActivity();
         setActivityData(response || mockActivityData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
        setError('Failed to load activity data');
        setActivityData(mockActivityData); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  const data = activityData;

  // Get unique users for filter
  const uniqueUsers = [...new Set(data.map(item => item.user))];

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = 
        item.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.changes.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || item.action.toLowerCase() === actionFilter;
      const matchesUser = userFilter === 'all' || item.user === userFilter;
      
      return matchesSearch && matchesAction && matchesUser;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, actionFilter, userFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      deleted: 'bg-red-100 text-red-800',
      published: 'bg-purple-100 text-purple-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[action.toLowerCase()] || colors.updated}>
        {action}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      review: 'bg-orange-100 text-orange-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status] || colors.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
            <Badge variant="outline">{filteredAndSortedData.length} activities</Badge>
          </CardTitle>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-32">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading activity data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}
        
        {!loading && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Time</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('action')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Action</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('page')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Page</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Section</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('user')}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No activity found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{formatTimestamp(item.timestamp)}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(item.action)}</TableCell>
                    <TableCell className="font-medium">{item.page}</TableCell>
                    <TableCell>{item.section}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{item.user}</div>
                        <div className="text-gray-500 text-xs">{item.userRole}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm" title={item.changes}>
                        {item.changes}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Activity Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Action</Label>
                                <div className="mt-1">{getActionBadge(item.action)}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Status</Label>
                                <div className="mt-1">{getStatusBadge(item.status)}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Page</Label>
                                <div className="mt-1 font-medium">{item.page}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Section</Label>
                                <div className="mt-1">{item.section}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">User</Label>
                                <div className="mt-1">
                                  <div className="font-medium">{item.user}</div>
                                  <div className="text-sm text-gray-500">{item.userRole}</div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Timestamp</Label>
                                <div className="mt-1">
                                  <div>{new Date(item.timestamp).toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">{formatTimestamp(item.timestamp)}</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Changes Made</Label>
                              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{item.changes}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">IP Address</Label>
                              <div className="mt-1 text-sm font-mono">{item.ipAddress}</div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Stats */}
        {filteredAndSortedData.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedData.length} of {data.length} activities
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Created: {data.filter(item => item.action === 'Created').length}</span>
              <span>Updated: {data.filter(item => item.action === 'Updated').length}</span>
              <span>Deleted: {data.filter(item => item.action === 'Deleted').length}</span>
            </div>
          </div>
        )}
        )}
      </CardContent>
    </Card>
  );
};

const Label = ({ children, className = '' }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export default RecentActivityTable;