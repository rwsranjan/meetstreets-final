import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transaction Type
  type: {
    type: String,
    enum: [
      'deposit',
      'withdrawal',
      'meet-payment',
      'meet-received',
      'referral-bonus',
      'welcome-bonus',
      'subscription-payment',
      'admin-credit',
      'admin-debit'
    ],
    required: true
  },
  
  // Amount
  amount: {
    type: Number,
    required: true
  },
  
  // Coins
  coins: {
    type: Number,
    required: true
  },
  
  // Related entities
  relatedMeeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['paytm', 'upi', 'bank-transfer', 'coins-only']
  },
  paymentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Fee
  platformFee: {
    type: Number,
    default: 0
  },
  netAmount: Number,
  
  // Withdrawal specific
  withdrawalDetails: {
    method: String,
    accountDetails: mongoose.Schema.Types.Mixed,
    processedAt: Date,
    transactionId: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Description
  description: String,
  
  // Admin notes
  adminNotes: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentId: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);