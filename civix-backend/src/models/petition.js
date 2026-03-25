const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'under_review', 'closed'],
        default: 'under_review',
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    officialResponse: {
        type: String,
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    respondedAt: {
        type: Date,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster querying
petitionSchema.index({ location: 1 });
petitionSchema.index({ category: 1 });
petitionSchema.index({ status: 1 });

// Virtual field for signature count
petitionSchema.virtual('signatureCount', {
    ref: 'Signature',
    localField: '_id',
    foreignField: 'petition',
    count: true // only get the number of docs instead of populating them
});

module.exports = mongoose.model('Petition', petitionSchema);
