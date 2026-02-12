import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    profileName: '',
    age: '',
    gender: '',
    purposeOnApp: '',
    referralCode: router.query.ref || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    } else if (step === 2) {
      if (!formData.profileName || !formData.age || !formData.gender) {
        setError('Please fill all fields');
        return;
      }
      if (formData.age < 18) {
        setError('You must be 18 or older to register');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.purposeOnApp) {
      setError('Please select your purpose on the app');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
window.dispatchEvent(new Event("auth-change"));

      // Redirect to complete profile
      router.push('/complete-profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - MeetStreet</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-orange-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-md mx-auto">
              <span>Account</span>
              <span>Profile</span>
              <span>Purpose</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">
                {step === 1 && 'Create Account'}
                {step === 2 && 'Basic Profile'}
                {step === 3 && 'Your Purpose'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 1 && 'Start your journey on MeetStreet'}
                {step === 2 && 'Tell us about yourself'}
                {step === 3 && 'What brings you here?'}
              </p>
            </div>

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Account Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Re-enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter referral code to earn bonus coins"
                    />
                    <p className="mt-1 text-xs text-gray-500">Get 50 extra coins with a referral code!</p>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Name *
                    </label>
                    <input
                      type="text"
                      name="profileName"
                      required
                      value={formData.profileName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="How should others call you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      required
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Must be 18 or older"
                    />
                    <p className="mt-1 text-xs text-gray-500">You must be 18 years or older to use MeetStreet</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Purpose */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      What's your purpose on MeetStreet? *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                        <input
                          type="radio"
                          name="purposeOnApp"
                          value="offering-time-company"
                          checked={formData.purposeOnApp === 'offering-time-company'}
                          onChange={handleChange}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">Offering Time & Company</div>
                          <div className="text-sm text-gray-500">I want to earn coins by meeting people</div>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                        <input
                          type="radio"
                          name="purposeOnApp"
                          value="looking-for-time-company"
                          checked={formData.purposeOnApp === 'looking-for-time-company'}
                          onChange={handleChange}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">Looking for Time & Company</div>
                          <div className="text-sm text-gray-500">I want to meet people and offer coins</div>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                        <input
                          type="radio"
                          name="purposeOnApp"
                          value="both"
                          checked={formData.purposeOnApp === 'both'}
                          onChange={handleChange}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">Both</div>
                          <div className="text-sm text-gray-500">I'm open to both offering and seeking company</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Welcome Bonus:</strong> Get 100 coins when you complete registration!
                      {formData.referralCode && ' + 50 bonus coins from referral!'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Account...' : step === 3 ? 'Create Account' : 'Next'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-orange-500 hover:text-orange-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}