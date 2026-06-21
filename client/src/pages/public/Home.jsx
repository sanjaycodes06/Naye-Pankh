import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Heart, Users, Clock, Award, MapPin,
  Quote, Mail, Phone, ChevronDown, Star, Leaf,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (scoped to this page — no Tailwind plugin needed)
───────────────────────────────────────────────────────────────────────────── */
const T = {
  forest:  "#1B3A2D",
  forestL: "#234D3A",
  cream:   "#F7F2E8",
  creamD:  "#EDE6D5",
  gold:    "#C8923A",
  goldL:   "#D9A855",
  sage:    "#7BAF8A",
  sageL:   "#A8C9B0",
  ink:     "#1A2518",
  mist:    "#FDFAF5",
};

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────────────────────────────────────── */
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

/* ─────────────────────────────────────────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
───────────────────────────────────────────────────────────────────────────── */
const useInView = (threshold = 0.3) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAT ITEM
───────────────────────────────────────────────────────────────────────────── */
const StatItem = ({ value, suffix = "", label, started }) => {
  const count = useCounter(value, 2200, started);
  return (
    <div className="text-center">
      <div className="text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", color: T.gold }}>
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="mt-2 text-sm font-medium uppercase tracking-widest" style={{ color: T.sageL }}>
        {label}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────────────────────────────────────────── */
