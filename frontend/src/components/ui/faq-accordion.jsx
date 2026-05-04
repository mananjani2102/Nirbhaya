import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Shield, MapPin, Bell, Lock, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  {
    id: "1",
    icon: Shield,
    title: "Is Nirbhaya free to use?",
    content:
      "Yes! Basic Haven is completely free — includes core Safety Map, standard SOS alerts, and up to 2 active Guardians. Upgrade to Premium Guardian at ₹199/month for live location sharing, priority SOS routing, unlimited Guardians, and offline maps.",
  },
  {
    id: "2",
    icon: Bell,
    title: "How does the SOS Emergency alert work?",
    content:
      "A single tap instantly sends your real-time GPS location to your Guardian circle and local emergency services — no typing, no delay. Premium users get priority routing to the nearest verified emergency contact.",
  },
  {
    id: "3",
    icon: Users,
    title: "What is the Guardian Network?",
    content:
      "Your Guardian Network is a trusted circle of family, friends, or colleagues who can monitor your journey live and receive SOS alerts on your behalf. Basic Haven supports 2 Guardians; Premium gives you unlimited entries.",
  },
  {
    id: "4",
    icon: MapPin,
    title: "How accurate is the Live Safety Map?",
    content:
      "The Live Safety Map combines crowd-sourced community reports and verified data to show safe zones, police stations, hospitals, and flagged areas — updated in real-time. Premium users unlock offline maps for zero-internet access.",
  },
  {
    id: "5",
    icon: Lock,
    title: "Is my location and personal data private?",
    content:
      "Absolutely. Your location is only shared with your manually approved Guardians and emergency services during an active SOS. We never sell your data. Everything is end-to-end encrypted.",
  },
  {
    id: "6",
    icon: CreditCard,
    title: "Can I cancel my Premium Guardian plan anytime?",
    content:
      "Yes — cancel or change your plan anytime from your dashboard. You keep Premium access until the billing cycle ends, then revert to the free Basic Haven plan. No data is ever lost.",
  },
];

export default function NirbhayaFAQ() {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (id) => {
    setOpenItem((current) => (current === id ? null : id));
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-5">
            <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
            <span
              className="text-xs uppercase tracking-widest font-bold text-primary"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Safety First
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Merriweather, serif" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-muted-foreground text-base max-w-md mx-auto"
            style={{ fontFamily: "Source Serif 4, serif" }}
          >
            Everything you need to know about traveling fearlessly with Nirbhaya.
          </p>
        </div>

        {/* Accordion Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-custom">
          {items.map(({ id, icon: Icon, title, content }, index) => {
            const isOpen = openItem === id;
            const isLast = index === items.length - 1;

            return (
              <div
                key={id}
                className={!isLast ? "border-b border-border" : ""}
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleItem(id)}
                  aria-expanded={isOpen}
                  className={`
                    flex items-center justify-between w-full
                    px-6 py-5 text-left
                    cursor-pointer select-none
                    transition-colors duration-300
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    ${isOpen
                      ? "bg-muted"
                      : "bg-transparent hover:bg-muted/60"
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Icon badge */}
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        flex-shrink-0 transition-colors duration-300
                        ${isOpen
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-primary border border-border"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <span
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isOpen ? "text-primary" : "text-foreground"
                      }`}
                      style={{ fontFamily: "Merriweather, serif" }}
                    >
                      {title}
                    </span>
                  </div>

                  {/* Plus / Minus toggle */}
                  <div className="relative w-5 h-5 flex-shrink-0 ml-4">
                    <Plus
                      className={`absolute inset-0 text-muted-foreground transition-all duration-300 ${
                        isOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                      }`}
                      strokeWidth={2}
                    />
                    <Minus
                      className={`absolute inset-0 text-primary transition-all duration-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                </button>

                {/* Animated Content */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  {/* Left accent bar + content */}
                  <div className="flex">
                    <div className="w-1 bg-primary flex-shrink-0 ml-6 rounded-full my-3" />
                    <p
                      className="px-5 py-4 text-sm leading-relaxed text-muted-foreground"
                      style={{ fontFamily: "Source Serif 4, serif" }}
                    >
                      {content}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p
          className="text-center text-sm text-muted-foreground mt-8"
          style={{ fontFamily: "Source Serif 4, serif" }}
        >
          Still have questions?{" "}
          <Link
            to="/support"
            className="text-primary font-semibold hover:underline underline-offset-2"
          >
            Contact our Safety Support Team
          </Link>{" "}
          — available 24/7.
        </p>

      </div>
    </section>
  );
}
