import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =====================
    // Authentication
    // =====================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      }
    },
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },

    // =====================
    // Profile
    // =====================
    profileName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 18
    },
    showAge: {
      type: Boolean,
      default: true
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "prefer-not-to-say", "other"],
      required: true
    },

    // =====================
    // Address & Location
    // =====================
 address: {
  street: String,
  city: String,
  locality: String,
  state: String,
  country: String,
  pincode: String,
  coordinates: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: {
      type: [Number] // [lng, lat]
    }
  }
},


    // =====================
    // Appearance
    // =====================
    height: String,
    ethnicBackground: String,

    // =====================
    // Education & Career
    // =====================
    education: {
      type: String,
      enum: ["high-school", "bachelors", "masters", "phd", "other"]
    },
    degreeType: String,

    // =====================
    // Dating Preferences
    // =====================
    lookingFor: {
      type: String,
      enum: [
        "long-term",
        "casual",
        "not-sure",
        "marriage",
        "friendship",
        "travel-companion"
      ]
    },
  wantKids: {
  type: String,
  enum: ["yes", "no", "maybe", "have-kids"],
  default: null,
  set: v => v === '' ? null : v  // <-- this converts "" to null automatically
},


    // =====================
    // Lifestyle
    // =====================
    religiousBeliefs: String,
    exerciseHabits: {
      type: String,
      enum: ["daily", "weekly", "occasionally", "never"]
    },
    eatingHabits: {
      type: String,
      enum: ["vegetarian", "vegan", "non-vegetarian", "pescatarian", "other"]
    },

    // =====================
    // Interests
    // =====================
    hobbies: [String],
    politicalViews: String,
    favoriteFood: [String],
    favoriteMusic: [String],
    favoriteMovies: [String],
    favoriteTVShows: [String],
    favoriteBooks: [String],

    // =====================
    // Media
    // =====================
    profilePictures: [
      {
        url: String,
        isPrimary: Boolean,
        uploadedAt: Date
      }
    ],
    profileVideo: {
      url: String,
      uploadedAt: Date
    },

    // =====================
    // App Settings
    // =====================
    ageRange: {
      type: String,
      enum: ["18-25", "26-30", "31-40", "40-50", "50+"],
      required: true
    },
    interestsMeta: {
      favoritePlaceToMeet: String,
      travelerType: {
        type: String,
        enum: ["business", "leisure", "spiritual", "adventure", "cultural"]
      }
    },
    purposeOnApp: {
      type: String,
      enum: ["offering-time-company", "looking-for-time-company", "both"],
      required: true
    },

    // =====================
    // Verification
    // =====================
    isKYCVerified: {
      type: Boolean,
      default: false
    },

    // =====================
    // Subscription
    // =====================
    subscriptionType: {
      type: String,
      enum: ["free", "regular", "premium"],
      default: "free"
    },
    subscriptionExpiry: Date,

    // =====================
    // Rewards & Referrals
    // =====================
    coins: { type: Number, default: 0 },
    welcomePoints: { type: Number, default: 100 },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    totalReferrals: {
      type: Number,
      default: 0
    },

    // =====================
    // Activity & Status
    // =====================
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,

    // =====================
    // Admin
    // =====================
    isBanned: { type: Boolean, default: false },
    banReason: String
  },
  { timestamps: true }
);

// =====================
// Indexes (SAFE & CLEAN)
// =====================
userSchema.index(
  { "address.coordinates": "2dsphere" },
  {
    partialFilterExpression: {
      "address.coordinates.coordinates": { $type: "array" }
    }
  }
);

userSchema.index({ subscriptionType: 1 });
userSchema.index({ "address.city": 1, "address.locality": 1 });

// =====================
// Referral Code Generator
// =====================
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  next();
});

function generateReferralCode() {
  return "MS" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default mongoose.models.User || mongoose.model("User", userSchema);
