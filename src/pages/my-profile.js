import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Camera, Edit2, Save, X, MapPin, Upload, Check } from 'lucide-react';

const inputCls = "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all";
const selectCls = "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none";

const Tag = ({ label }) => (
  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20 capitalize">{label}</span>
);

const ToggleChip = ({ label, selected, onClick }) => (
  <button type="button" onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selected
      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}>
    {selected && <Check className="inline w-3 h-3 mr-1" />}{label}
  </button>
);

const SectionHeader = ({ label }) => (
  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{label}</p>
);

const FieldRow = ({ label, value, children, editing }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    {editing ? children : (
      <p className="text-sm font-medium text-gray-200 capitalize">
        {value || <span className="text-gray-600 italic font-normal">Not specified</span>}
      </p>
    )}
  </div>
);

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadProfile();
  }, []);

  const parseSafeArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return [];
  };

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        setUser(p);
        setFormData({
          ...p,
          hobbies: parseSafeArray(p.hobbies),
          favoriteFood: parseSafeArray(p.favoriteFood),
          favoriteMusic: parseSafeArray(p.favoriteMusic),
          favoriteMovies: parseSafeArray(p.favoriteMovies),
          profilePictures: parseSafeArray(p.profilePictures)
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, address: { ...(prev.address || {}), [name]: value } }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter(i => i !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const token = localStorage.getItem('token');
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    const res = await fetch('/api/profile/upload-photo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    const data = await res.json();
    if (res.ok) setFormData(prev => ({ ...prev, profilePictures: data.images.slice(0, 6) }));
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const updated = [...prev.profilePictures];
      updated.splice(index, 1);
      return { ...prev, profilePictures: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        const u = {
          ...data.user,
          hobbies: parseSafeArray(data.user.hobbies),
          favoriteFood: parseSafeArray(data.user.favoriteFood),
          favoriteMusic: parseSafeArray(data.user.favoriteMusic),
          favoriteMovies: parseSafeArray(data.user.favoriteMovies),
          profilePictures: parseSafeArray(data.user.profilePictures)
        };
        setUser(u);
        setFormData(u);
        localStorage.setItem('user', JSON.stringify(data.user));
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.message || 'Failed to save');
      }
    } catch {
      setSaveError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError('');
    setFormData({
      ...user,
      hobbies: parseSafeArray(user.hobbies),
      favoriteFood: parseSafeArray(user.favoriteFood),
      favoriteMusic: parseSafeArray(user.favoriteMusic),
      favoriteMovies: parseSafeArray(user.favoriteMovies),
      profilePictures: parseSafeArray(user.profilePictures)
    });
  };

  const hobbyOptions = ['Coffee', 'Travel', 'Movies', 'Music', 'Reading', 'Sports', 'Cooking', 'Photography', 'Art', 'Gaming', 'Hiking', 'Yoga'];
  const musicGenres = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Indie', 'Metal'];
  const cuisines = ['Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican', 'Thai', 'Mediterranean', 'American', 'Korean', 'Vietnamese'];
  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'location', label: 'Location' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'interests', label: 'Interests' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile — MeetStreet</title>
      </Head>

      <div className="min-h-screen bg-gray-950">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

          {/* Profile Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-5 shadow-2xl">
            {/* Gradient strip */}
            <div className="h-24 sm:h-28 bg-gradient-to-br from-orange-600 via-rose-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(255,255,255,0.10) 0%, transparent 60%)' }}></div>
            </div>

            <div className="px-5 sm:px-7 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">

                {/* Avatar */}
                <div className="relative self-start flex-shrink-0 -mt-12 sm:-mt-14 z-10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 border-4 border-gray-900 overflow-hidden shadow-xl">
                    {formData?.profilePictures?.[0] ? (
                      <img src={formData.profilePictures[0]?.url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">
                        {formData?.profileName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Name & Buttons */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user.profileName}</h1>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="text-sm text-gray-400">{user.age} yrs &bull; <span className="capitalize">{user.gender}</span></span>
                        {user.address?.city && (
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />{user.address.city}
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${user.subscriptionType === 'premium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                          {user.subscriptionType || 'free'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {saveSuccess && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                          <Check className="w-3.5 h-3.5" /> Saved!
                        </span>
                      )}
                      {!editing ? (
                        <button onClick={() => setEditing(true)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all">
                          <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                      ) : (
                        <>
                          <button onClick={cancelEdit}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
                            <X className="w-4 h-4" /> Cancel
                          </button>
                          <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none transition-all">
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 mt-4">
                    {[
                      { label: 'Coins', value: user.coins || 0, color: 'text-orange-400' },
                      { label: 'Meets/Mo', value: user.meetsPerMonth || 0, color: 'text-emerald-400' },
                      { label: 'Score', value: `${user.qualityScore || 0}/5`, color: 'text-blue-400' }
                    ].map(s => (
                      <div key={s.label} className="text-center px-4 py-2 bg-gray-800/60 rounded-xl border border-gray-700/50">
                        <div className={`text-base font-extrabold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {saveError && (
              <div className="px-5 sm:px-7 pb-5">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{saveError}</div>
              </div>
            )}
          </div>

          {/* Photo Editor */}
          {editing && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 mb-5">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-4">
                <Camera className="w-4 h-4 text-orange-400" /> Profile Photos
              </h3>
              <div className="flex flex-wrap gap-3 items-center">
                {formData.profilePictures?.map((photo, i) => (
                  <div key={photo._id || i} className="relative">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-500/40">
                      <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                    {photo.isPrimary && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">Primary</span>
                    )}
                  </div>
                ))}
                {(formData.profilePictures?.length || 0) < 6 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-700 hover:border-orange-500 bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <Upload className="w-5 h-5 text-gray-600 group-hover:text-orange-400 mb-1" />
                    <span className="text-[10px] text-gray-600 group-hover:text-orange-400">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3">Up to 6 photos. First photo becomes your primary picture.</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-5 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 min-w-max py-2 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === t.id
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-7">

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FieldRow label="Profile Name" value={user.profileName} editing={editing}>
                  <input name="profileName" value={formData.profileName || ''} onChange={handleChange} className={inputCls} />
                </FieldRow>
                <FieldRow label="Age" value={`${user.age} years`} editing={false} />
                <FieldRow label="Gender" value={user.gender} editing={false} />
                <FieldRow label="Height" value={user.height} editing={editing}>
                  <input name="height" value={formData.height || ''} onChange={handleChange} className={inputCls} placeholder="e.g. 5'11 or 180cm" />
                </FieldRow>
                <FieldRow label="Ethnic Background" value={user.ethnicBackground} editing={editing}>
                  <input name="ethnicBackground" value={formData.ethnicBackground || ''} onChange={handleChange} className={inputCls} />
                </FieldRow>
                <FieldRow label="Purpose on App" 
                  value={{
                    'offering-time-company': 'Offering Time & Company',
                    'looking-for-time-company': 'Looking for Company',
                    'both': 'Both'
                  }[user.purposeOnApp] || user.purposeOnApp} 
                  editing={editing}>
                  <select name="purposeOnApp" value={formData.purposeOnApp || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="offering-time-company">Offering Time & Company</option>
                    <option value="looking-for-time-company">Looking for Company</option>
                    <option value="both">Both</option>
                  </select>
                </FieldRow>
                <FieldRow label="Education" value={user.education?.replace(/-/g, ' ')} editing={editing}>
                  <select name="education" value={formData.education || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="high-school">High School</option>
                    <option value="bachelors">Bachelor&apos;s Degree</option>
                    <option value="masters">Master&apos;s Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </FieldRow>
                <FieldRow label="Degree / Field" value={user.degreeType} editing={editing}>
                  <input name="degreeType" value={formData.degreeType || ''} onChange={handleChange} className={inputCls} placeholder="e.g. Computer Science" />
                </FieldRow>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FieldRow label="City" value={user.address?.city} editing={editing}>
                  <input name="city" value={formData.address?.city || ''} onChange={handleAddressChange} className={inputCls} placeholder="City" />
                </FieldRow>
                <FieldRow label="Locality / Area" value={user.address?.locality} editing={editing}>
                  <input name="locality" value={formData.address?.locality || ''} onChange={handleAddressChange} className={inputCls} placeholder="Locality" />
                </FieldRow>
                <FieldRow label="State" value={user.address?.state} editing={editing}>
                  <input name="state" value={formData.address?.state || ''} onChange={handleAddressChange} className={inputCls} placeholder="State" />
                </FieldRow>
                <FieldRow label="Country" value={user.address?.country} editing={editing}>
                  <input name="country" value={formData.address?.country || ''} onChange={handleAddressChange} className={inputCls} placeholder="Country" />
                </FieldRow>
              </div>
            )}

            {activeTab === 'lifestyle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FieldRow label="Exercise Habits" value={user.exerciseHabits} editing={editing}>
                  <select name="exerciseHabits" value={formData.exerciseHabits || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="never">Never</option>
                  </select>
                </FieldRow>
                <FieldRow label="Eating Habits" value={user.eatingHabits} editing={editing}>
                  <select name="eatingHabits" value={formData.eatingHabits || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="other">Other</option>
                  </select>
                </FieldRow>
                <FieldRow label="Want Kids" value={user.wantKids?.replace(/-/g, ' ')} editing={editing}>
                  <select name="wantKids" value={formData.wantKids || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="maybe">Maybe</option>
                    <option value="have-kids">Already have kids</option>
                  </select>
                </FieldRow>
                <FieldRow label="Religious Beliefs" value={user.religiousBeliefs} editing={editing}>
                  <input name="religiousBeliefs" value={formData.religiousBeliefs || ''} onChange={handleChange} className={inputCls} />
                </FieldRow>
                <FieldRow label="Favorite Place to Meet" value={user.favoritePlaceToMeet?.replace(/-/g, ' ')} editing={editing}>
                  <select name="favoritePlaceToMeet" value={formData.favoritePlaceToMeet || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="coffee-shop">Coffee Shop</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="park">Park</option>
                    <option value="mall">Mall</option>
                    <option value="bar">Bar / Pub</option>
                    <option value="outdoor">Outdoor / Nature</option>
                  </select>
                </FieldRow>
                <FieldRow label="Traveler Type" value={user.travelerType} editing={editing}>
                  <select name="travelerType" value={formData.travelerType || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="business">Business</option>
                    <option value="leisure">Leisure</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </FieldRow>
              </div>
            )}

            {activeTab === 'interests' && (
              <div className="space-y-8">
                {[
                  { field: 'hobbies', label: 'Hobbies', options: hobbyOptions, isLower: true },
                  { field: 'favoriteMusic', label: 'Favorite Music', options: musicGenres, isLower: false },
                  { field: 'favoriteFood', label: 'Favorite Cuisines', options: cuisines, isLower: false },
                ].map(({ field, label, options, isLower }) => (
                  <div key={field}>
                    <SectionHeader label={label} />
                    {editing ? (
                      <div className="flex flex-wrap gap-2">
                        {options.map(opt => (
                          <ToggleChip
                            key={opt}
                            label={opt}
                            selected={formData[field]?.includes(isLower ? opt.toLowerCase() : opt)}
                            onClick={() => handleMultiSelect(field, isLower ? opt.toLowerCase() : opt)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(user[field] || []).length > 0
                          ? (user[field] || []).map((v, i) => <Tag key={i} label={v} />)
                          : <span className="text-sm text-gray-600 italic">None added yet</span>
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription Banner */}
          <div className="mt-5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
              <p className="text-lg font-extrabold text-white capitalize">{user.subscriptionType || 'Free'} Plan</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {user.subscriptionType === 'premium' ? 'Unlimited features unlocked' : user.subscriptionType === 'regular' ? '50 searches/month' : '10 searches/month'}
              </p>
            </div>
            {user.subscriptionType !== 'premium' && (
              <button onClick={() => router.push('/subscription')}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all whitespace-nowrap">
                Upgrade ✨
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}