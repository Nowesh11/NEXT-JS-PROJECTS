import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, Edit, Save, RotateCcw, Eye, Download, Search, Filter, ChevronDown, Globe, Home, User, BookOpen, FolderOpen, Mail, LogIn, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ContentOverviewTable from '@/components/ContentOverviewTable';
import RecentActivityTable from '@/components/RecentActivityTable';
import websiteContentAPI from '../services/websiteContentApi';

const WebsiteContentManagement = () => {
  const [currentPage, setCurrentPage] = useState('global');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [bilingualMode, setBilingualMode] = useState(false);
  const [contentData, setContentData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Page configuration
  const pages = [
    { id: 'global', name: 'Global Elements', icon: Globe },
    { id: 'home', name: 'Home', icon: Home },
    { id: 'about', name: 'About', icon: User },
    { id: 'books', name: 'Books', icon: BookOpen },
    { id: 'projects', name: 'Projects', icon: FolderOpen },
    { id: 'ebooks', name: 'E-books', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Mail },
    { id: 'login', name: 'Login', icon: LogIn },
    { id: 'signup', name: 'Sign Up', icon: UserPlus }
  ];

  // Section types configuration
  const sectionTypes = {
    text: { name: 'Text Section', icon: '📝', fields: ['title', 'content'] },
    image: { name: 'Image Section', icon: '🖼️', fields: ['title', 'image', 'alt', 'caption'] },
    hero: { name: 'Hero Section', icon: '🎯', fields: ['title', 'subtitle', 'background', 'cta'] },
    banner: { name: 'Banner', icon: '🎪', fields: ['title', 'message', 'type'] },
    feature: { name: 'Feature Section', icon: '⭐', fields: ['title', 'features'] },
    cards: { name: 'Card Grid', icon: '🃏', fields: ['title', 'cards'] },
    cta: { name: 'Call to Action', icon: '📢', fields: ['title', 'description', 'button'] },
    gallery: { name: 'Gallery', icon: '🖼️', fields: ['title', 'images'] },
    form: { name: 'Form Section', icon: '📋', fields: ['title', 'fields'] },
    testimonials: { name: 'Testimonials', icon: '💬', fields: ['title', 'testimonials'] },
    stats: { name: 'Statistics', icon: '📊', fields: ['title', 'stats'] },
    team: { name: 'Team Section', icon: '👥', fields: ['title', 'members'] },
    pricing: { name: 'Pricing', icon: '💰', fields: ['title', 'plans'] },
    faq: { name: 'FAQ', icon: '❓', fields: ['title', 'questions'] },
    'contact-info': { name: 'Contact Info', icon: '📞', fields: ['title', 'info'] },
    navigation: { name: 'Navigation', icon: '🧭', fields: ['items'] }
  };

  const [recentActivity, setRecentActivity] = useState([]);

  const loadRecentActivity = async () => {
    try {
      const activity = await websiteContentAPI.getRecentActivity();
      setRecentActivity(activity || []);
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  };

  useEffect(() => {
    loadContentData();
    loadRecentActivity();
  }, [currentPage, currentLanguage]);

  const loadContentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await websiteContentAPI.getPageContent(currentPage, currentLanguage);
      setContentData(data || {});
    } catch (err) {
      setError('Failed to load content data');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await websiteContentAPI.savePageContent(currentPage, currentLanguage, contentData);
      setIsEditing(false);
      setSuccess('Content saved successfully!');
      // Reload recent activity
      loadRecentActivity();
    } catch (err) {
      setError('Failed to save content');
      console.error('Error saving content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetContent = () => {
    loadContentData();
    setIsEditing(false);
  };

  const handleCreateSection = async (sectionType) => {
    const newSection = {
      type: sectionType,
      ...Object.fromEntries(sectionTypes[sectionType].fields.map(field => [field, '']))
    };
    const sectionId = `section_${Date.now()}`;
    setContentData(prev => ({ ...prev, [sectionId]: newSection }));
    setIsEditing(true);
  };

  const handleEditSection = (sectionId, field, value) => {
    setContentData(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value }
    }));
    setIsEditing(true);
  };

  const getCurrentPageIcon = () => {
    const page = pages.find(p => p.id === currentPage);
    return page ? page.icon : Globe;
  };

  const CurrentPageIcon = getCurrentPageIcon();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Alerts */}
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrentPageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Website Content Management</h1>
                <p className="text-gray-600">Manage and edit your website content</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={isEditing ? "destructive" : "secondary"}>
                {isEditing ? "Unsaved Changes" : "All Saved"}
              </Badge>
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Page Selector */}
            <div className="space-y-2">
              <Label>Select Page</Label>
              <Select value={currentPage} onValueChange={setCurrentPage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pages.map(page => {
                    const PageIcon = page.icon;
                    return (
                      <SelectItem key={page.id} value={page.id}>
                        <div className="flex items-center space-x-2">
                          <PageIcon className="h-4 w-4" />
                          <span>{page.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Language Toggle */}
            <div className="space-y-2">
              <Label>Language</Label>
              <div className="flex space-x-2">
                <Button
                  variant={currentLanguage === 'english' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentLanguage('english')}
                >
                  English
                </Button>
                <Button
                  variant={currentLanguage === 'tamil' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentLanguage('tamil')}
                >
                  தமிழ்
                </Button>
                <Button
                  variant={bilingualMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBilingualMode(!bilingualMode)}
                >
                  Bilingual
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button onClick={handleSaveContent} disabled={loading || !isEditing} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleResetContent} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Content Editor */}
          <div className="xl:col-span-3 space-y-6">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Content Editor</TabsTrigger>
                <TabsTrigger value="overview">Content Overview</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="space-y-4">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading content...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(contentData).length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                          <p className="text-gray-600 mb-4">Start by creating your first content section.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      Object.entries(contentData).map(([sectionId, section]) => (
                        <ContentSectionEditor
                          key={sectionId}
                          sectionId={sectionId}
                          section={section}
                          sectionTypes={sectionTypes}
                          currentLanguage={currentLanguage}
                          bilingualMode={bilingualMode}
                          onEdit={handleEditSection}
                        />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="overview">
                <ContentOverviewTable
                  onEdit={(item) => {
                    setCurrentPage(item.page.toLowerCase());
                    // Switch to editor tab
                    document.querySelector('[value="editor"]').click();
                  }}
                  onDelete={(item) => {
                    if (confirm('Are you sure you want to delete this content?')) {
                      alert('Content deleted successfully!');
                    }
                  }}
                  onPreview={(item) => {
                    alert(`Previewing ${item.page} - ${item.section}`);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="activity">
                <RecentActivityTable
                  onViewDetails={(item) => {
                    console.log('Viewing details for:', item);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Create Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Section</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(sectionTypes).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCreateSection(type)}
                  >
                    <span className="mr-2">{config.icon}</span>
                    {config.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Content Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Sections</span>
                  <span className="font-medium">{Object.keys(contentData).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Page</span>
                  <span className="font-medium capitalize">{currentPage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Language</span>
                  <span className="font-medium">{currentLanguage === 'english' ? 'English' : 'தமிழ்'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Section Editor Component
const ContentSectionEditor = ({ sectionId, section, sectionTypes, currentLanguage, bilingualMode, onEdit }) => {
  const sectionConfig = sectionTypes[section.type];
  
  if (!sectionConfig) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{sectionConfig.icon}</span>
            <span>{sectionConfig.name}</span>
            <Badge variant="outline">{section.type}</Badge>
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sectionConfig.fields.map(field => (
          <div key={field} className="space-y-2">
            <Label className="capitalize">{field.replace('_', ' ')}</Label>
            {bilingualMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">English</Label>
                  {field === 'content' || field === 'description' ? (
                    <Textarea
                      value={section[`${field}_en`] || section[field] || ''}
                      onChange={(e) => onEdit(sectionId, `${field}_en`, e.target.value)}
                      placeholder={`Enter ${field} in English`}
                    />
                  ) : (
                    <Input
                      value={section[`${field}_en`] || section[field] || ''}
                      onChange={(e) => onEdit(sectionId, `${field}_en`, e.target.value)}
                      placeholder={`Enter ${field} in English`}
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">தமிழ்</Label>
                  {field === 'content' || field === 'description' ? (
                    <Textarea
                      value={section[`${field}_ta`] || ''}
                      onChange={(e) => onEdit(sectionId, `${field}_ta`, e.target.value)}
                      placeholder={`Enter ${field} in Tamil`}
                    />
                  ) : (
                    <Input
                      value={section[`${field}_ta`] || ''}
                      onChange={(e) => onEdit(sectionId, `${field}_ta`, e.target.value)}
                      placeholder={`Enter ${field} in Tamil`}
                    />
                  )}
                </div>
              </div>
            ) : (
              field === 'content' || field === 'description' ? (
                <Textarea
                  value={section[field] || ''}
                  onChange={(e) => onEdit(sectionId, field, e.target.value)}
                  placeholder={`Enter ${field}`}
                />
              ) : (
                <Input
                  value={section[field] || ''}
                  onChange={(e) => onEdit(sectionId, field, e.target.value)}
                  placeholder={`Enter ${field}`}
                />
              )
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WebsiteContentManagement;