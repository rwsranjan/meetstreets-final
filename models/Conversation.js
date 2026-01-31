import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Last Message
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // Unread count per user
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Typing indicators
  typing: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isTyping: {
      type: Boolean,
      default: false
    }
  }],
  
  // Archived or muted
  archived: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  muted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);