import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, ArrowRight, Bookmark, Share2, CheckCircle } from 'lucide-react';

export default function WellnessPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [savedGuides, setSavedGuides] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [toast, setToast] = useState(null);

    const CATEGORIES = ['All', 'Mental Health', 'Physical Safety', 'Travel Tips', 'Self Defense'];

    const GUIDES = [
        {
            id: 1,
            title: 'Active Awareness: Daily Safety Habits',
            category: 'Physical Safety',
            desc: 'Simple routines you can incorporate into your daily life to stay alert and prepared for any situation.',
            time: '5 min read',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 2,
            title: 'Healing Through Community',
            category: 'Mental Health',
            desc: 'Understanding the power of safe spaces and sisterhood in overcoming anxiety and trauma.',
            time: '8 min read',
            image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 3,
            title: 'Safe Solo Travel in India',
            category: 'Travel Tips',
            desc: 'A comprehensive guide to navigating public transport, accommodation, and late-night travel safely.',
            time: '12 min read',
            image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 4,
            title: 'Basics of De-escalation',
            category: 'Self Defense',
            desc: 'How to use verbal techniques and body language to defuse potentially dangerous confrontations.',
            time: '6 min read',
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 5,
            title: 'The "Invisible Shield" Technique',
            category: 'Self Defense',
            desc: 'Psychological strategies to project confidence and deter unwanted attention in crowded spaces.',
            time: '7 min read',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 6,
            title: 'Managing Panic in Crisis',
            category: 'Mental Health',
            desc: 'Quick breathing exercises and grounding techniques used by first responders to stay calm.',
            time: '4 min read',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400'
        }
    ];

    const filteredGuides = GUIDES.filter(g => {
        const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) 
            || g.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleBookmark = (id) => {
        if (savedGuides.includes(id)) {
            setSavedGuides(savedGuides.filter(savedId => savedId !== id));
        } else {
            setSavedGuides([...savedGuides, id]);
        }
    };

    const handleShare = async (guide) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: guide.title,
                    text: guide.desc,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            setToast('Link copied!');
            setTimeout(() => setToast(null), 2000);
        }
    };

    const getReadTimePill = (timeStr) => {
        const minutes = parseInt(timeStr.split(' ')[0]);
        let colorClass = 'bg-green-100 text-green-700';
        if (minutes >= 5 && minutes <= 10) colorClass = 'bg-amber-100 text-amber-700';
        if (minutes > 10) colorClass = 'bg-[#f5f0e0] text-[#7a8a42]'; // Rose tint for > 10 min
        
        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${colorClass}`}>
                <Clock className="w-3 h-3" /> {timeStr}
            </span>
        );
    };

    const getCategoryCount = (cat) => {
        if (cat === 'All') return GUIDES.length;
        return GUIDES.filter(g => g.category === cat).length;
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-12 relative">
            
            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-label text-sm font-semibold">{toast}</span>
                </div>
            )}

            <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl font-bold font-serif text-[#7a8a42] tracking-tight">Wellness & Safety Guides</h1>
                        {savedGuides.length > 0 && (
                            <span className="bg-[#f5f0e0] text-[#7a8a42] px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-[#7a8a42]/10 mt-2">
                                Saved ({savedGuides.length})
                            </span>
                        )}
                    </div>
                    <p className="text-[#6b6550] font-body text-lg">Expert-vetted resources for your physical safety and mental well-being across India.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search guides..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#7a8a42] transition-colors"
                    />
                </div>
            </header>

            {/* Featured Article */}
            <div className="mb-16 relative rounded-[32px] overflow-hidden bg-[#2c2a1e] text-white flex flex-col md:flex-row transition-all duration-700">
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center gap-6 z-10 bg-[#2c2a1e]">
                    <span className="bg-[#a8b86e] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                        Featured Guide
                    </span>
                    <h2 className="text-4xl font-serif font-bold leading-tight">The Modern Woman's Handbook to Safe Commuting</h2>
                    <p className="text-gray-300 font-body text-lg leading-relaxed">
                        From cab protocols to transit apps, we break down every layer of safety needed for your daily journey.
                    </p>
                    
                    {/* Expandable Content */}
                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-gray-400 font-body text-sm leading-relaxed mb-4">
                            Navigating daily commutes in bustling cities requires more than just awareness—it requires a system. Before entering any cab, always verify the driver's details against your app. Cross-check the license plate, the driver's photo, and ensure the child lock on your door is disabled.
                        </p>
                        <p className="text-gray-400 font-body text-sm leading-relaxed mb-4">
                            Public transit poses different challenges. Stick to well-lit compartments and sit near the exit or transit staff. If you feel uneasy, trust your gut. Move to another carriage or get off at the next populated stop.
                        </p>
                        <p className="text-gray-400 font-body text-sm leading-relaxed">
                            Finally, always share your live location with at least one trusted Guardian. Nirbhaya's background tracking ensures your safety network always knows your last known location, even if your phone loses signal.
                        </p>
                    </div>

                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn-secondary w-fit flex items-center gap-2 group mt-2"
                    >
                        {isExpanded ? 'Collapse Article' : 'Read Full Article'}
                        <ArrowRight className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </button>
                </div>
                <div className="w-full md:w-1/2 relative bg-cover bg-center min-h-[300px] md:min-h-[400px]" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800)' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2c2a1e] via-[#2c2a1e]/50 to-transparent hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c2a1e] via-transparent to-transparent md:hidden block" />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-4 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full font-serif text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat
                                ? 'bg-[#7a8a42] text-white shadow-lg'
                                : 'bg-white border border-gray-200 text-[#6b6550] hover:border-[#7a8a42]'
                            }`}
                    >
                        {cat} <span className={`ml-1 ${activeCategory === cat ? 'text-white/70' : 'text-gray-400'}`}>({getCategoryCount(cat)})</span>
                    </button>
                ))}
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                Showing {filteredGuides.length} guide{filteredGuides.length !== 1 && 's'}
            </p>

            {/* Guides Grid / Empty State */}
            {filteredGuides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-[#2c2a1e] mb-2">No guides found</h3>
                    <p className="text-[#6b6550] max-w-sm">We couldn't find any guides matching "{searchQuery}". Try adjusting your search or category filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGuides.map(guide => (
                        <div key={guide.id} className="card-premium group flex flex-col h-full hover:shadow-xl hover:shadow-[#7a8a42]/5 transition-all">
                            <div className="relative h-48 mb-6 overflow-hidden rounded-xl">
                                <img
                                    src={guide.image}
                                    alt={guide.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#7a8a42] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                    {guide.category}
                                </span>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xl font-bold font-serif text-[#2c2a1e] group-hover:text-[#7a8a42] transition-colors leading-tight">
                                    {guide.title}
                                </h3>
                                <p className="text-sm text-[#6b6550] line-clamp-3 font-body leading-relaxed">
                                    {guide.desc}
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getReadTimePill(guide.time)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => toggleBookmark(guide.id)}
                                        className={`p-2 rounded-lg transition-colors ${savedGuides.includes(guide.id) ? 'bg-[#f5f0e0] text-[#7a8a42]' : 'text-gray-400 hover:text-[#7a8a42] hover:bg-gray-50'}`}
                                        title={savedGuides.includes(guide.id) ? 'Saved' : 'Save Bookmark'}
                                    >
                                        <Bookmark className="w-4 h-4" fill={savedGuides.includes(guide.id) ? '#7a8a42' : 'none'} />
                                    </button>
                                    <button 
                                        onClick={() => handleShare(guide)}
                                        className="p-2 text-gray-400 hover:text-[#7a8a42] hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Share Guide"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
