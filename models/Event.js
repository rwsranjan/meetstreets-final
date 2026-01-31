import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Event Creator
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Event Type
  eventType: {
    type: String,
    enum: ['coffee-meetup', 'group-hangout', 'travel-group', 'movie-night', 'sports', 'workshop', 'other'],
    required: true
  },
  
  // Location
  location: {
    name: String,
    address: String,
    city: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  
  // Date & Time
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: String,
  duration: Number, // in hours
  
  // Participants
  maxParticipants: Number,
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'maybe', 'cancelled'],
      default: 'confirmed'
    }
  }],
  
  // Entry Fee/Coins
  entryCoins: {
    type: Number,
    default: 0
  },
  
  // Images
  coverImage: String,
  images: [String],
  
  // Status
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Tags
  tags: [String],
  
  // Privacy
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'location.city': 1 });

export default mongoose.models.Event || mongoose.model('Event', eventSchema);