import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Report Type
  reportType: {
    type: String,
    enum: [
      'inappropriate-behavior',
      'harassment',
      'fake-profile',
      'spam',
      'safety-concern',
      'scam',
      'inappropriate-content',
      'other'
    ],
    required: true
  },
  
  // Details
  description: {
    type: String,
    required: true
  },
  
  // Evidence
  screenshots: [String],
  relatedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'under-review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  
  // Admin Actions
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  adminNotes: String,
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'temporary-ban', 'permanent-ban', 'profile-removal']
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.models.Report || mongoose.model('Report', reportSchema);