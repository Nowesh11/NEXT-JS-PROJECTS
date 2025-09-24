'use client'

import { useState, useEffect, useRef } from 'react'

const FILE_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  audio: ['mp3', 'wav', 'ogg', 'aac', 'flac'],
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  code: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml']
}

const FILE_ICONS = {
  image: '🖼️',
  video: '🎥',
  audio: '🎵',
  document: '📄',
  archive: '📦',
  code: '💻',
  folder: '📁',
  default: '📄'
}

export default function FileStorageManager({
  files,
  directories,
  currentDirectory,
  loading,
  uploadProgress,
  selectedFiles,
  viewMode,
  sortBy,
  sortOrder,
  filterType,
  searchQuery,
  onDirectoryChange,
  onUpload,
  onCreateDirectory,
  onDeleteFile,
  onDeleteDirectory,
  onMoveFile,
  onRenameFile,
  onBulkDelete,
  onBulkMove,
  onSelectedFilesChange,
  onViewModeChange,
  onSortChange,
  onFilterChange,
  onSearchChange,
  onGetStorageStats
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isCreateDirModalOpen, setIsCreateDirModalOpen] = useState(false)
  const [newDirName, setNewDirName] = useState('')
  const [storageStats, setStorageStats] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [renamingFile, setRenamingFile] = useState(null)
  const [newFileName, setNewFileName] = useState('')
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  useEffect(() => {
    fetchStorageStats()
  }, [files])

  const fetchStorageStats = async () => {
    if (onGetStorageStats) {
      const stats = await onGetStorageStats()
      setStorageStats(stats)
    }
  }

  const getFileType = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    for (const [type, extensions] of Object.entries(FILE_TYPES)) {
      if (extensions.includes(extension)) {
        return type
      }
    }
    return 'default'
  }

  const getFileIcon = (filename, isDirectory = false) => {
    if (isDirectory) return FILE_ICONS.folder
    const type = getFileType(filename)
    return FILE_ICONS[type] || FILE_ICONS.default
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      try {
        await onUpload(droppedFiles, currentDirectory)
      } catch (error) {
        alert('Upload failed: ' + error.message)
      }
    }
  }

  const handleFileSelect = (e) => {
    const selectedFilesList = Array.from(e.target.files)
    if (selectedFilesList.length > 0) {
      handleUpload(selectedFilesList)
    }
  }

  const handleUpload = async (uploadFiles) => {
    try {
      await onUpload(uploadFiles, currentDirectory)
      setIsUploadModalOpen(false)
    } catch (error) {
      alert('Upload failed: ' + error.message)
    }
  }

  const handleCreateDirectory = async () => {
    if (!newDirName.trim()) return
    
    try {
      await onCreateDirectory(newDirName.trim(), currentDirectory)
      setNewDirName('')
      setIsCreateDirModalOpen(false)
    } catch (error) {
      alert('Failed to create directory: ' + error.message)
    }
  }

  const handleFileSelect = (file, isSelected) => {
    if (isSelected) {
      onSelectedFilesChange([...selectedFiles, file._id])
    } else {
      onSelectedFilesChange(selectedFiles.filter(id => id !== file._id))
    }
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      onSelectedFilesChange([])
    } else {
      onSelectedFilesChange(filteredFiles.map(file => file._id))
    }
  }

  const handlePreview = (file) => {
    setPreviewFile(file)
    setIsPreviewModalOpen(true)
  }

  const handleRename = (file) => {
    setRenamingFile(file)
    setNewFileName(file.originalName)
  }

  const handleRenameSubmit = async () => {
    if (!newFileName.trim() || !renamingFile) return
    
    try {
      await onRenameFile(renamingFile._id, newFileName.trim())
      setRenamingFile(null)
      setNewFileName('')
    } catch (error) {
      alert('Failed to rename file: ' + error.message)
    }
  }

  const getBreadcrumbs = () => {
    const parts = currentDirectory.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Root', path: '/' }]
    
    let currentPath = ''
    parts.forEach(part => {
      currentPath += '/' + part
      breadcrumbs.push({ name: part, path: currentPath })
    })
    
    return breadcrumbs
  }

  const filteredFiles = files.filter(file => {
    // Search filter
    if (searchQuery && !file.originalName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (filterType !== 'all') {
      const fileType = getFileType(file.originalName)
      if (fileType !== filterType) {
        return false
      }
    }
    
    return true
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'name':
        aValue = a.originalName.toLowerCase()
        bValue = b.originalName.toLowerCase()
        break
      case 'date':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'size':
        aValue = a.size
        bValue = b.size
        break
      case 'type':
        aValue = getFileType(a.originalName)
        bValue = getFileType(b.originalName)
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const currentDirData = directories.find(dir => dir.path === currentDirectory)
  const subdirectories = directories.filter(dir => dir.parentDirectory === currentDirectory)

  return (
    <div className="space-y-6">
      {/* Storage Stats */}
      {storageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📁</div>
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-xl font-semibold">{storageStats.totalFiles}</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💾</div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-xl font-semibold">{formatFileSize(storageStats.totalSize)}</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📂</div>
              <div>
                <p className="text-sm text-gray-600">Directories</p>
                <p className="text-xl font-semibold">{storageStats.totalDirectories}</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🖼️</div>
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-xl font-semibold">{storageStats.imageCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary"
            >
              📤 Upload Files
            </button>
            <button
              onClick={() => setIsCreateDirModalOpen(true)}
              className="btn-secondary"
            >
              📁 New Folder
            </button>
            {selectedFiles.length > 0 && (
              <>
                <button
                  onClick={() => onBulkDelete(selectedFiles)}
                  className="btn-danger"
                >
                  🗑️ Delete ({selectedFiles.length})
                </button>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkMove(selectedFiles, e.target.value)
                    }
                  }}
                  className="form-input"
                  defaultValue=""
                >
                  <option value="">Move to...</option>
                  {directories.map(dir => (
                    <option key={dir._id} value={dir.path}>
                      {dir.path === '/' ? 'Root' : dir.path}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="form-input w-48"
              />
              <select
                value={filterType}
                onChange={(e) => onFilterChange(e.target.value)}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="archive">Archives</option>
                <option value="code">Code</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {getBreadcrumbs().map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => onDirectoryChange(crumb.path)}
              className={`hover:text-blue-600 ${
                crumb.path === currentDirectory ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="admin-card">
          {Object.entries(uploadProgress).map(([dir, progress]) => (
            <div key={dir} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading to {dir === '/' ? 'Root' : dir}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      <div className="admin-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p>Loading files...</p>
          </div>
        ) : (
          <>
            {/* Subdirectories */}
            {subdirectories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Folders</h4>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
                  {subdirectories.map((dir) => (
                    <div
                      key={dir._id}
                      className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                        viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'
                      }`}
                      onDoubleClick={() => onDirectoryChange(dir.path)}
                    >
                      <div className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                        <div className="text-2xl">{FILE_ICONS.folder}</div>
                        <div className={viewMode === 'grid' ? 'mt-2' : ''}>
                          <p className="font-medium text-sm truncate">{dir.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(dir.createdAt)}</p>
                        </div>
                      </div>
                      {viewMode === 'list' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteDirectory(dir._id)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {sortedFiles.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Files ({sortedFiles.length})</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === sortedFiles.length}
                        onChange={handleSelectAll}
                        className="mr-2"
                      />
                      Select All
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="form-input text-sm"
                      >
                        <option value="name">Name</option>
                        <option value="date">Date</option>
                        <option value="size">Size</option>
                        <option value="type">Type</option>
                      </select>
                      <button
                        onClick={() => onSortChange(sortBy)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'} ${
                    isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4' : ''
                  }`}
                >
                  {sortedFiles.map((file) => (
                    <div
                      key={file._id}
                      className={`border rounded-lg p-3 hover:bg-gray-50 ${
                        selectedFiles.includes(file._id) ? 'border-blue-500 bg-blue-50' : ''
                      } ${viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'}`}
                    >
                      <div className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file._id)}
                          onChange={(e) => handleFileSelect(file, e.target.checked)}
                          className={viewMode === 'grid' ? 'absolute top-2 left-2' : 'mr-3'}
                        />
                        <div className="text-2xl">{getFileIcon(file.originalName)}</div>
                        <div className={viewMode === 'grid' ? 'mt-2' : ''}>
                          <p className="font-medium text-sm truncate" title={file.originalName}>
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {viewMode === 'list' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(file)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleRename(file)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteFile(file._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                      
                      {viewMode === 'grid' && (
                        <div className="mt-2 flex justify-center gap-1">
                          <button
                            onClick={() => handlePreview(file)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleRename(file)}
                            className="text-gray-500 hover:text-gray-700 text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteFile(file._id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>No files found in this directory</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try adjusting your search or filter</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Upload Files</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-4xl mb-2">📤</div>
                <p className="text-lg mb-2">Drag and drop files here</p>
                <p className="text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Uploading to: <strong>{currentDirectory === '/' ? 'Root' : currentDirectory}</strong></p>
                <p>Maximum file size: 10MB per file</p>
                <p>Supported formats: Images, Videos, Audio, Documents, Archives</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Directory Modal */}
      {isCreateDirModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Folder</h3>
              <button
                onClick={() => setIsCreateDirModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newDirName}
                  onChange={(e) => setNewDirName(e.target.value)}
                  className="form-input"
                  placeholder="Enter folder name"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateDirectory()}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Creating in: <strong>{currentDirectory === '/' ? 'Root' : currentDirectory}</strong></p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsCreateDirModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDirectory}
                  className="btn-primary"
                  disabled={!newDirName.trim()}
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {isPreviewModalOpen && previewFile && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{previewFile.originalName}</h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                {getFileType(previewFile.originalName) === 'image' ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.originalName}
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                ) : getFileType(previewFile.originalName) === 'video' ? (
                  <video
                    src={previewFile.url}
                    controls
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                ) : getFileType(previewFile.originalName) === 'audio' ? (
                  <audio
                    src={previewFile.url}
                    controls
                    className="w-full"
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">{getFileIcon(previewFile.originalName)}</div>
                    <p className="text-lg">{previewFile.originalName}</p>
                    <p className="text-gray-500">Preview not available for this file type</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>File Size:</strong> {formatFileSize(previewFile.size)}
                </div>
                <div>
                  <strong>Type:</strong> {getFileType(previewFile.originalName)}
                </div>
                <div>
                  <strong>Created:</strong> {formatDate(previewFile.createdAt)}
                </div>
                <div>
                  <strong>Directory:</strong> {previewFile.directory || '/'}
                </div>
              </div>
              
              <div className="flex justify-center space-x-2">
                <a
                  href={previewFile.url}
                  download={previewFile.originalName}
                  className="btn-primary"
                >
                  📥 Download
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewFile.url)
                    alert('URL copied to clipboard!')
                  }}
                  className="btn-secondary"
                >
                  📋 Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingFile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Rename File</h3>
              <button
                onClick={() => setRenamingFile(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="form-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setRenamingFile(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameSubmit}
                  className="btn-primary"
                  disabled={!newFileName.trim()}
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}