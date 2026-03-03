const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({
    petition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Petition',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate signatures on the same petition by the same user
signatureSchema.index({ petition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Signature', signatureSchema);
