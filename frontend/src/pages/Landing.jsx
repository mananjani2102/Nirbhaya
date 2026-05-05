import React from 'react';
import HeroSection from '../components/Landing/HeroSection';
import StatsSection from '../components/Landing/StatsSection';
import FeaturesSection from '../components/Landing/FeaturesSection';
import HowItWorksSection from '../components/Landing/HowItWorksSection';
import TrustSection from '../components/Landing/TrustSection';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import PricingSection from '../components/Landing/PricingSection';
import NirbhayaFAQ from '../components/ui/faq-accordion';
import AppDownloadSection from '../components/Landing/AppDownloadSection';
import NewsletterSection from '../components/Landing/NewsletterSection';
import Footer from '../components/Common/Footer';

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TrustSection />
            <TestimonialsSection />
            <PricingSection />
            <NirbhayaFAQ />
            <AppDownloadSection />
            <NewsletterSection />
            <Footer />
        </div>
    );
}
