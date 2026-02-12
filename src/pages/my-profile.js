"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit, Save, X, MapPin, Heart, Briefcase, Upload, Music, Utensils, Users, Book } from 'lucide-react';

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setFormData({
          ...data.profile,
          // Ensure arrays are properly initialized
          hobbies: data.profile.hobbies || [],
          favoriteFood: data.profile.favoriteFood || [],
          favoriteMusic: data.profile.favoriteMusic || [],
          favoriteMovies: data.profile.favoriteMovies || [],
          profilePictures: data.profile.profilePictures || []
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    address: {
      ...(prev.address || {}),
      [name]: value
    }
  }));
};


  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter(item => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const token = localStorage.getItem('token');
  const formData = new FormData();

  files.forEach(file => formData.append('photos', file));

  const res = await fetch('/api/profile/upload-photo', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  if (res.ok) {
    setFormData(prev => ({
      ...prev,
      profilePictures: data.images.slice(0, 6)
    }));
  }
};

const removePhoto = (index) => {
  setFormData(prev => {
    const updated = [...prev.profilePictures];
    updated.splice(index, 1);
    return { ...prev, profilePictures: updated };
  });
};

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          ...data.user,
          hobbies: data.user.hobbies || [],
          favoriteFood: data.user.favoriteFood || [],
          favoriteMusic: data.user.favoriteMusic || [],
          favoriteMovies: data.user.favoriteMovies || [],
          profilePictures: data.user.profilePictures || []
        });
        setEditing(false);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      ...user,
                      hobbies: user.hobbies || [],
                      favoriteFood: user.favoriteFood || [],
                      favoriteMusic: user.favoriteMusic || [],
                      favoriteMovies: user.favoriteMovies || [],
                      profilePictures: user.profilePictures || []
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-500 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  {/* Main profile picture or initial */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 border-4 border-gray-900 overflow-hidden shadow-xl">
                    {formData?.profilePictures?.[0] ? (
                      <img 
                        src={formData?.profilePictures[0]?.url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {formData?.profileName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full border-2 border-gray-800 hover:border-orange-500 transition-colors cursor-pointer">
                      <Camera size={18} className="text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-20 p-8">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{user?.coins || 0}</div>
                  <div className="text-sm text-gray-400">Coins</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{user?.meetsPerMonth || 0}</div>
                  <div className="text-sm text-gray-400">Meets/Month</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{user?.qualityScore || 0}/5</div>
                  <div className="text-sm text-gray-400">Quality Score</div>
                </div>
              </div>

              {/* Profile Pictures Section - Circular Display */}
              {editing && (
                <div className="mb-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Camera size={20} />
                    Profile Pictures
                  </h3>
                <div className="flex flex-wrap gap-4 items-center">
  {formData.profilePictures?.map((photo, index) => (
    <div key={photo._id || index} className="relative">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-orange-500 shadow-lg">
        <img
          src={photo.url}
          alt={`Profile photo ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {editing && (
        <button
          type="button"
          onClick={() => removePhoto(index)}
          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg shadow-lg"
        >
          ×
        </button>
      )}

      {photo.isPrimary && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
          Primary
        </div>
      )}
    </div>
  ))}

  {editing && formData.profilePictures?.length < 6 && (
    <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-700 hover:border-orange-500 bg-gray-800 hover:bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer transition-all group">
      <Upload size={20} className="text-gray-600 group-hover:text-orange-400 mb-1" />
      <span className="text-xs text-gray-500 group-hover:text-gray-400">
        Add
      </span>
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
                  <p className="text-xs text-gray-500 mt-4">
                    You can upload up to 6 photos. The first photo will be your primary profile picture.
                  </p>
                </div>
              )}

              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Profile Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="profileName"
                        value={formData.profileName || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.profileName}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                    <div className="text-white text-lg">{user?.age} years</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                    <div className="text-white text-lg capitalize">{user?.gender}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Height</label>
                    {editing ? (
                      <input
                        type="text"
                        name="height"
                        value={formData.height || ''}
                        onChange={handleChange}
                        placeholder="e.g., 5'8\ or 173cm"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.height || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ethnic Background</label>
                    {editing ? (
                      <input
                        type="text"
                        name="ethnicBackground"
                        value={formData.ethnicBackground || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.ethnicBackground || 'Not specified'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                    {editing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.address?.city || ''}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.address?.city}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Locality</label>
                    {editing ? (
                      <input
                        type="text"
                        name="locality"
                        value={formData.address?.locality || ''}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.address?.locality}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                    {editing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.address?.state || ''}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.address?.state || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                    {editing ? (
                      <input
                        type="text"
                        name="country"
                        value={formData.address?.country || ''}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.address?.country || 'Not specified'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Education & Career */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Book size={20} />
                  Education & Career
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Education</label>
                    {editing ? (
                      <select
                        name="education"
                        value={formData.education || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="high-school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <div className="text-white text-lg capitalize">{user?.education?.replace('-', ' ') || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Briefcase size={16} className="inline mr-1" />
                      Purpose on App
                    </label>
                    <div className="text-white text-lg capitalize">{user?.purposeOnApp?.replace(/-/g, ' ')}</div>
                  </div>
                </div>
              </div>

              {/* Interests & Hobbies */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart size={20} />
                  Interests & Hobbies
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">Hobbies</label>
                  {editing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {hobbyOptions.map((hobby) => (
                        <button
                          key={hobby}
                          type="button"
                          onClick={() => handleMultiSelect('hobbies', hobby.toLowerCase())}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.hobbies?.includes(hobby.toLowerCase())
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          {hobby}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user?.hobbies?.map((hobby, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700 capitalize">
                          {hobby}
                        </span>
                      ))}
                      {(!user?.hobbies || user.hobbies.length === 0) && (
                        <span className="text-gray-500">No hobbies added</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    <Music size={16} className="inline mr-1" />
                    Favorite Music
                  </label>
                  {editing ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {musicGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleMultiSelect('favoriteMusic', genre)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.favoriteMusic?.includes(genre)
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user?.favoriteMusic?.map((music, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                          <Music size={14} className="inline mr-1" />
                          {music}
                        </span>
                      ))}
                      {(!user?.favoriteMusic || user.favoriteMusic.length === 0) && (
                        <span className="text-gray-500">No music preferences added</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    <Utensils size={16} className="inline mr-1" />
                    Favorite Cuisines
                  </label>
                  {editing ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {cuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          type="button"
                          onClick={() => handleMultiSelect('favoriteFood', cuisine)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.favoriteFood?.includes(cuisine)
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user?.favoriteFood?.map((food, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                          <Utensils size={14} className="inline mr-1" />
                          {food}
                        </span>
                      ))}
                      {(!user?.favoriteFood || user.favoriteFood.length === 0) && (
                        <span className="text-gray-500">No food preferences added</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lifestyle & Preferences */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Lifestyle & Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Exercise Habits</label>
                    {editing ? (
                      <select
                        name="exerciseHabits"
                        value={formData.exerciseHabits || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="occasionally">Occasionally</option>
                        <option value="never">Never</option>
                      </select>
                    ) : (
                      <div className="text-white text-lg capitalize">{user?.exerciseHabits || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Eating Habits</label>
                    {editing ? (
                      <select
                        name="eatingHabits"
                        value={formData.eatingHabits || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="non-vegetarian">Non-Vegetarian</option>
                        <option value="pescatarian">Pescatarian</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <div className="text-white text-lg capitalize">{user?.eatingHabits || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Want Kids</label>
                    {editing ? (
                      <select
                        name="wantKids"
                        value={formData.wantKids || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="maybe">Maybe</option>
                        <option value="have-kids">Already have kids</option>
                      </select>
                    ) : (
                      <div className="text-white text-lg capitalize">{user?.wantKids?.replace('-', ' ') || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Religious Beliefs</label>
                    {editing ? (
                      <input
                        type="text"
                        name="religiousBeliefs"
                        value={formData.religiousBeliefs || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-white text-lg">{user?.religiousBeliefs || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Favorite Place to Meet</label>
                    {editing ? (
                      <select
                        name="favoritePlaceToMeet"
                        value={formData.favoritePlaceToMeet || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="coffee-shop">Coffee Shop</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="park">Park</option>
                        <option value="mall">Mall</option>
                        <option value="bar">Bar/Pub</option>
                        <option value="outdoor">Outdoor/Nature</option>
                      </select>
                    ) : (
                      <div className="text-white text-lg capitalize">{user?.favoritePlaceToMeet?.replace('-', ' ') || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Traveler Type</label>
                    {editing ? (
                      <select
                        name="travelerType"
                        value={formData.travelerType || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="business">Business</option>
                        <option value="leisure">Leisure</option>
                        <option value="spiritual">Spiritual</option>
                        <option value="adventure">Adventure</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    ) : (
                      <div className="text-white text-lg capitalize">{user?.travelerType || 'Not specified'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Subscription</h3>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-semibold capitalize">{user?.subscriptionType} Plan</div>
                    <div className="text-sm text-gray-400">
                      {user?.subscriptionType === 'premium' 
                        ? 'Unlimited features' 
                        : user?.subscriptionType === 'regular'
                        ? '50 searches/month'
                        : '10 searches/month'}
                    </div>
                  </div>
                  {user?.subscriptionType !== 'premium' && (
                    <button
                      onClick={() => router.push('/subscription')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}