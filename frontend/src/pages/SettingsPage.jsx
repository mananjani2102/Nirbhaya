import React, { useState, useEffect } from 'react';
import { 
    User, Bell, Shield, Smartphone, LogOut, Save, ChevronRight, 
    CheckCircle, Download, Trash2, Key, Monitor, MapPin, QrCode, 
    AlertTriangle, Loader2, Info, Lock
} from 'lucide-react';

export default function SettingsPage() {
    // Global & Persistence
    const [activeTab, setActiveTab] = useState(localStorage.getItem('settingsTab') || 'Profile');
    const [toast, setToast] = useState(null); // { message, type }

    useEffect(() => {
        localStorage.setItem('settingsTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    // --- Tab 1: Profile State ---
    const [profileData, setProfileData] = useState({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 9876543210',
        pin: '1234'
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [savedProfile, setSavedProfile] = useState(false);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const errors = {};
        if (!profileData.name.trim()) errors.name = "Full Name is required";
        if (!profileData.email.trim()) errors.email = "Email Address is required";
        
        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }
        
        setProfileErrors({});
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 3000);
    };

    // --- Tab 2: Notifications State ---
    const [notifPrefs, setNotifPrefs] = useState({
        sos: true,
        safezone: true,
        guardian: false,
        news: true
    });

    const NOTIF_OPTIONS = [
        { key: 'sos', title: 'SOS Alert Confirmation', desc: 'Receive a push notification whenever you trigger an SOS alert.' },
        { key: 'safezone', title: 'Safe Zone Reminders', desc: 'Alert me when I enter a high-traffic or community-verified safe zone.' },
        { key: 'guardian', title: 'Guardian Alert Updates', desc: 'Notify me when one of my guardians verifies their contact information.' },
        { key: 'news', title: 'Safety News & Updates', desc: 'Weekly digest of the latest safety news and current affairs in India.' }
    ];

    const toggleNotif = (key) => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSaveNotifs = () => {
        showToast('Preferences saved successfully!');
    };

    // --- Tab 3: Privacy & Security State ---
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    
    const [locationPrefs, setLocationPrefs] = useState({
        background: true,
        sosOnly: false,
        improveMap: true
    });

    const handleDownloadData = () => {
        setIsDownloading(true);
        setTimeout(() => {
            setIsDownloading(false);
            showToast('Data prepared for download. Check your email.', 'info');
        }, 2000);
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText === 'DELETE') {
            setShowDeleteModal(false);
            setDeleteConfirmText('');
            showToast('Account scheduled for deletion.', 'error');
            // Mock logout
        }
    };

    const [sessions, setSessions] = useState([
        { id: 1, device: 'iPhone 14', location: 'Bangalore, IN', time: 'Active now', isCurrent: true },
        { id: 2, device: 'MacBook Pro (Chrome)', location: 'Bangalore, IN', time: 'Last seen 2 hours ago', isCurrent: false }
    ]);

    const handleSignOutSession = (id) => {
        setSessions(sessions.filter(s => s.id !== id));
        showToast('Signed out of session');
    };

    // --- Tab 4: Connected Devices State ---
    const [showPairQR, setShowPairQR] = useState(false);
    const [devices, setDevices] = useState([
        { id: 1, name: 'iPhone 14 (Current)', status: 'Connected', active: true },
        { id: 2, name: 'Chrome on MacBook Pro', status: 'Last seen 2 hours ago', active: false }
    ]);

    const handleRemoveDevice = (id) => {
        setDevices(devices.filter(d => d.id !== id));
        showToast('Device removed');
    };


    const TABS = [
        { name: 'Profile', icon: User },
        { name: 'Notifications', icon: Bell },
        { name: 'Privacy & Security', icon: Shield },
        { name: 'Connected Devices', icon: Smartphone }
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 relative min-h-[calc(100vh-100px)]">
            
            {/* Global Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className="font-label text-sm font-semibold">{toast.message}</span>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-8 animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-2">Delete Account</h3>
                        <p className="text-gray-600 font-body text-sm mb-6">This action is permanent and cannot be undone. All your safety data, guardians, and tracking history will be permanently erased.</p>
                        
                        <label className="block text-sm font-bold text-gray-700 mb-2">Type DELETE to confirm</label>
                        <input 
                            type="text" 
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl mb-6 outline-none focus:border-red-500" 
                            placeholder="DELETE"
                        />
                        
                        <div className="flex gap-4">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                            <button 
                                onClick={handleDeleteAccount} 
                                disabled={deleteConfirmText !== 'DELETE'}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-12">
                <h1 className="text-4xl font-bold font-serif text-[#7a8a42] tracking-tight">Account Settings</h1>
                <p className="text-[#6b6550] font-body mt-2">Manage your profile, safety preferences, and account security.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Sidebar Tabs */}
                <aside className="w-full lg:w-72 shrink-0">
                    <nav className="flex flex-col gap-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl font-serif font-bold transition-all ${activeTab === tab.name
                                        ? 'bg-white text-[#7a8a42] shadow-md border border-gray-100'
                                        : 'text-[#6b6550] hover:bg-white/50 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.name ? 'text-[#7a8a42]' : 'text-gray-400'}`} />
                                    {tab.name}
                                </div>
                                {activeTab === tab.name && <ChevronRight className="w-4 h-4" />}
                            </button>
                        ))}
                        <div className="mt-8 pt-8 border-t border-gray-200/50">
                            <button className="flex items-center gap-3 px-6 py-4 text-red-500 font-serif font-bold hover:bg-red-50 rounded-2xl transition-all w-full border border-transparent hover:border-red-100">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1">
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[600px]">
                        
                        {/* TAB 1: PROFILE */}
                        {activeTab === 'Profile' && (
                            <div className="animate-in fade-in duration-500">
                                <h2 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-8">Personal Information</h2>
                                
                                {savedProfile && (
                                    <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 font-medium animate-in slide-in-from-top-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Profile updated successfully
                                    </div>
                                )}

                                <div className="flex items-center gap-8 pb-10 border-b border-gray-100 mb-10">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7a8a42] to-[#a8b86e] flex items-center justify-center text-white text-3xl font-bold font-serif shadow-xl border-4 border-white">
                                        {profileData.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#2c2a1e] font-serif">{profileData.name || 'User'}</h3>
                                        <p className="text-sm text-[#6b6550] font-body">Bangalore, Karnataka, India</p>
                                        <button className="mt-3 text-[#7a8a42] text-sm font-bold hover:text-[#a8b86e] hover:underline transition-colors">Change Profile Picture</button>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                value={profileData.name} 
                                                onChange={e => setProfileData({...profileData, name: e.target.value})}
                                                className={`w-full p-3.5 bg-gray-50 border ${profileErrors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-[#7a8a42] outline-none transition-all`} 
                                            />
                                            {profileErrors.name && <p className="text-red-500 text-xs font-bold mt-1">{profileErrors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                            <input 
                                                type="email" 
                                                value={profileData.email}
                                                onChange={e => setProfileData({...profileData, email: e.target.value})}
                                                className={`w-full p-3.5 bg-gray-50 border ${profileErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-[#7a8a42] outline-none transition-all`} 
                                            />
                                            {profileErrors.email && <p className="text-red-500 text-xs font-bold mt-1">{profileErrors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                value={profileData.phone}
                                                onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#7a8a42] outline-none transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Emergency Pin</label>
                                            <input 
                                                type="password" 
                                                value={profileData.pin}
                                                onChange={e => setProfileData({...profileData, pin: e.target.value})}
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#7a8a42] outline-none transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button type="submit" className="bg-[#7a8a42] text-white font-bold py-4 px-10 rounded-xl hover:bg-[#5a6c30] transition-colors shadow-lg shadow-[#7a8a42]/20 flex items-center gap-3">
                                            <Save className="w-5 h-5" />
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* TAB 2: NOTIFICATIONS */}
                        {activeTab === 'Notifications' && (
                            <div className="animate-in fade-in duration-500 flex flex-col h-full">
                                <h2 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-8">Notification Preferences</h2>
                                <div className="flex-1 space-y-8">
                                    {NOTIF_OPTIONS.map((pref) => (
                                        <div key={pref.key} className="flex items-center justify-between pb-8 border-b border-gray-100 last:border-0">
                                            <div className="max-w-md pr-8">
                                                <h4 className="font-bold text-lg text-[#2c2a1e] mb-1">{pref.title}</h4>
                                                <p className="text-sm text-[#6b6550] font-body leading-relaxed">{pref.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => toggleNotif(pref.key)}
                                                className={`w-14 h-7 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7a8a42] ${notifPrefs[pref.key] ? 'bg-[#7a8a42]' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm ${notifPrefs[pref.key] ? 'left-8' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <button onClick={handleSaveNotifs} className="bg-[#7a8a42] text-white font-bold py-4 px-10 rounded-xl hover:bg-[#5a6c30] transition-colors shadow-lg shadow-[#7a8a42]/20">
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PRIVACY & SECURITY */}
                        {activeTab === 'Privacy & Security' && (
                            <div className="animate-in fade-in duration-500 space-y-12">
                                
                                {/* Section A: Data & Privacy */}
                                <section>
                                    <h2 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-6 flex items-center gap-3">
                                        <Shield className="w-6 h-6 text-[#7a8a42]" /> Data & Privacy
                                    </h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                                            <div>
                                                <h4 className="font-bold text-[#2c2a1e]">Download My Data</h4>
                                                <p className="text-sm text-[#6b6550] mt-1">Get a copy of all your safety logs, guardians, and app activity.</p>
                                            </div>
                                            <button onClick={handleDownloadData} disabled={isDownloading} className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-sm text-[#2c2a1e] hover:bg-gray-100 flex items-center justify-center gap-2 w-full md:w-auto transition-colors disabled:opacity-50">
                                                {isDownloading ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</> : <><Download className="w-4 h-4" /> Download</>}
                                            </button>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-red-600">Delete My Account</h4>
                                                <p className="text-sm text-red-400 mt-1">Permanently erase your account and all associated data.</p>
                                            </div>
                                            <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2 w-full md:w-auto transition-colors">
                                                <Trash2 className="w-4 h-4" /> Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {/* Section B: Security */}
                                <section>
                                    <h2 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-6 flex items-center gap-3">
                                        <Lock className="w-6 h-6 text-[#7a8a42]" /> Security
                                    </h2>
                                    <div className="space-y-6">
                                        {/* Change Password */}
                                        <div className="border border-gray-100 rounded-2xl p-6 transition-all">
                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                                                <div>
                                                    <h4 className="font-bold text-[#2c2a1e] flex items-center gap-2"><Key className="w-4 h-4 text-gray-400" /> Change Password</h4>
                                                    <p className="text-sm text-gray-500 mt-1">Update your account login password.</p>
                                                </div>
                                                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
                                            </div>
                                            {showPasswordForm && (
                                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2">
                                                    <input type="password" placeholder="Current Password" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-[#7a8a42]" />
                                                    <input type="password" placeholder="New Password" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-[#7a8a42]" />
                                                    <input type="password" placeholder="Confirm New Password" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-[#7a8a42]" />
                                                    <button className="px-6 py-3 bg-[#2c2a1e] text-white rounded-xl font-bold text-sm hover:bg-black transition-colors">Update Password</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2FA */}
                                        <div className="border border-gray-100 rounded-2xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-[#2c2a1e] flex items-center gap-2"><Smartphone className="w-4 h-4 text-gray-400" /> Two-Factor Authentication</h4>
                                                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security via SMS.</p>
                                                </div>
                                                <button 
                                                    onClick={() => setTwoFactor(!twoFactor)}
                                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${twoFactor ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${twoFactor ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            {twoFactor && (
                                                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4 animate-in slide-in-from-top-2">
                                                    <input type="tel" placeholder="+91 Enter mobile number" className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-[#7a8a42]" />
                                                    <button className="px-6 bg-[#7a8a42] text-white font-bold rounded-xl hover:bg-[#5a6c30]">Verify</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Active Sessions */}
                                        <div className="border border-gray-100 rounded-2xl p-6">
                                            <h4 className="font-bold text-[#2c2a1e] mb-4">Active Sessions</h4>
                                            <div className="space-y-4">
                                                {sessions.map(s => (
                                                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg ${s.isCurrent ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                                <Monitor className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[#2c2a1e] text-sm flex items-center gap-2">
                                                                    {s.device} {s.isCurrent && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Current</span>}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">{s.location} • {s.time}</p>
                                                            </div>
                                                        </div>
                                                        {!s.isCurrent && (
                                                            <button onClick={() => handleSignOutSession(s.id)} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">Sign Out</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section C: Location Permissions */}
                                <section>
                                    <h2 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-6 flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-[#7a8a42]" /> Location Permissions
                                    </h2>
                                    <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100">
                                        {[
                                            { key: 'background', label: 'Background Location Tracking', desc: 'Allows Nirbhaya to track your path securely even when the app is closed.', state: locationPrefs.background },
                                            { key: 'sosOnly', label: 'Share location with Guardians during SOS only', desc: 'If enabled, your live location is hidden from Guardians until an emergency is triggered.', state: locationPrefs.sosOnly },
                                            { key: 'improveMap', label: 'Allow Nirbhaya to improve map with my reports', desc: 'Share anonymous safety reports to help build the community heatmap.', state: locationPrefs.improveMap },
                                        ].map(item => (
                                            <div key={item.key} className="p-6 flex items-center justify-between">
                                                <div className="max-w-md pr-8">
                                                    <h4 className="font-bold text-[#2c2a1e] text-sm mb-1">{item.label}</h4>
                                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setLocationPrefs(prev => ({...prev, [item.key]: !prev[item.key]}))}
                                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${item.state ? 'bg-[#7a8a42]' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${item.state ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                            </div>
                        )}

                        {/* TAB 4: CONNECTED DEVICES */}
                        {activeTab === 'Connected Devices' && (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold font-serif text-[#2c2a1e] mb-2">Connected Devices</h2>
                                        <p className="text-sm text-gray-500 font-body">Manage devices that have access to your Nirbhaya account.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowPairQR(!showPairQR)}
                                        className="bg-[#2c2a1e] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-colors"
                                    >
                                        <QrCode className="w-4 h-4" /> Pair New Device
                                    </button>
                                </div>

                                {showPairQR && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center mb-8 animate-in slide-in-from-top-4">
                                        <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 mb-4">
                                            <QrCode className="w-12 h-12 mb-2 opacity-50" />
                                            <span className="text-xs font-bold uppercase tracking-widest">QR Code<br/>Placeholder</span>
                                        </div>
                                        <h4 className="font-bold text-[#2c2a1e]">Scan with your new device</h4>
                                        <p className="text-sm text-gray-500 mt-1 max-w-sm">Open the Nirbhaya app on your other device and scan this code to login instantly.</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {devices.length === 0 ? (
                                        <p className="text-center text-gray-400 py-10">No devices connected.</p>
                                    ) : (
                                        devices.map(d => (
                                            <div key={d.id} className="border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200 transition-colors bg-white">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${d.active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                                        <Smartphone className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#2c2a1e] text-lg">{d.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`w-2 h-2 rounded-full ${d.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{d.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveDevice(d.id)}
                                                    className="px-5 py-2.5 bg-gray-50 text-gray-600 font-bold text-sm rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100"
                                                >
                                                    {d.active ? 'Sign Out' : 'Remove Device'}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
