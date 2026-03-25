const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    petition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Petition',
    }
}, { timestamps: true });

// indexes for reporting
adminLogSchema.index({ user: 1 });
adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
