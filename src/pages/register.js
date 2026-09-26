import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Mail, Phone, Lock, User, Calendar, ArrowRight, CheckCircle2, ChevronLeft, Gift } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: router.query.email || '',
    mobile: '',
    password: '',
    confirmPassword: '',
    profileName: router.query.name || '',
    age: '',
    gender: '',
    purposeOnApp: '',
    referralCode: router.query.ref || '',
    provider: router.query.provider || '',
    providerId: router.query.providerId || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isSocialLogin = !!router.query.provider;

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.email) { setError('Email is required'); return; }
      if (!isSocialLogin) {
        if (!formData.password || !formData.confirmPassword) {
          setError('Please fill all required fields'); return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match'); return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters'); return;
        }
      }
    } else if (step === 2) {
      if (!formData.profileName || !formData.age || !formData.gender) {
        setError('Please fill all required fields'); return;
      }
      if (formData.age < 18) {
        setError('You must be 18 or older to register'); return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.purposeOnApp) { setError('Please select your purpose on the app'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change"));
      router.push('/complete-profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { color: '#111827', WebkitTextFillColor: '#111827', backgroundColor: '#f9fafb' };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-5 w-full h-1 bg-gray-100 rounded-full z-0"></div>
        <div
          className="absolute left-0 top-5 h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${
              step >= s
                ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white scale-110'
                : 'bg-white text-gray-400 border-2 border-gray-200'
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span className={`text-xs font-semibold ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
              {s === 1 ? 'Account' : s === 2 ? 'Profile' : 'Purpose'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Create Account - MeetStreet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">

        {/* ── Left Panel (hidden on mobile, visible on lg+) ── */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden flex-col justify-center p-10 xl:p-14 min-h-screen">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          {/* Hero Text - no logo, vertically centered */}
          <div className="relative z-10 text-white space-y-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
              Start your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-100 to-white">
                incredible journey
              </span>
            </h1>
            <p className="text-base xl:text-lg text-white/75 max-w-sm leading-relaxed">
              Connect with amazing people around you, offer your time, or find the perfect company for any occasion.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {['bg-orange-200', 'bg-rose-200', 'bg-purple-200'].map((c, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${c}`}></div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-orange-600 font-bold text-xs">10k+</div>
              </div>
              <p className="text-sm font-medium text-white/90">Join thousands of users today</p>
            </div>
          </div>
        </div>

        {/* ── Right: Form Section ── */}
        <div className="flex-1 flex flex-col justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-10 xl:px-16 bg-gray-50">

          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-2xl font-black text-lg shadow-lg mb-3">
              MS
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Join the MeetStreet community</p>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 sm:p-8 lg:p-10">

            <StepIndicator />

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {error}
                </div>
              )}

              {/* ── STEP 1: Account ── */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email" name="email" required
                        value={formData.email} onChange={handleChange}
                        style={inputStyle}
                        className="pl-10 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile <span className="font-normal text-gray-400">(Optional)</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel" name="mobile"
                        value={formData.mobile} onChange={handleChange}
                        style={inputStyle}
                        className="pl-10 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>


                  {/* Password - hidden for Google OAuth */}
                  {!isSocialLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="password" name="password" required
                            value={formData.password} onChange={handleChange}
                            style={inputStyle}
                            className="pl-10 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="At least 6 characters"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="password" name="confirmPassword" required
                            value={formData.confirmPassword} onChange={handleChange}
                            style={inputStyle}
                            className="pl-10 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Re-enter your password"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {isSocialLogin && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-sm text-green-700 font-medium">Signed in with Google — no password needed!</p>
                    </div>
                  )}

                  {/* Referral */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Referral Code <span className="font-normal text-gray-400">(Optional)</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Gift className="h-4 w-4 text-orange-400" />
                      </div>
                      <input
                        type="text" name="referralCode"
                        value={formData.referralCode} onChange={handleChange}
                        style={{ ...inputStyle, backgroundColor: '#fff7ed' }}
                        className="pl-10 w-full py-3 px-4 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Have an invite code?"
                      />
                    </div>
                    <p className="mt-1 text-xs text-orange-600 ml-1">Get 50 extra coins with a referral code!</p>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Profile ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text" name="profileName" required
                        value={formData.profileName} onChange={handleChange}
                        style={inputStyle}
                        className="pl-10 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="How should others call you?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number" name="age" required min="18" max="100"
                        value={formData.age} onChange={handleChange}
                        style={inputStyle}
                        className="pl-10 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Must be 18 or older"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400 ml-1">You must be 18+ to use MeetStreet</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender *</label>
                    <select
                      name="gender" required
                      value={formData.gender} onChange={handleChange}
                      style={{ color: '#111827', WebkitTextFillColor: '#111827', backgroundColor: '#f9fafb' }}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Purpose ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-4">What brings you to MeetStreet? *</label>
                    <div className="space-y-3">
                      {[
                        { value: 'offering-time-company', label: 'Offering Time & Company', desc: 'Earn coins by meeting people' },
                        { value: 'looking-for-time-company', label: 'Looking for Company', desc: 'Meet people and spend coins' },
                        { value: 'both', label: 'Both', desc: 'Open to offering and seeking' },
                      ].map(({ value, label, desc }) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 items-center justify-between gap-3 ${
                            formData.purposeOnApp === value
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300 bg-white'
                          }`}
                        >
                          <input type="radio" name="purposeOnApp" value={value} checked={formData.purposeOnApp === value} onChange={handleChange} className="sr-only" />
                          <div>
                            <p className={`font-bold text-sm ${formData.purposeOnApp === value ? 'text-orange-900' : 'text-gray-900'}`}>{label}</p>
                            <p className={`text-xs mt-0.5 ${formData.purposeOnApp === value ? 'text-orange-600' : 'text-gray-500'}`}>{desc}</p>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.purposeOnApp === value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                          }`}>
                            {formData.purposeOnApp === value && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 p-4 rounded-2xl flex gap-3 items-start">
                    <div className="bg-orange-500 p-1.5 rounded-full text-white shrink-0 mt-0.5">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Welcome Bonus!</h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Get <strong>100 free coins</strong> when you complete registration.
                        {formData.referralCode && <span className="text-orange-600 font-semibold"> + 50 referral bonus!</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Buttons ── */}
              <div className={`flex gap-3 mt-6 ${step > 1 ? 'flex-row' : ''}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-3 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-1 border border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : step === 3 ? (
                    'Complete Registration'
                  ) : (
                    <>Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>

            {/* Sign in link */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}