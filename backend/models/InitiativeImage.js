import mongoose from 'mongoose';

const initiativeImageSchema = new mongoose.Schema({
    initiativeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Initiative",
        required: [true, "Initiative ID is required"]
    },
    initiative_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Initiative",
        required: [true, "Initiative ID is required"]
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
initiativeImageSchema.index({ initiativeId: 1, sortOrder: 1 });
initiativeImageSchema.index({ initiativeId: 1, isPrimary: 1 });
initiativeImageSchema.index({ initiative_id: 1, sort_order: 1 });
initiativeImageSchema.index({ initiative_id: 1, is_primary: 1 });

// Pre-save hook to ensure only one primary image per initiative
initiativeImageSchema.pre("save", async function(next) {
    // Sync the dual field names
    if (this.initiativeId) this.initiative_id = this.initiativeId;
    if (this.initiative_id) this.initiativeId = this.initiative_id;
    if (this.filePath) this.file_path = this.filePath;
    if (this.file_path) this.filePath = this.file_path;
    if (this.isPrimary !== undefined) this.is_primary = this.isPrimary;
    if (this.is_primary !== undefined) this.isPrimary = this.is_primary;
    if (this.sortOrder !== undefined) this.sort_order = this.sortOrder;
    if (this.sort_order !== undefined) this.sortOrder = this.sort_order;

    if (this.isPrimary && this.isModified("isPrimary")) {
        // Remove primary flag from other images of the same initiative
        await this.constructor.updateMany(
            { 
                initiativeId: this.initiativeId, 
                _id: { $ne: this._id } 
            },
            { $set: { isPrimary: false, is_primary: false } }
        );
    }
    next();
});

export default mongoose.models.InitiativeImage || mongoose.model('InitiativeImage', initiativeImageSchema);