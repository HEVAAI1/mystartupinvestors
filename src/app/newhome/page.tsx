import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import LogoMarquee from './LogoMarquee';
import StepsSection from './StepsSection';
import FeaturesGrid from './FeaturesGrid';
import StatsGateway from './StatsGateaway';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import CTAFooter from './CTAFooter';

export default function NewHome() {
    return (
        <main className="min-h-screen bg-[#F5F2E8] font-inter text-foreground relative overflow-hidden">
            <Navbar />
            <HeroSection />
            <LogoMarquee />
            <StepsSection />
            <FeaturesGrid />
            <StatsGateway />
            <PricingSection />
            <TestimonialsSection />
            <FAQSection />
            <CTAFooter />
        </main>
    );
}