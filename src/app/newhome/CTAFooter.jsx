'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTAFooter() {
    return (
        <>
            {/* CTA Section */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C6FF55]/15 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
                            Ready to accelerate your<br className="hidden md:block" /> fundraising?
                        </h2>
                        <p className="text-lg font-inter text-[#6B6B6B] mt-4 max-w-xl mx-auto">
                            Join hundreds of founders who've successfully raised funding with MyFundingList
                        </p>

                        <div className="mt-10">
                            <button className="group inline-flex items-center gap-2 bg-[#1E1E1E] text-white font-inter font-semibold text-base rounded-full px-10 py-5 shadow-xl shadow-black/15 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
                                Start Connecting with Investors
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-black/[0.06] py-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1E1E1E] rounded-lg flex items-center justify-center">
                                <span className="text-white font-space font-bold text-xs">MFL</span>
                            </div>
                            <span className="font-space font-bold text-[#1E1E1E] text-sm">MyFundingList</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm font-inter text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors">Privacy</a>
                            <a href="#" className="text-sm font-inter text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors">Terms</a>
                            <a href="#" className="text-sm font-inter text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors">Contact</a>
                        </div>
                        <p className="text-xs font-inter text-[#6B6B6B]">© 2026 MyFundingList. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}