import React from 'react';

const FEATURE_DATA = [
    {
        title: "Live Safety Map",
        description: "Crowdsourced, real-time insights on neighborhood safety, well-lit routes, and verified safe zones.",
        icon: "map",
        bgColor: "bg-[#f5f0e0]",
        iconColor: "text-[#8d9d4f]"
    },
    {
        title: "SOS Emergency",
        description: "Instantly alert your trusted circle and local authorities with a discrete, single-tap mechanism.",
        icon: "emergency",
        bgColor: "bg-[#f5f0e0]",
        iconColor: "text-[#8d9d4f]"
    },
    {
        title: "Guardian Network",
        description: "Build a curated circle of trusted contacts who can monitor your journey progress in real-time.",
        icon: "groups",
        bgColor: "bg-[#f5f0e0]",
        iconColor: "text-[#8d9d4f]"
    }
];

export default function FeatureCards() {
    return (
        <section className="py-24 bg-[#faf8f2]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
                    <h2 className="font-headline font-bold text-4xl lg:text-5xl text-[#2c2a1e]">Your Sovereign Sanctuary</h2>
                    <p className="font-body text-[#3a3520]/60 text-lg">
                        A suite of curated tools designed to provide peace of mind without compromising your independence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {FEATURE_DATA.map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-[24px] p-10 space-y-6 shadow-sm border border-[#f5f0e0] group hover:bg-[#8d9d4f] hover:shadow-xl hover:scale-[1.02] transition-all duration-500 cursor-default"
                        >
                            <div className={`w-14 h-14 ${feature.bgColor} rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-white`}>
                                <span className={`material-symbols-outlined text-2xl fill-1 ${feature.iconColor} transition-all duration-500 group-hover:text-[#8d9d4f] group-hover:scale-110`}>{feature.icon}</span>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-headline font-bold text-2xl text-[#2c2a1e] transition-colors duration-500 group-hover:text-white">{feature.title}</h3>
                                <p className="font-body text-[#3a3520]/60 leading-relaxed transition-colors duration-500 group-hover:text-white/80">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


