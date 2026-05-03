import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Map as MapIcon,
    AlertTriangle,
    Users,
    Leaf,
    Newspaper,
    LayoutDashboard,
    Menu,
    X,
    User,
    Settings,
    LogOut,
    Bell,
    ShieldCheck as Shield,
    Flower
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const tabRefs = useRef({});

    // Scroll glass effect
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    // Sliding pill position
    const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

    const navLinks = [
        { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
        { name: 'Safety Map', path: ROUTES.MAP, icon: MapIcon },
        { name: 'SOS Emergency', path: ROUTES.SOS, icon: AlertTriangle },
        { name: 'Guardian Network', path: ROUTES.GUARDIANS, icon: Users },
        { name: 'Wellness Guides', path: ROUTES.WELLNESS, icon: Leaf },
        { name: 'Current Affairs', path: ROUTES.NEWS, icon: Newspaper },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 h-[72px] px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl'
                    : 'bg-white border-b border-[#7a8a42]/10'
            }`}
            style={scrolled ? { boxShadow: '0 4px 24px rgba(122,138,66,0.12)' } : {}}
        >
            {/* Left: Branding */}
            <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-[#7a8a42] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                    <Flower className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-headline font-bold text-xl text-[#7a8a42] tracking-tight leading-none uppercase italic">Nirbhaya</span>
                    <span className="text-[10px] text-[#7a8a42]/60 font-label font-bold tracking-[0.2em] uppercase">Guardian Network</span>
                </div>
            </Link>

            {/* Center: Desktop Navigation — Pill Container */}
            <ul
                className="relative hidden lg:flex items-center gap-0 rounded-full border-2 border-[#7a8a42]/30 bg-[#F5F1E8] p-1"
                onMouseLeave={() => setPosition(pv => ({ ...pv, opacity: 0 }))}
            >
                {navLinks.map(link => (
                    <li
                        key={link.path}
                        ref={el => tabRefs.current[link.path] = el}
                        onMouseEnter={() => {
                            const el = tabRefs.current[link.path];
                            if (!el) return;
                            const { width } = el.getBoundingClientRect();
                            setPosition({ width, opacity: 1, left: el.offsetLeft });
                        }}
                        className="relative z-10"
                    >
                        <NavLink
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 whitespace-nowrap hover:text-white
                                ${isActive ? 'text-[#7a8a42]' : 'text-[#2c2a1e]'}`
                            }
                        >
                            <link.icon className="w-3.5 h-3.5 shrink-0" />
                            {link.name}
                        </NavLink>
                    </li>
                ))}

                {/* Framer-motion sliding olive pill */}
                <motion.li
                    animate={position}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute z-0 h-8 rounded-full pointer-events-none"
                    style={{ background: '#7a8a42', top: '50%', transform: 'translateY(-50%)' }}
                />
            </ul>

            {/* Right: Actions */}
            <div className="hidden lg:flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        {/* Bell Notification */}
                        <button className="relative p-2 text-[#2c2a1e]/60 hover:text-[#7a8a42] transition-colors rounded-xl hover:bg-[#F5F1E8]">
                            <Bell className="w-5 h-5" />
                            <span className="absolute w-2 h-2 bg-red-500 rounded-full top-2 right-2" />
                        </button>

                        <Link to={ROUTES.SETTINGS} className="p-2 text-[#2c2a1e]/60 hover:text-[#7a8a42] transition-colors rounded-xl hover:bg-[#F5F1E8]">
                            <Settings className="w-5 h-5" />
                        </Link>

                        {/* User Avatar */}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg, #7a8a42 0%, #2c2a1e 100%)' }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-[#2c2a1e]/60 rounded-xl font-label font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-[#7a8a42] hover:bg-[#F5F1E8] rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Log in
                        </Link>
                        <Link
                            to={ROUTES.SIGNUP}
                            className="px-6 py-2.5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-xl transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #7a8a42 0%, #5b6932 100%)',
                                boxShadow: '0 4px 16px rgba(122,138,66,0.35)'
                            }}
                        >
                            Get Started Free
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Toggle with AnimatePresence */}
            <button
                className="lg:hidden p-2 text-[#7a8a42]"
                onClick={() => setIsMenuOpen(o => !o)}
            >
                <AnimatePresence mode="wait">
                    {isMenuOpen
                        ? <motion.div key="x"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}>
                            <X className="w-6 h-6" />
                          </motion.div>
                        : <motion.div key="m"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}>
                            <Menu className="w-6 h-6" />
                          </motion.div>
                    }
                </AnimatePresence>
            </button>

            {/* Mobile Menu with AnimatePresence */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-[72px] left-0 w-full bg-white/95 backdrop-blur-xl border-b border-[#7a8a42]/10 lg:hidden shadow-2xl shadow-[#7a8a42]/10 p-6"
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-6 py-4 rounded-xl font-label font-bold uppercase tracking-widest text-sm ${isActive
                                            ? 'bg-[#7a8a42] text-white'
                                            : 'text-[#2c2a1e]/70 hover:bg-[#F5F1E8]'
                                        }`
                                    }
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.name}
                                </NavLink>
                            ))}
                            {!isAuthenticated ? (
                                <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-[#7a8a42]/10">
                                    <Link to={ROUTES.LOGIN} onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center font-bold text-[#2c2a1e]/70 uppercase tracking-widest text-sm hover:bg-[#F5F1E8] rounded-xl transition-all">Log in</Link>
                                    <Link
                                        to={ROUTES.SIGNUP}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full py-4 text-white rounded-xl font-bold text-center uppercase tracking-widest text-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, #7a8a42 0%, #5b6932 100%)',
                                            boxShadow: '0 4px 16px rgba(122,138,66,0.35)'
                                        }}
                                    >
                                        Sign up Free
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { logout(); setIsMenuOpen(false); }}
                                    className="w-full flex items-center gap-4 px-6 py-4 text-red-500 font-bold uppercase tracking-widest text-sm hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
