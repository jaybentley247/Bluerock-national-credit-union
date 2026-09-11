'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PasswordInput from '@/components/ui/PasswordInput';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Camera
} from 'lucide-react';

// Helper to combine class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const { user, checkAuth, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);
  const [otpStep, setOtpStep] = useState<'idle' | 'awaiting-code'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // Sync state with user data when it loads
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setOtpEnabled(user.otp_enabled || false);
    }
  }, [user]);

  const handleToggleOtp = async () => {
    setMessage({ type: '', text: '' });

    // Turning it off doesn't need re-confirmation — only enabling does.
    if (otpEnabled) {
      setIsTogglingOtp(true);
      try {
        await api.put('/auth/me', { otp_enabled: false });
        setOtpEnabled(false);
        setMessage({ type: 'success', text: 'Login verification codes are now disabled.' });
        await checkAuth();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update this setting.' });
      } finally {
        setIsTogglingOtp(false);
      }
      return;
    }

    setIsTogglingOtp(true);
    try {
      await api.post('/auth/2fa/request-enable');
      setOtpStep('awaiting-code');
      setMessage({ type: 'success', text: 'A confirmation code has been sent to your email — it expires in 10 minutes.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to send a confirmation code.' });
    } finally {
      setIsTogglingOtp(false);
    }
  };

  const handleResendOtpCode = async () => {
    setIsResendingOtp(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/2fa/request-enable');
      setMessage({ type: 'success', text: 'A new code has been sent — it expires in 10 minutes.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to resend the code.' });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleConfirmOtpCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmingOtp(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/2fa/confirm-enable', { code: otpCode.trim() });
      setOtpEnabled(true);
      setOtpStep('idle');
      setOtpCode('');
      setMessage({ type: 'success', text: 'Login verification codes are now enabled.' });
      await checkAuth();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Invalid or expired code.' });
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  const handleCancelOtpSetup = () => {
    setOtpStep('idle');
    setOtpCode('');
    setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/me', {
        full_name: fullName,
        email: email
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await checkAuth(); // Refresh the auth context user data
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update profile.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/me', {
        password: newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update password.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E3DAA]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account settings and personal preferences, all in one convenient place.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all",
                activeTab === 'profile' ? "bg-[#0E3DAA] text-white shadow-lg shadow-red-100" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all",
                activeTab === 'security' ? "bg-[#0E3DAA] text-white shadow-lg shadow-red-100" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5" />
                <span>Security</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all",
                activeTab === 'notifications' ? "bg-[#0E3DAA] text-white shadow-lg shadow-red-100" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-6">
            {message.text && (
              <div className={cn(
                "p-4 rounded-xl border flex gap-3",
                message.type === 'success' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              )}>
                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <p className="text-sm font-bold">{message.text}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                    <div className="relative">
                      <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                        <User className="h-12 w-12 text-red-300" />
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 p-2 bg-[#0E3DAA] text-white rounded-full shadow-lg hover:bg-red-800 transition-all">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{user?.full_name}</h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs font-bold text-red-700 mt-1 uppercase tracking-wider">Premium Member</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#0E3DAA] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-red-700" />
                    <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Current Password</label>
                    <PasswordInput
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">New Password</label>
                      <PasswordInput
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
                      <PasswordInput
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#0E3DAA] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="pr-4">
                        <p className="font-bold text-gray-900 text-sm">Email verification code at login</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          When enabled, we'll email you a one-time code to enter every time you sign in — optional, off by default.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleOtp}
                        disabled={isTogglingOtp || otpStep === 'awaiting-code'}
                        className={cn(
                          "h-6 w-11 rounded-full relative transition-colors shrink-0 disabled:opacity-50",
                          otpEnabled ? "bg-[#0E3DAA]" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all",
                          otpEnabled ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>

                    {otpStep === 'awaiting-code' && (
                      <form onSubmit={handleConfirmOtpCode} className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                        <p className="text-xs text-gray-500">
                          Enter the 6-digit code we emailed you to turn this on.
                        </p>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            className="w-32 px-4 py-2 bg-white border border-gray-200 rounded-xl text-center tracking-[0.3em] focus:border-red-500 outline-none"
                            placeholder="000000"
                          />
                          <button
                            type="submit"
                            disabled={isConfirmingOtp || otpCode.length !== 6}
                            className="bg-[#0E3DAA] text-white px-5 py-2 rounded-xl font-bold hover:bg-red-800 transition-all disabled:opacity-50"
                          >
                            {isConfirmingOtp ? 'Confirming...' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelOtpSetup}
                            className="text-sm font-bold text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleResendOtpCode}
                          disabled={isResendingOtp}
                          className="text-xs font-medium text-red-700 hover:text-red-600 disabled:opacity-50"
                        >
                          {isResendingOtp ? 'Resending...' : 'Resend code'}
                        </button>
                      </form>
                    )}
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="p-8 text-center space-y-4">
                  <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="h-10 w-10 text-red-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Notification Preferences</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Manage how you receive alerts about account activity, security, and news.
                  </p>
                  <div className="pt-8 space-y-4 text-left max-w-md mx-auto">
                    {[
                      { label: 'Email Notifications', desc: 'Receive summaries of your daily transactions' },
                      { label: 'Push Notifications', desc: 'Real-time alerts on your mobile device' },
                      { label: 'Security Alerts', desc: 'Critical alerts about login attempts and password changes' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <div className="h-6 w-11 bg-[#0E3DAA] rounded-full relative">
                          <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
