import mongoose from 'mongoose';

const activityImageSchema = new mongoose.Schema({
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: [true, "Activity ID is required"]
    },
    activity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: [true, "Activity ID is required"]
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
activityImageSchema.index({ activityId: 1, sortOrder: 1 });
activityImageSchema.index({ activityId: 1, isPrimary: 1 });
activityImageSchema.index({ activity_id: 1, sort_order: 1 });
activityImageSchema.index({ activity_id: 1, is_primary: 1 });

// Pre-save hook to ensure only one primary image per activity
activityImageSchema.pre("save", async function(next) {
    // Sync the dual field names
    if (this.activityId) this.activity_id = this.activityId;
    if (this.activity_id) this.activityId = this.activity_id;
    if (this.filePath) this.file_path = this.filePath;
    if (this.file_path) this.filePath = this.file_path;
    if (this.isPrimary !== undefined) this.is_primary = this.isPrimary;
    if (this.is_primary !== undefined) this.isPrimary = this.is_primary;
    if (this.sortOrder !== undefined) this.sort_order = this.sortOrder;
    if (this.sort_order !== undefined) this.sortOrder = this.sort_order;

    if (this.isPrimary && this.isModified("isPrimary")) {
        // Remove primary flag from other images of the same activity
        await this.constructor.updateMany(
            { 
                activityId: this.activityId, 
                _id: { $ne: this._id } 
            },
            { $set: { isPrimary: false, is_primary: false } }
        );
    }
    next();
});

export default mongoose.models.ActivityImage || mongoose.model('ActivityImage', activityImageSchema);