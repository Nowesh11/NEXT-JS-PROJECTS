import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar, 
  MapPin, 
  Target, 
  Award, 
  BarChart3,
  Plus,
  Eye,
  Settings,
  FileText,
  UserPlus,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  User,
  Mail,
  Phone,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

const ProjectDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // State management
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recruitmentForms, setRecruitmentForms] = useState([]);
  const [recruitmentResponses, setRecruitmentResponses] = useState([]);
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    description: { en: '', ta: '' },
    role: 'crew',
    fields: [],
    status: 'active',
    settings: {
      allowMultipleSubmissions: false,
      requireLogin: true,
      autoClose: false,
      closeDate: null
    }
  });

  // Load item data
  useEffect(() => {
    if (id) {
      loadItemData();
      loadRecruitmentData();
    }
  }, [id]);

  const loadItemData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockItems = {
        '1': {
          id: '1',
          type: 'project',
          title: { en: 'Digital Learning Platform', ta: 'டிஜிட்டல் கற்றல் தளம்' },
          bureau: 'education-intellectual',
          status: 'active',
          director: { en: 'Dr. Sarah Johnson', ta: 'டாக்டர் சாரா ஜான்சன்' },
          teamSize: 12,
          progress: 75,
          description: { 
            en: 'A comprehensive digital learning platform designed to enhance educational experiences for students across various disciplines. This platform integrates modern technology with traditional learning methods to create an engaging and effective learning environment.',
            ta: 'பல்வேறு துறைகளில் மாணவர்களுக்கான கல்வி அனுபவங்களை மேம்படுத்த வடிவமைக்கப்பட்ட விரிவான டிஜிட்டல் கற்றல் தளம். இந்த தளம் நவீன தொழில்நுட்பத்தை பாரம்பரிய கற்றல் முறைகளுடன் ஒருங்கிணைத்து ஈர்க்கக்கூடிய மற்றும் பயனுள்ள கற்றல் சூழலை உருவாக்குகிறது.'
          },
          goals: { 
            en: 'Improve digital literacy, enhance learning outcomes, provide accessible education, foster collaborative learning',
            ta: 'டிஜிட்டல் கல்வியறிவை மேம்படுத்துதல், கற்றல் விளைவுகளை மேம்படுத்துதல், அணுகக்கூடிய கல்வியை வழங்குதல், கூட்டு கற்றலை வளர்த்தல்'
          },
          achievements: { 
            en: 'Launched beta version with 500+ users, Integrated 10+ educational modules, Achieved 95% user satisfaction rate',
            ta: '500+ பயனர்களுடன் பீட்டா பதிப்பு வெளியிடப்பட்டது, 10+ கல்வி தொகுதிகள் ஒருங்கிணைக்கப்பட்டன, 95% பயனர் திருப்தி விகிதம் அடையப்பட்டது'
          },
          featured: true,
          acceptingVolunteers: true,
          images: [],
          createdAt: '2024-01-15',
          location: 'Online Platform',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          budget: '$50,000',
          tags: ['education', 'technology', 'digital-learning']
        },
        '2': {
          id: '2',
          type: 'activity',
          title: { en: 'Community Sports Day', ta: 'சமூக விளையாட்டு நாள்' },
          bureau: 'sports-leadership',
          status: 'active',
          director: { en: 'Mike Chen', ta: 'மைக் சென்' },
          teamSize: 8,
          progress: 50,
          description: { 
            en: 'Annual community sports event bringing together people of all ages to participate in various sporting activities and promote physical fitness and community bonding.',
            ta: 'பல்வேறு விளையாட்டு நடவடிக்கைகளில் பங்கேற்கவும், உடல் ஆரோக்கியம் மற்றும் சமூக பிணைப்பை ஊக்குவிக்கவும் அனைத்து வயதினரையும் ஒன்றிணைக்கும் வருடாந்திர சமூக விளையாட்டு நிகழ்வு.'
          },
          goals: { 
            en: 'Promote physical fitness, build community connections, encourage healthy competition',
            ta: 'உடல் ஆரோக்கியத்தை ஊக்குவித்தல், சமூக தொடர்புகளை உருவாக்குதல், ஆரோக்கியமான போட்டியை ஊக்குவித்தல்'
          },
          achievements: { 
            en: 'Registered 200+ participants, Secured 5 local sponsors, Organized 15 different sports',
            ta: '200+ பங்கேற்பாளர்கள் பதிவு செய்யப்பட்டுள்ளனர், 5 உள்ளூர் ஸ்பான்சர்கள் பெறப்பட்டன, 15 வெவ்வேறு விளையாட்டுகள் ஏற்பாடு செய்யப்பட்டன'
          },
          featured: false,
          acceptingVolunteers: true,
          images: [],
          createdAt: '2024-02-01',
          location: 'Community Sports Center',
          startDate: '2024-03-15',
          endDate: '2024-03-15',
          budget: '$5,000',
          tags: ['sports', 'community', 'health']
        },
        '3': {
          id: '3',
          type: 'initiative',
          title: { en: 'Green Campus Initiative', ta: 'பசுமை வளாக முன்முயற்சி' },
          bureau: 'social-welfare-voluntary',
          status: 'active',
          director: { en: 'Emma Rodriguez', ta: 'எம்மா ரோட்ரிக்ஸ்' },
          teamSize: 15,
          progress: 30,
          description: { 
            en: 'A comprehensive environmental initiative aimed at making our campus more sustainable through various green practices, renewable energy adoption, and environmental awareness programs.',
            ta: 'பல்வேறு பசுமை நடைமுறைகள், புதுப்பிக்கத்தக்க ஆற்றல் ஏற்றுக்கொள்ளல் மற்றும் சுற்றுச்சூழல் விழிப்புணர்வு திட்டங்கள் மூலம் எங்கள் வளாகத்தை மிகவும் நிலையானதாக மாற்றுவதை நோக்கமாகக் கொண்ட ஒரு விரிவான சுற்றுச்சூழல் முன்முயற்சி.'
          },
          goals: { 
            en: 'Reduce carbon footprint, promote sustainability, educate community about environmental issues',
            ta: 'கார்பன் தடம் குறைத்தல், நிலைத்தன்மையை ஊக்குவித்தல், சுற்றுச்சூழல் பிரச்சினைகள் குறித்து சமூகத்தை கல்வி'
          },
          achievements: { 
            en: 'Installed 50 solar panels, Reduced waste by 40%, Planted 200 trees',
            ta: '50 சோலார் பேனல்கள் நிறுவப்பட்டன, கழிவுகள் 40% குறைக்கப்பட்டன, 200 மரங்கள் நடப்பட்டன'
          },
          featured: true,
          acceptingVolunteers: true,
          images: [],
          createdAt: '2024-01-20',
          location: 'Campus Wide',
          startDate: '2024-01-20',
          endDate: '2025-01-20',
          budget: '$25,000',
          tags: ['environment', 'sustainability', 'green-energy']
        }
      };
      
      const itemData = mockItems[id];
      if (itemData) {
        setItem(itemData);
      } else {
        // Handle item not found
        console.error('Item not found');
      }
    } catch (error) {
      console.error('Error loading item data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecruitmentData = async () => {
    try {
      // Mock recruitment forms data
      const mockForms = [
        {
          _id: 'form_1',
          title: { en: 'Frontend Developer', ta: 'முன்பக்க டெவலப்பர்' },
          description: { en: 'Looking for skilled frontend developers', ta: 'திறமையான முன்பக்க டெவலப்பர்களை தேடுகிறோம்' },
          role: 'crew',
          status: 'active',
          linkedId: id,
          type: item?.type || 'project',
          createdAt: '2024-01-20',
          responseCount: 15,
          fields: [
            { id: 'name', label: 'Full Name', type: 'short-text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true },
            { id: 'experience', label: 'Years of Experience', type: 'number', required: true },
            { id: 'skills', label: 'Technical Skills', type: 'checkboxes', required: true, options: ['JavaScript', 'React', 'Vue.js', 'Angular'] }
          ]
        },
        {
          _id: 'form_2',
          title: { en: 'Project Coordinator', ta: 'திட்ட ஒருங்கிணைப்பாளர்' },
          description: { en: 'Seeking experienced project coordinators', ta: 'அனுபவமிக்க திட்ட ஒருங்கிணைப்பாளர்களை தேடுகிறோம்' },
          role: 'lead',
          status: 'active',
          linkedId: id,
          type: item?.type || 'project',
          createdAt: '2024-01-18',
          responseCount: 8,
          fields: [
            { id: 'name', label: 'Full Name', type: 'short-text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true },
            { id: 'experience', label: 'Management Experience', type: 'paragraph', required: true }
          ]
        }
      ];
      
      // Mock responses data
      const mockResponses = [
        {
          _id: 'resp_1',
          formId: 'form_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          status: 'pending',
          submittedAt: '2024-01-22T10:30:00Z',
          answers: [
            { fieldId: 'name', value: 'John Doe' },
            { fieldId: 'email', value: 'john@example.com' },
            { fieldId: 'experience', value: '5' },
            { fieldId: 'skills', value: ['JavaScript', 'React'] }
          ]
        },
        {
          _id: 'resp_2',
          formId: 'form_1',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          status: 'approved',
          submittedAt: '2024-01-21T14:20:00Z',
          answers: [
            { fieldId: 'name', value: 'Jane Smith' },
            { fieldId: 'email', value: 'jane@example.com' },
            { fieldId: 'experience', value: '8' },
            { fieldId: 'skills', value: ['JavaScript', 'React', 'Vue.js'] }
          ]
        }
      ];
      
      setRecruitmentForms(mockForms);
      setRecruitmentResponses(mockResponses);
    } catch (error) {
      console.error('Error loading recruitment data:', error);
    }
  };

  const createRecruitmentForm = async () => {
    try {
      // Mock form creation - replace with actual API call
      const newForm = {
        _id: `form_${Date.now()}`,
        ...formData,
        linkedId: id,
        type: item?.type || 'project',
        createdAt: new Date().toISOString(),
        responseCount: 0,
        fields: [
          { id: 'name', label: 'Full Name', type: 'short-text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'phone', label: 'Phone Number', type: 'phone', required: false },
          { id: 'motivation', label: 'Why do you want to join?', type: 'paragraph', required: true }
        ]
      };
      
      setRecruitmentForms([...recruitmentForms, newForm]);
      setShowCreateFormModal(false);
      setFormData({
        title: { en: '', ta: '' },
        description: { en: '', ta: '' },
        role: 'crew',
        fields: [],
        status: 'active',
        settings: {
          allowMultipleSubmissions: false,
          requireLogin: true,
          autoClose: false,
          closeDate: null
        }
      });
      
      // Show success message
      alert('Recruitment form created successfully!');
    } catch (error) {
      console.error('Error creating recruitment form:', error);
      alert('Error creating recruitment form. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBureauLabel = (bureau) => {
    const bureauMap = {
      'media-public-relations': 'Media & Public Relations',
      'sports-leadership': 'Sports & Leadership',
      'education-intellectual': 'Education & Intellectual',
      'arts-culture': 'Arts & Culture',
      'social-welfare-voluntary': 'Social Welfare & Voluntary',
      'language-literature': 'Language & Literature',
      'other': 'Other'
    };
    return bureauMap[bureau] || bureau;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'project': return '🚀';
      case 'activity': return '⚡';
      case 'initiative': return '💡';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!item) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
            <p className="text-gray-600 mb-6">The requested item could not be found.</p>
            <Link href="/admin/projects" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Projects
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/admin/projects" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(item.type)}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {item.title.en}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {getBureauLabel(item.bureau)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Team Size</p>
                      <p className="text-2xl font-semibold text-gray-900">{item.teamSize}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Progress</p>
                      <p className="text-2xl font-semibold text-gray-900">{item.progress}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Recruitment Forms</p>
                      <p className="text-2xl font-semibold text-gray-900">{recruitmentForms.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Applications</p>
                      <p className="text-2xl font-semibold text-gray-900">{recruitmentResponses.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Description */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{item.description.en}</p>
                </div>

                {/* Project Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Director</p>
                        <p className="font-medium text-gray-900">{item.director.en}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Bureau</p>
                        <p className="font-medium text-gray-900">{getBureauLabel(item.bureau)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{item.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">
                          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals and Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Goals
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.goals.en}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Achievements
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.achievements.en}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                  <span className="text-sm font-medium text-gray-500">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recruitment' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recruitment Forms</h2>
                  <p className="text-gray-600 mt-1">Manage recruitment forms for this {item.type}</p>
                </div>
                <button
                  onClick={() => setShowCreateFormModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </button>
              </div>

              {/* Recruitment Forms List */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {recruitmentForms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Form Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responses
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recruitmentForms.map((form) => (
                          <tr key={form._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {form.title.en}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {form.description.en}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {form.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>
                                {form.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {form.responseCount || 0}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/recruitment-responses?formId=${form._id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Responses"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Edit Form"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recruitment forms</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create your first recruitment form to start accepting applications.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreateFormModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Form
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Applications */}
              {recruitmentResponses.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {recruitmentResponses.slice(0, 5).map((response) => {
                      const form = recruitmentForms.find(f => f._id === response.formId);
                      return (
                        <div key={response._id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {response.userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Applied for: {form?.title.en}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(response.status)}
                                <span className="text-sm text-gray-500">
                                  {response.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(response.submittedAt).toLocaleDateString()}
                              </div>
                              <Link
                                href={`/recruitment-responses?formId=${response.formId}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-6 py-3 bg-gray-50">
                    <Link
                      href={`/recruitment-responses?formId=${recruitmentForms[0]?._id}`}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      View all applications →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
              <p className="text-gray-500">Team management functionality will be implemented here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <p className="text-gray-500">Project settings will be implemented here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateFormModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Create Recruitment Form
              </h3>
              <button
                onClick={() => setShowCreateFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Form Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Title (English)
                </label>
                <input
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, en: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Frontend Developer Application"
                />
              </div>

              {/* Form Title Tamil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Title (Tamil)
                </label>
                <input
                  type="text"
                  value={formData.title.ta}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, ta: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., முன்பக்க டெவலப்பர் விண்ணப்பம்"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, en: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the role and requirements..."
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Type
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="crew">Crew Member</option>
                  <option value="lead">Team Lead</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="specialist">Specialist</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={() => setShowCreateFormModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createRecruitmentForm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Form
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProjectDetailPage;