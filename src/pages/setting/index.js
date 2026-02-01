// app/settings/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
  Bell, Lock, Eye, Shield, Trash2, Save, User, Mail, 
  Smartphone, Globe, Moon, Sun, Volume2, VolumeX, 
  CheckCircle, XCircle, AlertCircle, LogOut, Key, Link as LinkIcon
} from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      matchRequests: true,
      messages: true,
      meetings: true,
      events: true,
      marketing: false
    },
    privacy: {
      showOnline: true,
      showLocation: true,
      showActivity: false,
      showLastSeen: true,
      allowSearchByPhone: false,
      showReadReceipts: true
    },
    account: {
      twoFactorEnabled: false,
      emailVerified: true,
      phoneVerified: false
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
      alert('Account deletion requested. Our team will process this within 24 hours.');
      // API call to delete account
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gray-400">Manage your account preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <TabButton
                  active={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                  icon={<Bell size={18} />}
                >
                  Notifications
                </TabButton>
                <TabButton
                  active={activeTab === 'privacy'}
                  onClick={() => setActiveTab('privacy')}
                  icon={<Eye size={18} />}
                >
                  Privacy
                </TabButton>
                <TabButton
                  active={activeTab === 'security'}
                  onClick={() => setActiveTab('security')}
                  icon={<Lock size={18} />}
                >
                  Security
                </TabButton>
                <TabButton
                  active={activeTab === 'account'}
                  onClick={() => setActiveTab('account')}
                  icon={<User size={18} />}
                >
                  Account
                </TabButton>
                <TabButton
                  active={activeTab === 'blocked'}
                  onClick={() => setActiveTab('blocked')}
                  icon={<Shield size={18} />}
                >
                  Blocked Users
                </TabButton>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
                
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Bell className="text-orange-400" size={24} />
                      <h2 className="text-2xl font-bold text-white">Notifications</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
                        <div className="space-y-4">
                          <ToggleSetting
                            label="Email Notifications"
                            description="Receive notifications via email"
                            icon={<Mail size={18} />}
                            checked={settings.notifications.email}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, email: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Push Notifications"
                            description="Receive push notifications on your device"
                            icon={<Bell size={18} />}
                            checked={settings.notifications.push}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, push: checked }
                            })}
                          />
                          <ToggleSetting
                            label="SMS Notifications"
                            description="Receive important alerts via SMS"
                            icon={<Smartphone size={18} />}
                            checked={settings.notifications.sms}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, sms: checked }
                            })}
                          />
                        </div>
                      </div>

                      <hr className="border-gray-800" />

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Activity Notifications</h3>
                        <div className="space-y-4">
                          <ToggleSetting
                            label="Match Requests"
                            description="Get notified when someone sends you a match request"
                            checked={settings.notifications.matchRequests}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, matchRequests: checked }
                            })}
                          />
                          <ToggleSetting
                            label="New Messages"
                            description="Get notified about new messages"
                            checked={settings.notifications.messages}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, messages: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Meeting Reminders"
                            description="Receive reminders about upcoming meetings"
                            checked={settings.notifications.meetings}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, meetings: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Event Updates"
                            description="Get notified about events you're interested in"
                            checked={settings.notifications.events}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, events: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Marketing & Promotions"
                            description="Receive updates about new features and offers"
                            checked={settings.notifications.marketing}
                            onChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, marketing: checked }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Eye className="text-blue-400" size={24} />
                      <h2 className="text-2xl font-bold text-white">Privacy</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Visibility</h3>
                        <div className="space-y-4">
                          <ToggleSetting
                            label="Show Online Status"
                            description="Let others see when you're online"
                            checked={settings.privacy.showOnline}
                            onChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showOnline: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Show Last Seen"
                            description="Display your last active time"
                            checked={settings.privacy.showLastSeen}
                            onChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showLastSeen: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Show Location"
                            description="Allow others to see your city"
                            checked={settings.privacy.showLocation}
                            onChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showLocation: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Show Recent Activity"
                            description="Display your recent meets and events"
                            checked={settings.privacy.showActivity}
                            onChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showActivity: checked }
                            })}
                          />
                        </div>
                      </div>

                      <hr className="border-gray-800" />

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Discovery</h3>
                        <div className="space-y-4">
                          <ToggleSetting
                            label="Allow Search by Phone"
                            description="Let people find you using your phone number"
                            checked={settings.privacy.allowSearchByPhone}
                            onChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, allowSearchByPhone: checked }
                            })}
                          />
                          <ToggleSetting
                            label="Read Receipts"
                            description="Show when you've read messages"
                            checked={settings.privacy.showReadReceipts}
                            onChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showReadReceipts: checked }
                            })}
                          />
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-sm text-blue-300">
                          <strong className="font-semibold">Privacy Note:</strong> Your exact address is never shared. 
                          Only your city and locality are visible for nearby matching.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="text-green-400" size={24} />
                      <h2 className="text-2xl font-bold text-white">Security</h2>
                    </div>

                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left group">
                        <div className="flex items-center gap-3">
                          <Key className="text-gray-400 group-hover:text-orange-400 transition-colors" size={20} />
                          <div>
                            <div className="text-white font-medium">Change Password</div>
                            <div className="text-sm text-gray-400">Update your password regularly</div>
                          </div>
                        </div>
                        <Shield size={18} className="text-gray-400" />
                      </button>

                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Shield className="text-green-400" size={20} />
                            <div>
                              <div className="text-white font-medium">Two-Factor Authentication</div>
                              <div className="text-sm text-gray-400">Add an extra layer of security</div>
                            </div>
                          </div>
                          <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.account.twoFactorEnabled ? 'bg-orange-500' : 'bg-gray-700'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.account.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        {!settings.account.twoFactorEnabled && (
                          <button className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors">
                            Enable 2FA
                          </button>
                        )}
                      </div>

                      <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left group">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="text-gray-400 group-hover:text-orange-400 transition-colors" size={20} />
                          <div>
                            <div className="text-white font-medium">Linked Accounts</div>
                            <div className="text-sm text-gray-400">Google, Facebook, Phone</div>
                          </div>
                        </div>
                        <Shield size={18} className="text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left group">
                        <div className="flex items-center gap-3">
                          <Smartphone className="text-gray-400 group-hover:text-orange-400 transition-colors" size={20} />
                          <div>
                            <div className="text-white font-medium">Active Sessions</div>
                            <div className="text-sm text-gray-400">Manage logged-in devices</div>
                          </div>
                        </div>
                        <Shield size={18} className="text-gray-400" />
                      </button>

                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="text-sm text-green-300 font-semibold mb-1">Your account is secure</p>
                            <p className="text-xs text-green-400/80">
                              Last password change: 30 days ago • 2FA: {settings.account.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <User className="text-purple-400" size={24} />
                      <h2 className="text-2xl font-bold text-white">Account</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Verification Status</h3>
                        <div className="space-y-3">
                          <VerificationItem
                            label="Email"
                            verified={settings.account.emailVerified}
                            description="you@example.com"
                          />
                          <VerificationItem
                            label="Phone Number"
                            verified={settings.account.phoneVerified}
                            description="+91 XXXXX XXXXX"
                          />
                          <VerificationItem
                            label="KYC"
                            verified={false}
                            description="Upload government ID"
                          />
                          <VerificationItem
                            label="Police Verification"
                            verified={false}
                            description="Enhanced safety"
                          />
                        </div>
                      </div>

                      <hr className="border-gray-800" />

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left"
                          >
                            <LogOut className="text-orange-400" size={20} />
                            <div>
                              <div className="text-white font-medium">Logout</div>
                              <div className="text-sm text-gray-400">Sign out from this device</div>
                            </div>
                          </button>

                          <button className="w-full flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left">
                            <Globe className="text-blue-400" size={20} />
                            <div>
                              <div className="text-white font-medium">Download My Data</div>
                              <div className="text-sm text-gray-400">Get a copy of your information</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      <hr className="border-gray-800" />

                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Danger Zone</h3>
                            <p className="text-sm text-gray-400 mb-4">
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full p-4 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 rounded-lg text-red-400 font-semibold transition-colors"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blocked Users Tab */}
                {activeTab === 'blocked' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="text-red-400" size={24} />
                      <h2 className="text-2xl font-bold text-white">Blocked Users</h2>
                    </div>

                    <p className="text-gray-400 mb-6">
                      Blocked users cannot send you messages or match requests. 
                      They won't be notified that you've blocked them.
                    </p>

                    <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                      <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400">You haven't blocked anyone</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>

     </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-orange-500 text-white' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ToggleSetting({ label, description, icon, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="text-gray-400 mt-1">{icon}</div>}
        <div className="flex-1">
          <div className="text-white font-medium">{label}</div>
          {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-orange-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function VerificationItem({ label, verified, description }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium">{label}</span>
          {verified ? (
            <CheckCircle className="text-green-400" size={16} />
          ) : (
            <XCircle className="text-gray-600" size={16} />
          )}
        </div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      {!verified && (
        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors">
          Verify
        </button>
      )}
    </div>
  );
}