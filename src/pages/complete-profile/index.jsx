"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Camera, Upload, MapPin, Heart, Book, Music, Film, Utensils } from 'lucide-react';

export default function CompleteProfile() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Physical Appearance
    height: '',
    ethnicBackground: '',
    
    // Education & Career
    education: '',
    degreeType: '',
    
    // Location
    city: '',
    locality: '',
    state: '',
    country: '',
    latitude: null,
    longitude: null,
    
    // Personal Values
    wantKids: '',
    religiousBeliefs: '',
    exerciseHabits: '',
    eatingHabits: '',
    
    // Interests
    hobbies: [],
    favoriteFood: [],
    favoriteMusic: [],
    favoriteMovies: [],
    
    // App Specific
    favoritePlaceToMeet: '',
    travelerType: '',
    
    // Profile Pictures
    profilePictures: []
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    // TODO: Implement actual upload to Cloudinary
    // For now, create local URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      profilePictures: [...prev.profilePictures, ...urls].slice(0, 6)
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          // TODO: Reverse geocode to get city/locality
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.city || !formData.locality) {
        setError('Please enter your city and locality');
        return;
      }
    } else if (step === 2) {
      if (formData.hobbies.length === 0) {
        setError('Please select at least one interest');
        return;
      }
    } else if (step === 3) {
      if (formData.profilePictures.length === 0) {
        setError('Please upload at least one profile picture');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete profile');
      }

      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hobbyOptions = [
    'Coffee', 'Travel', 'Movies', 'Music', 'Reading', 'Sports', 
    'Cooking', 'Photography', 'Art', 'Gaming', 'Hiking', 'Yoga'
  ];

  const musicGenres = [
    'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 
    'Country', 'R&B', 'Indie', 'Metal'
  ];

  const cuisines = [
    'Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican', 'Thai', 
    'Mediterranean', 'American', 'Korean', 'Vietnamese'
  ];

  return (
    <>
      <Head>
        <title>Complete Your Profile - MeetStreet</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/50' 
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`w-20 h-1 mx-2 transition-all ${
                      step > s ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gray-800'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-400 max-w-lg mx-auto px-4">
              <span>Location</span>
              <span>Interests</span>
              <span>Photos</span>
              <span>Details</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {step === 1 && 'Your Location'}
                {step === 2 && 'Your Interests'}
                {step === 3 && 'Profile Pictures'}
                {step === 4 && 'Final Details'}
              </h2>
              <p className="mt-2 text-gray-400">
                {step === 1 && 'Help others find you nearby'}
                {step === 2 && 'What do you enjoy doing?'}
                {step === 3 && 'Show your personality'}
                {step === 4 && 'Almost done!'}
              </p>
            </div>

            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Location */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <MapPin size={16} />
                      Use current location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Locality *
                      </label>
                      <input
                        type="text"
                        name="locality"
                        required
                        value={formData.locality}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Bandra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Maharashtra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., India"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      <strong className="text-gray-300">Privacy Note:</strong> Your exact address will never be shown. 
                      Only your city and locality will be visible to other users.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      What are your hobbies? * (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {hobbyOptions.map((hobby) => (
                        <button
                          key={hobby}
                          type="button"
                          onClick={() => handleMultiSelect('hobbies', hobby.toLowerCase())}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.hobbies.includes(hobby.toLowerCase())
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          {hobby}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Favorite Music Genres
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {musicGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleMultiSelect('favoriteMusic', genre)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.favoriteMusic.includes(genre)
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <Music size={16} className="inline mr-1" />
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Favorite Cuisines
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          type="button"
                          onClick={() => handleMultiSelect('favoriteFood', cuisine)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.favoriteFood.includes(cuisine)
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <Utensils size={16} className="inline mr-1" />
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Favorite Place to Meet
                      </label>
                      <select
                        name="favoritePlaceToMeet"
                        value={formData.favoritePlaceToMeet}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="coffee-shop">Coffee Shop</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="park">Park</option>
                        <option value="mall">Mall</option>
                        <option value="bar">Bar/Pub</option>
                        <option value="outdoor">Outdoor/Nature</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Traveler Type
                      </label>
                      <select
                        name="travelerType"
                        value={formData.travelerType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="business">Business</option>
                        <option value="leisure">Leisure</option>
                        <option value="spiritual">Spiritual</option>
                        <option value="adventure">Adventure</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Photos */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Upload Profile Pictures * (Max 6)
                    </label>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {formData.profilePictures.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 border-2 border-orange-500">
                          <img src={url} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                profilePictures: prev.profilePictures.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {formData.profilePictures.length < 6 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-700 hover:border-orange-500 bg-gray-800 hover:bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer transition-all group">
                          <Upload size={32} className="text-gray-600 group-hover:text-orange-400 mb-2" />
                          <span className="text-sm text-gray-500 group-hover:text-gray-400">Add Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                      <p className="text-sm text-blue-300">
                        <strong>Tips for great photos:</strong>
                      </p>
                      <ul className="text-sm text-blue-200 mt-2 space-y-1 list-disc list-inside">
                        <li>Use recent, clear photos</li>
                        <li>Show your face clearly</li>
                        <li>Include variety (close-up, full body, activities)</li>
                        <li>Smile and be yourself!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Final Details */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Height
                      </label>
                      <input
                        type="text"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., 5'8\ or 173cm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Education Level
                      </label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="high-school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Exercise Habits
                      </label>
                      <select
                        name="exerciseHabits"
                        value={formData.exerciseHabits}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="occasionally">Occasionally</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Eating Habits
                      </label>
                      <select
                        name="eatingHabits"
                        value={formData.eatingHabits}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="non-vegetarian">Non-Vegetarian</option>
                        <option value="pescatarian">Pescatarian</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border border-orange-500/50 rounded-lg p-6 text-center">
                    <p className="text-orange-300 font-semibold mb-2">
                      🎉 You're almost done!
                    </p>
                    <p className="text-gray-300 text-sm">
                      Complete your profile to start connecting with amazing people nearby.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 px-4 border border-gray-700 rounded-lg text-gray-300 font-medium hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-600/30"
                >
                  {loading ? 'Saving...' : step === 4 ? 'Complete Profile' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}