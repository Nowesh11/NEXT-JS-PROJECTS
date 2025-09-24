import mongoose from 'mongoose';

const projectImageSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project ID is required"]
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project ID is required"]
    },
    file_path: {
        type: String,
        required: [true, "File path is required"],
        trim: true
    },
    filePath: {
        type: String,
        required: [true, "File path is required"],
        trim: true
    },
    is_primary: {
        type: Boolean,
        default: false
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    sort_order: {
        type: Number,
        default: 0
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
projectImageSchema.index({ projectId: 1, sortOrder: 1 });
projectImageSchema.index({ projectId: 1, isPrimary: 1 });
projectImageSchema.index({ project_id: 1, sort_order: 1 });
projectImageSchema.index({ project_id: 1, is_primary: 1 });

// Pre-save hook to ensure only one primary image per project
projectImageSchema.pre('save', async function(next) {
    if (this.isPrimary || this.is_primary) {
        // If this image is being set as primary, unset any existing primary images
        await this.constructor.updateMany(
            { 
                projectId: this.projectId || this.project_id,
                _id: { $ne: this._id },
                $or: [{ isPrimary: true }, { is_primary: true }]
            },
            { 
                $set: { isPrimary: false, is_primary: false } 
            }
        );
        
        // Ensure both isPrimary and is_primary are set to true
        this.isPrimary = true;
        this.is_primary = true;
    }
    next();
});

// Ensure both camelCase and snake_case fields are synchronized
projectImageSchema.pre('save', function(next) {
    if (this.isModified('projectId')) {
        this.project_id = this.projectId;
    } else if (this.isModified('project_id')) {
        this.projectId = this.project_id;
    }
    
    if (this.isModified('filePath')) {
        this.file_path = this.filePath;
    } else if (this.isModified('file_path')) {
        this.filePath = this.file_path;
    }
    
    if (this.isModified('isPrimary')) {
        this.is_primary = this.isPrimary;
    } else if (this.isModified('is_primary')) {
        this.isPrimary = this.is_primary;
    }
    
    if (this.isModified('sortOrder')) {
        this.sort_order = this.sortOrder;
    } else if (this.isModified('sort_order')) {
        this.sortOrder = this.sort_order;
    }
    
    next();
});

const ProjectImage = mongoose.models.ProjectImage || mongoose.model('ProjectImage', projectImageSchema);

export default ProjectImage;