import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message Content
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'coin-offer', 'meet-request'],
    default: 'text'
  },
  
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  
  // Media
  mediaUrl: String,
  mediaType: String,
  mediaThumbnail: String,
  
  // AI Suggestions
  aiSuggestion: {
    type: Boolean,
    default: false
  },
  
  // Special message types
  coinOffer: {
    amount: Number,
    purpose: String
  },
  
  meetRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  
  // Status
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Deleted
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ read: 1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);