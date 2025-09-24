import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function EbooksAdmin() {
  const { data: session } = useSession();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Form state
  const [formData, setFormData] = useState({
    title: { english: '', tamil: '' },
    author: { english: '', tamil: '' },
    description: { english: '', tamil: '' },
    category: '',
    bookLanguage: '',
    coverImage: '',
    fileUrl: '',
    fileSize: '',
    fileFormat: 'pdf',
    pages: '',
    tags: [],
    featured: false,
    isFree: true,
    publishedDate: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Categories and languages
  const categories = [
    { value: 'literature', label: 'Literature' },
    { value: 'education', label: 'Education' },
    { value: 'culture', label: 'Culture' },
    { value: 'history', label: 'History' },
    { value: 'poetry', label: 'Poetry' },
    { value: 'children', label: 'Children\'s Books' },
    { value: 'science', label: 'Science' },
    { value: 'philosophy', label: 'Philosophy' }
  ];

  const languages = [
    { value: 'tamil', label: 'Tamil' },
    { value: 'english', label: 'English' },
    { value: 'bilingual', label: 'Bilingual' }
  ];

  const fileFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'epub', label: 'EPUB' },
    { value: 'mobi', label: 'MOBI' },
    { value: 'txt', label: 'Text' }
  ];

  // Fetch ebooks
  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (languageFilter !== 'all') params.append('bookLanguage', languageFilter);

      const response = await fetch(`/api/ebooks?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEbooks(data.data.ebooks);
        setTotalPages(Math.ceil(data.data.pagination.total / 10));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEbooks();
    }
  }, [session, currentPage, searchTerm, categoryFilter, languageFilter, sortBy, sortOrder]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.english.trim()) {
      errors.titleEnglish = 'English title is required';
    }
    if (!formData.title.tamil.trim()) {
      errors.titleTamil = 'Tamil title is required';
    }
    if (!formData.author.english.trim()) {
      errors.authorEnglish = 'English author is required';
    }
    if (!formData.author.tamil.trim()) {
      errors.authorTamil = 'Tamil author is required';
    }
    if (!formData.description.english.trim()) {
      errors.descriptionEnglish = 'English description is required';
    }
    if (!formData.description.tamil.trim()) {
      errors.descriptionTamil = 'Tamil description is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.bookLanguage) {
      errors.bookLanguage = 'Book language is required';
    }
    if (!formData.fileUrl.trim()) {
      errors.fileUrl = 'File URL is required';
    }
    if (!formData.fileFormat) {
      errors.fileFormat = 'File format is required';
    }
    if (formData.pages && (isNaN(formData.pages) || formData.pages < 1)) {
      errors.pages = 'Pages must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const url = editingEbook ? `/api/ebooks/${editingEbook.id}` : '/api/ebooks';
      const method = editingEbook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.filter(tag => tag.trim()),
          pages: formData.pages ? parseInt(formData.pages) : null,
          publishedDate: formData.publishedDate || null
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(editingEbook ? 'Ebook updated successfully!' : 'Ebook created successfully!');
        setShowForm(false);
        setEditingEbook(null);
        resetForm();
        fetchEbooks();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ebook?')) return;

    try {
      const response = await fetch(`/api/ebooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Ebook deleted successfully!');
        fetchEbooks();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: { english: '', tamil: '' },
      author: { english: '', tamil: '' },
      description: { english: '', tamil: '' },
      category: '',
      bookLanguage: '',
      coverImage: '',
      fileUrl: '',
      fileSize: '',
      fileFormat: 'pdf',
      pages: '',
      tags: [],
      featured: false,
      isFree: true,
      publishedDate: ''
    });
    setFormErrors({});
  };

  // Handle edit
  const handleEdit = (ebook) => {
    setEditingEbook(ebook);
    setFormData({
      title: ebook.title || { english: '', tamil: '' },
      author: ebook.author || { english: '', tamil: '' },
      description: ebook.description || { english: '', tamil: '' },
      category: ebook.category || '',
      bookLanguage: ebook.bookLanguage || '',
      coverImage: ebook.coverImage || '',
      fileUrl: ebook.fileUrl || '',
      fileSize: ebook.fileSize || '',
      fileFormat: ebook.fileFormat || 'pdf',
      pages: ebook.pages || '',
      tags: ebook.tags || [],
      featured: ebook.featured || false,
      isFree: ebook.isFree !== undefined ? ebook.isFree : true,
      publishedDate: ebook.publishedDate ? ebook.publishedDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags }));
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Please log in to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ebooks Management</h1>
        <button
          onClick={() => {
            setEditingEbook(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Ebook
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search ebooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Created Date</option>
            <option value="title.english">Title</option>
            <option value="downloadCount">Downloads</option>
            <option value="rating">Rating</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Ebooks Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ebook</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ebooks.map((ebook) => (
                  <tr key={ebook.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {ebook.coverImage ? (
                            <img className="h-12 w-12 rounded-lg object-cover" src={ebook.coverImage} alt="" />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-book text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ebook.title?.english || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ebook.author?.english || 'Unknown Author'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ebook.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ebook.bookLanguage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(ebook.downloadCount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star ${i < Math.floor(ebook.rating || 0) ? '' : 'text-gray-300'}`}></i>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">{(ebook.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {ebook.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        {ebook.isFree && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Free
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(ebook)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(ebook.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEbook ? 'Edit Ebook' : 'Add New Ebook'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title.english}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, english: e.target.value }
                    }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.titleEnglish ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.titleEnglish && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.titleEnglish}</p>
                  )}
                </div>

                {/* Tamil Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Tamil) *
                  </label>
                  <input
                    type="text"
                    value={formData.title.tamil}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, tamil: e.target.value }
                    }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.titleTamil ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.titleTamil && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.titleTamil}</p>
                  )}
                </div>

                {/* English Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.author.english}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      author: { ...prev.author, english: e.target.value }
                    }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.authorEnglish ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.authorEnglish && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.authorEnglish}</p>
                  )}
                </div>

                {/* Tamil Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author (Tamil) *
                  </label>
                  <input
                    type="text"
                    value={formData.author.tamil}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      author: { ...prev.author, tamil: e.target.value }
                    }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.authorTamil ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.authorTamil && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.authorTamil}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                  )}
                </div>

                {/* Book Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book Language *
                  </label>
                  <select
                    value={formData.bookLanguage}
                    onChange={(e) => setFormData(prev => ({ ...prev, bookLanguage: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.bookLanguage ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Language</option>
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                  {formErrors.bookLanguage && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.bookLanguage}</p>
                  )}
                </div>

                {/* File URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File URL *
                  </label>
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.fileUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/ebook.pdf"
                  />
                  {formErrors.fileUrl && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fileUrl}</p>
                  )}
                </div>

                {/* File Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Format *
                  </label>
                  <select
                    value={formData.fileFormat}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileFormat: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.fileFormat ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {fileFormats.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                  {formErrors.fileFormat && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fileFormat}</p>
                  )}
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>

                {/* File Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileSize: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2.5 MB"
                  />
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.pages ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {formErrors.pages && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.pages}</p>
                  )}
                </div>

                {/* Published Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Published Date
                  </label>
                  <input
                    type="date"
                    value={formData.publishedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishedDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English) *
                  </label>
                  <textarea
                    value={formData.description.english}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, english: e.target.value }
                    }))}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.descriptionEnglish ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.descriptionEnglish && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.descriptionEnglish}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Tamil) *
                  </label>
                  <textarea
                    value={formData.description.tamil}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, tamil: e.target.value }
                    }))}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.descriptionTamil ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.descriptionTamil && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.descriptionTamil}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., literature, classic, tamil"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Free</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingEbook ? 'Update Ebook' : 'Create Ebook')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}