const Section = ({ id, children, className = "", style = {} }) => (
  <section id={id} className={`w-full ${className}`} style={style}>
    {children}
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [statsRef, statsInView] = useInView(0.4);

  /* Scroll-to helper */
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="overflow-x-hidden" style={{ background: T.mist, fontFamily: "'DM Sans', sans-serif", color: T.ink }}>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <Section id="hero" style={{ background: T.forest, minHeight: "100dvh", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* Textural background glyph */}
        <div aria-hidden="true" style={{
          position: "absolute", top: "50%", right: "-2%",
          transform: "translateY(-50%)",
          fontSize: "clamp(260px, 40vw, 560px)",
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 900,
          lineHeight: 1,
          color: T.forestL,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.05em",
        }}>
          नए
        </div>

        {/* Subtle dot-grid overlay */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(${T.forestL} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.35,
        }} />

        {/* Gold top-border accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div style={{ width: 32, height: 2, background: T.gold }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: T.gold }}>
                NayePankh Foundation
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, lineHeight: 1.08, color: T.cream, fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
              Give someone<br />
              <em style={{ fontStyle: "italic", color: T.gold }}>new wings</em><br />
              to fly.
            </h1>

            {/* Sub */}
            <p className="mt-6 text-lg leading-relaxed max-w-lg" style={{ color: T.sageL }}>
              Join India's most passionate volunteer community. One hour of your time can change a child's entire trajectory.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:gap-3"
                style={{ background: T.gold, color: T.ink }}
              >
                Become a Volunteer <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => scrollTo("about")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border"
                style={{ borderColor: `${T.sage}60`, color: T.cream, background: "transparent" }}
              >
                Learn more
              </button>
            </div>

            {/* Trust bar */}
            <div className="mt-14 flex flex-wrap items-center gap-6">
              {[
                { n: "4,200+", l: "Volunteers" },
                { n: "18", l: "States" },
                { n: "97k+", l: "Hours served" },
              ].map(({ n, l }) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ fontFamily: "'Fraunces', serif", color: T.cream }}>{n}</span>
                  <span className="text-xs uppercase tracking-wider" style={{ color: `${T.sageL}90` }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={() => scrollTo("about")}
          aria-label="Scroll down"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xs uppercase tracking-widest" style={{ color: T.sage, fontSize: "10px" }}>scroll</span>
          <ChevronDown size={18} style={{ color: T.sage }} />
        </button>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          IMPACT STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <Section id="stats" style={{ background: T.forestL }}>
        <div ref={statsRef} className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            <StatItem value={4200}  suffix="+"  label="Volunteers"      started={statsInView} />
            <StatItem value={97000} suffix="+"  label="Hours Served"    started={statsInView} />
            <StatItem value={18}            label="States Reached"  started={statsInView} />
            <StatItem value={200000} suffix="+"  label="Lives Impacted"  started={statsInView} />
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════════════════ */}
      <Section id="about" style={{ background: T.mist }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: visual */}
            <div className="relative order-2 lg:order-1">
              {/* Card stack */}
              <div style={{ position: "relative", paddingBottom: "32px", paddingRight: "32px" }}>
                {/* Back card */}
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "85%", height: "85%", background: T.creamD, borderRadius: "20px", border: `1px solid ${T.creamD}` }} />
                {/* Gold accent block */}
                <div style={{ position: "absolute", top: "50%", left: "-20px", transform: "translateY(-50%)", width: "6px", height: "80px", background: T.gold, borderRadius: "3px" }} />
                {/* Main image-placeholder */}
                <div style={{ position: "relative", background: `linear-gradient(135deg, #0f172a 0%, #000246 100%)`, borderRadius: "20px", aspectRatio: "4/3", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="w-160 h-160 bg-slate-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
                    <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/YKbL494Mv8Ip3qgy/whatsapp-image-2023-01-31-at-9.40.45-pm-dWxpDb2pNbCaxERZ.jpeg" alt="NayePankh" className="text-white"   />
                  </div>
                  {/* Overlay label */}
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", borderRadius: "12px", padding: "12px 16px" }}>
                    <p style={{ color: T.cream, fontSize: "13px", fontWeight: 600 }}>Empowering communities since 2018</p>
                    <p style={{ color: T.sageL, fontSize: "11px", marginTop: "2px" }}>New Delhi, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-5">
                <div style={{ width: 24, height: 2, background: T.gold }} />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: T.gold }}>Our Story</span>
              </div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", lineHeight: 1.15, color: T.forest }}>
                Think global, Act local.
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#4A5568" }}>
                "NayePankh Foundation"  — is a non governmental organisation with a strong desire to help the society and make it a better place for all, by doing everything in our power and to make our vision successful we would require your vital support. Service to mankind is the service to god. Let’s revolutionise the society together!.
              </p>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "#4A5568" }}>
                We work across education, nutrition, mental health, and skill-building, connecting passionate volunteers with communities that need them most. No professional experience required — only a willing heart.
              </p>

              {/* Feature list */}
              <ul className="mt-8 space-y-3">
                {[
                  "100% volunteer-led — every rupee goes to the cause",
                  "Structured onboarding and ongoing training",
                  "Verifiable certificates for every contribution",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div style={{ width: 20, height: 20, background: `${T.sage}25`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <div style={{ width: 6, height: 6, background: T.sage, borderRadius: "50%" }} />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-8 text-sm font-semibold transition-all hover:gap-3"
                style={{ color: T.forest }}
              >
                Read our full story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          VOLUNTEER BENEFITS
      ══════════════════════════════════════════════════════════════ */}
      <Section id="benefits" style={{ background: T.cream }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-32">

          {/* Header */}
          <div className="max-w-xl mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 24, height: 2, background: T.gold }} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: T.gold }}>Why Volunteer</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", lineHeight: 1.15, color: T.forest }}>
              What you give — and what you gain.
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "#4A5568" }}>
              Volunteering with NayePankh isn't charity — it's a two-way exchange that builds skills, connections, and perspective.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Real-world impact",
                desc: "See the direct change your hours create — not through a report, but through the face of a child who now knows how to read.",
                accent: T.gold,
              },
              {
                icon: Award,
                title: "Verified certificates",
                desc: "Every task you complete earns a digitally-verifiable certificate. Scan the QR code — it's authentic, shareable, and looks good on LinkedIn.",
                accent: T.sage,
              },
              {
                icon: Users,
                title: "A lifelong network",
                desc: "Join a community of 4,200+ volunteers — teachers, doctors, engineers, artists — who share your values and your ambition.",
                accent: T.gold,
              },
              {
                icon: Clock,
                title: "Flex your schedule",
                desc: "Weekend, weekday, morning, evening — volunteer on your terms. Even two hours a month makes a measurable difference.",
                accent: T.sage,
              },
              {
                icon: MapPin,
                title: "Local and remote",
                desc: "Whether you prefer hands-on field work or contributing from your laptop, we have roles across 18 states and online.",
                accent: T.gold,
              },
              {
                icon: Star,
                title: "Skill development",
                desc: "Teaching, event management, fundraising, design — choose activities that stretch you professionally while you give back.",
                accent: T.sage,
              },
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div key={title}
                className="group p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ background: T.mist, border: `1px solid ${T.creamD}` }}
              >
                <div style={{ width: 44, height: 44, background: `${accent}18`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <Icon size={20} style={{ color: accent }} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif", color: T.forest }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-all hover:gap-3"
              style={{ background: T.forest, color: T.cream }}
            >
              Start volunteering today <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <Section id="testimonials" style={{ background: T.forest }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-32">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div style={{ width: 24, height: 2, background: T.gold }} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: T.gold }}>Voices</span>
              <div style={{ width: 24, height: 2, background: T.gold }} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", lineHeight: 1.15, color: T.cream }}>
              From the people who showed up.
            </h2>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I joined NayePankh thinking I'd teach kids English for a few months. Three years later, I'm leading a 40-volunteer programme in Jaipur. It changed what I thought was possible for me.",
                name: "Priya Sharma",
                role: "Software Engineer, Jaipur",
                initials: "PS",
                accent: T.gold,
              },
              {
                quote: "The certificate I earned helped me explain my community work in interviews. But honestly, seeing the kids graduate from our programme — no certificate compares to that.",
                name: "Arjun Mehta",
                role: "Medical Student, Mumbai",
                initials: "AM",
                accent: T.sage,
              },
              {
                quote: "I was nervous as a first-time volunteer. Within a week, the NayePankh team made me feel like I'd been part of the family for years. The onboarding is genuinely excellent.",
                name: "Sneha Iyer",
                role: "Graphic Designer, Bangalore",
                initials: "SI",
                accent: T.gold,
              },
            ].map(({ quote, name, role, initials, accent }) => (
              <div key={name}
                className="flex flex-col p-8 rounded-2xl"
                style={{ background: T.forestL, border: `1px solid ${T.forest}` }}
              >
                <Quote size={28} style={{ color: accent, opacity: 0.7, marginBottom: "20px" }} strokeWidth={1.5} />
                <p className="text-sm leading-relaxed flex-1" style={{ color: T.sageL }}>{quote}</p>
                <div className="flex items-center gap-3 mt-6 pt-6" style={{ borderTop: `1px solid ${T.forest}` }}>
                  <div style={{ width: 40, height: 40, background: `${accent}25`, border: `1.5px solid ${accent}60`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="text-xs font-bold" style={{ color: accent }}>{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: T.cream }}>{name}</p>
                    <p className="text-xs" style={{ color: `${T.sageL}80` }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════════════ */}
      <Section id="contact" style={{ background: T.mist }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div style={{ width: 24, height: 2, background: T.gold }} />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: T.gold }}>Get in Touch</span>
              </div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.6rem)", lineHeight: 1.15, color: T.forest }}>
                Questions? We're a real team with real answers.
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#4A5568" }}>
                Whether you're curious about what volunteering looks like, want to partner with us, or need help with your account — reach out. We reply within 24 hours.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  { icon: Mail,  value: "hello@nayepankh.org",  label: "Email us" },
                  { icon: Phone, value: "+91 98100 00000",      label: "Call us" },
                  { icon: MapPin,value: "New Delhi, India",     label: "Find us" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={value} className="flex items-center gap-4">
                    <div style={{ width: 44, height: 44, background: `${T.sage}18`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} style={{ color: T.sage }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-2xs uppercase tracking-wider mb-0.5" style={{ color: "#9CA3AF", fontSize: "10px" }}>{label}</p>
                      <p className="text-sm font-medium" style={{ color: T.forest }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: contact form */}
            <div className="p-8 rounded-2xl" style={{ background: T.cream, border: `1px solid ${T.creamD}` }}>
              <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Fraunces', serif", color: T.forest }}>Send us a message</h3>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>First name</label>
                    <input
                      type="text"
                      placeholder="Priya"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: T.mist, border: `1.5px solid ${T.creamD}`, color: T.ink, fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => e.target.style.borderColor = T.sage}
                      onBlur={e => e.target.style.borderColor = T.creamD}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Last name</label>
                    <input
                      type="text"
                      placeholder="Sharma"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: T.mist, border: `1.5px solid ${T.creamD}`, color: T.ink, fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => e.target.style.borderColor = T.sage}
                      onBlur={e => e.target.style.borderColor = T.creamD}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Email</label>
                  <input
                    type="email"
                    placeholder="priya@example.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: T.mist, border: `1.5px solid ${T.creamD}`, color: T.ink, fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = T.sage}
                    onBlur={e => e.target.style.borderColor = T.creamD}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Subject</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
                    style={{ background: T.mist, border: `1.5px solid ${T.creamD}`, color: T.ink, fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = T.sage}
                    onBlur={e => e.target.style.borderColor = T.creamD}
                  >
                    <option value="">Select a topic</option>
                    <option>Volunteering enquiry</option>
                    <option>Partnership / CSR</option>
                    <option>Media & press</option>
                    <option>Account help</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{ background: T.mist, border: `1.5px solid ${T.creamD}`, color: T.ink, fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = T.sage}
                    onBlur={e => e.target.style.borderColor = T.creamD}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={{ background: T.forest, color: T.cream, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{ background: T.ink }}>

        Footer CTA band
        <div style={{ background: T.gold }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center">
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.35rem", color: T.ink }}>
              Ready to give someone new wings?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:gap-3"
              style={{ background: T.ink, color: T.cream }}
            >
              Join us now <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Footer body */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-1">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              {/* <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
                  <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ fontFamily: "'Fraunces', serif", color: T.cream }}>NayePankh</div>
                  <div className="text-2xs uppercase tracking-wider" style={{ color: "#6B7280", fontSize: "9px" }}>Foundation</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                Empowering communities through volunteerism since 2018.
              </p> */}
            </div>

            
            {[
            //   {
            //     heading: "Platform",
            //     links: [
            //       { label: "Home", to: "/" },
            //       { label: "About Us", to: "/about" },
            //       { label: "Volunteer", to: "/register" },
            //       { label: "Login", to: "/login" },
            //     ],
            //   },
            //   {
            //     heading: "Volunteer",
            //     links: [
            //       { label: "Dashboard", to: "/volunteer/dashboard" },
            //       { label: "My Tasks", to: "/volunteer/tasks" },
            //       { label: "Certificates", to: "/volunteer/certificates" },
            //       { label: "Verify Certificate", to: "/verify/code" },
            //     ],
            //   },
            //   {
            //     heading: "Legal",
            //     links: [
            //       { label: "Privacy Policy", to: "/" },
            //       { label: "Terms of Use", to: "/" },
            //       { label: "Cookie Policy", to: "/" },
            //       { label: "Grievance", to: "/" },
            //     ],
            //   },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-2xs font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: "#6B7280" }}>{heading}</p>
                <ul className="space-y-2.5">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="text-xs transition-colors hover:text-white" style={{ color: "#9CA3AF" }}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: "1px solid #1F2937" }}>
            <p className="text-xs" style={{ color: "#4B5563" }}>
              © {new Date().getFullYear()} NayePankh Foundation. All rights reserved.
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: "#4B5563" }}>
              Made with <Heart size={11} style={{ color: T.gold, fill: T.gold }} /> in India
            </p>
          </div> */}
        </div>
      </footer>

    </div>
  );
}
