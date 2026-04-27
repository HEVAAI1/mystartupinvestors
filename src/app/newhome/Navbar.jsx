'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-[#1E1E1E] rounded-xl flex items-center justify-center">
                            <span className="text-white font-space font-bold text-sm">MFL</span>
                        </div>
                        <span className="font-space font-bold text-[#1E1E1E] text-lg hidden sm:block">MyFundingList</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <a href="#features" className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5">
                            Features
                        </a>
                        <a href="#pricing" className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5">
                            Pricing
                        </a>
                        <a href="#testimonials" className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5">
                            Testimonials
                        </a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button className="px-5 py-2.5 text-sm font-inter font-medium text-[#1E1E1E] hover:bg-black/5 rounded-full transition-colors">
                            Sign In
                        </button>
                        <button className="px-5 py-2.5 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full hover:bg-[#333] transition-all shadow-lg shadow-black/10">
                            Get Started
                        </button>
                    </div>

                    <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/90 backdrop-blur-xl border-t border-black/5"
                    >
                        <div className="px-6 py-4 flex flex-col gap-2">
                            <a href="#features" className="py-2 text-sm font-inter text-[#31372B]">Features</a>
                            <a href="#pricing" className="py-2 text-sm font-inter text-[#31372B]">Pricing</a>
                            <a href="#testimonials" className="py-2 text-sm font-inter text-[#31372B]">Testimonials</a>
                            <div className="flex gap-2 mt-2">
                                <button className="flex-1 py-2.5 text-sm font-inter text-[#1E1E1E] border border-black/10 rounded-full">Sign In</button>
                                <button className="flex-1 py-2.5 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full">Get Started</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}