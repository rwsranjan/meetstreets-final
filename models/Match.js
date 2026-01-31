import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Match Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'matched'],
    default: 'pending'
  },
  
  // Who initiated the match
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // AI Match Score
  aiMatchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Common interests identified by AI
  commonInterests: [String],
  
  // Request details
  requestMessage: String,
  responseMessage: String,
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  matchedAt: Date,
  
  // Meet Details
  hasMet: {
    type: Boolean,
    default: false
  },
  meetDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  }
}, {
  timestamps: true
});

// Indexes
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ status: 1 });
matchSchema.index({ aiMatchScore: -1 });

export default mongoose.models.Match || mongoose.model('Match', matchSchema);