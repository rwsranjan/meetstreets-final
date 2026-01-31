import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Meeting Type
  meetingType: {
    type: String,
    enum: ['coffee', 'movie', 'travel', 'transit-company', 'online-chat', 'online-video'],
    required: true
  },
  
  // Location for in-person meets
  location: {
    name: String,
    address: String,
    city: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  
  // Meeting Details
  scheduledDate: Date,
  actualMeetDate: Date,
  duration: Number, // in minutes
  
  // Coins Exchange
  coinsOffered: {
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  coinsAccepted: {
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['proposed', 'accepted', 'rejected', 'completed', 'cancelled', 'in-progress'],
    default: 'proposed'
  },
  
  // Completion & Feedback
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Ratings
  ratings: [{
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // First Date Suggestion (AI)
  firstDateSuggestion: {
    venue: String,
    activity: String,
    estimatedCost: Number
  },
  
  // Transaction
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
}, {
  timestamps: true
});

// Indexes
meetingSchema.index({ participants: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ scheduledDate: 1 });
meetingSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);