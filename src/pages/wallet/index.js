// app/wallet/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
  Coins, TrendingUp, TrendingDown, Download, Upload, 
  Check, Copy, X, QrCode, CreditCard, History 
} from 'lucide-react';

export default function Wallet() {
  const router = useRouter();
  const [balance, setBalance] = useState({ coins: 0, totalBalance: 0, welcomePoints: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadWalletData();
  }, [page]);

  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load balance
      const balanceRes = await fetch('/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(data);
      }

      // Load transactions with pagination
      const txRes = await fetch(`/api/wallet/transactions?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (txRes.ok) {
        const data = await txRes.json();
        if (page === 1) {
          setTransactions(data.transactions || []);
        } else {
          setTransactions(prev => [...prev, ...(data.transactions || [])]);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    if (!depositAmount || depositAmount < 1) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const res = await fetch('/api/payment/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(depositAmount),
          upiId: 'merchant@paytm',
          name: 'MeetStreet'
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 100) {
      alert('Minimum withdrawal amount is ₹100');
      return;
    }

    if (withdrawAmount > balance.totalBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/coins/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseInt(withdrawAmount)
        })
      });
      
      if (res.ok) {
        alert('Withdrawal request submitted! Coins will be processed within 24-48 hours.');
        setShowWithdraw(false);
        setWithdrawAmount('');
        loadWalletData();
      }
    } catch (error) {
      console.error('Failed to withdraw:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
            <p className="text-gray-400">Manage your coins and transactions</p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Balance */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Total Balance</span>
                <Coins className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-1">{balance.totalBalance}</div>
              <div className="text-sm opacity-90">Street Coins</div>
              {balance.welcomePoints > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs opacity-75">Welcome Bonus</div>
                  <div className="text-lg font-semibold">+{balance.welcomePoints} coins</div>
                </div>
              )}
            </div>

            {/* Deposit */}
            <button
              onClick={() => setShowDeposit(true)}
              className="bg-gray-900 border-2 border-green-500/50 hover:border-green-500 rounded-2xl p-6 text-white transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Deposit Coins</span>
                <Upload className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">+ Add Coins</div>
              <div className="text-sm text-gray-400">Via UPI • No fees</div>
            </button>

            {/* Withdraw */}
            <button
              onClick={() => setShowWithdraw(true)}
              className="bg-gray-900 border-2 border-blue-500/50 hover:border-blue-500 rounded-2xl p-6 text-white transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Withdraw</span>
                <Download className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">Cash Out</div>
              <div className="text-sm text-gray-400">Min ₹100 • 2% fee</div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-orange-500 transition-colors text-left">
              <CreditCard className="w-6 h-6 text-orange-400 mb-2" />
              <div className="font-semibold text-white text-sm">Link Bank Account</div>
              <div className="text-xs text-gray-400 mt-1">For withdrawals</div>
            </button>
            
            <button className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-orange-500 transition-colors text-left">
              <History className="w-6 h-6 text-blue-400 mb-2" />
              <div className="font-semibold text-white text-sm">Transaction History</div>
              <div className="text-xs text-gray-400 mt-1">{transactions.length} transactions</div>
            </button>

            <button 
              onClick={() => router.push('/referrals')}
              className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-orange-500 transition-colors text-left"
            >
              <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
              <div className="font-semibold text-white text-sm">Earn Coins</div>
              <div className="text-xs text-gray-400 mt-1">Refer friends</div>
            </button>

            <button className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-orange-500 transition-colors text-left">
              <Coins className="w-6 h-6 text-purple-400 mb-2" />
              <div className="font-semibold text-white text-sm">Gift Coins</div>
              <div className="text-xs text-gray-400 mt-1">Send to friends</div>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <select className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
                <option>All Transactions</option>
                <option>Deposits</option>
                <option>Withdrawals</option>
                <option>Earnings</option>
                <option>Spending</option>
              </select>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <TransactionItem key={tx._id} transaction={tx} />
                  ))}
                </div>

                {hasMore && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="w-full mt-4 py-3 border border-gray-700 hover:border-orange-500 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Deposit Modal */}
      {showDeposit && (
        <Modal onClose={() => {
          setShowDeposit(false);
          setQrCode('');
          setDepositAmount('');
        }}>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Deposit Coins</h3>
            
            {!qrCode ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Enter Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100"
                    min="1"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-semibold focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    1 Coin = ₹1 • No processing fees
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[100, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => setDepositAmount(val.toString())}
                      className="py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:border-orange-500 transition-colors font-semibold"
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    <strong>How it works:</strong> Generate QR code → Scan with any UPI app → 
                    Payment confirmed → Coins added instantly
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeposit(false)}
                    className="flex-1 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateQR}
                    disabled={!depositAmount || depositAmount < 1}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 transition-all"
                  >
                    Generate QR Code
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4 p-4 bg-gray-800 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                </div>
                <p className="text-gray-400 mb-2">Scan with any UPI app</p>
                <p className="text-2xl font-bold text-white mb-1">₹{depositAmount}</p>
                <p className="text-sm text-gray-500 mb-6">
                  Google Pay • PhonePe • Paytm • Any UPI app
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-green-400" />
                    </div>
                    <span>Scan QR code from your UPI app</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-green-400" />
                    </div>
                    <span>Complete payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-green-400" />
                    </div>
                    <span>Coins will be added automatically</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDeposit(false);
                    setQrCode('');
                    setDepositAmount('');
                  }}
                  className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <Modal onClose={() => {
          setShowWithdraw(false);
          setWithdrawAmount('');
        }}>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Withdraw Coins</h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">
                  Withdrawal Amount (₹)
                </label>
                <span className="text-sm text-gray-500">
                  Available: {balance.totalBalance} coins
                </span>
              </div>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="100"
                min="100"
                max={balance.totalBalance}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-semibold focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum: ₹100 • Processing fee: 2%
              </p>
            </div>

            {withdrawAmount >= 100 && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-semibold">₹{withdrawAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee (2%)</span>
                  <span className="text-red-400">-₹{(withdrawAmount * 0.02).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-700 flex justify-between">
                  <span className="text-white font-semibold">You'll Receive</span>
                  <span className="text-green-400 font-bold">₹{(withdrawAmount * 0.98).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-300">
                <strong>Note:</strong> Withdrawals are processed within 24-48 hours. 
                Make sure your bank account is linked.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || withdrawAmount < 100 || withdrawAmount > balance.totalBalance}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Withdraw Now
              </button>
            </div>
          </div>
        </Modal>
      )}

     </div>
  );
}

function TransactionItem({ transaction }) {
  const isPositive = transaction.coins > 0;
  
  const getIcon = () => {
    if (transaction.type === 'deposit' || transaction.type === 'referral-bonus') {
      return <TrendingUp className="text-green-400" size={20} />;
    }
    if (transaction.type === 'withdrawal') {
      return <TrendingDown className="text-red-400" size={20} />;
    }
    if (transaction.type === 'meeting-reward') {
      return <Coins className="text-orange-400" size={20} />;
    }
    return <Coins className="text-gray-400" size={20} />;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${
          isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {getIcon()}
        </div>
        <div>
          <div className="font-medium text-white capitalize">
            {transaction.type.replace(/-/g, ' ')}
          </div>
          <div className="text-sm text-gray-400">
            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      <div className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{transaction.coins}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}