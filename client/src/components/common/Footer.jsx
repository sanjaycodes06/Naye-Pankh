import { Link } from "react-router-dom";
import { Leaf, Heart, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

const FooterLink = ({ to, children }) => (
  <Link to={to} className="text-sm text-ink-400 hover:text-brand-500 transition-colors">
    {children}
  </Link>
);

const Footer = () => (
  <footer className="bg-ink-900 text-white mt-auto">

    {/* Main footer body */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-10">

        {/* Brand column */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
            </div>
            <div className="leading-none">
              <span className="block font-display font-bold text-base text-white">NayePankh</span>
              <span className="block text-2xs text-ink-400 tracking-wider uppercase mt-0.5">Foundation</span>
            </div>
          </div>
          <p className="text-sm text-ink-400 leading-relaxed">
            Empowering communities through volunteerism. Every pair of wings makes a difference.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-3">
            {[
              { icon: Twitter,  href: "#", label: "Twitter" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
              { icon: Github,   href: "#", label: "GitHub" },
            ].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center text-ink-400 hover:text-white hover:bg-brand-500 transition-all"
                aria-label={label}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-widest">Navigation</h3>
          <ul className="space-y-2.5">
            {[
              { to: "/",          label: "Home" },
              { to: "/about",     label: "About Us" },
              { to: "/register",  label: "Become a Volunteer" },
              { to: "/login",     label: "Volunteer Login" },
              { to: "/public/verify/:code", label: "Verify Certificate" },
            ].map(({ to, label }) => (
              <li key={to}><FooterLink to={to}>{label}</FooterLink></li>
            ))}
          </ul>
        </div>

        {/* For Volunteers */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-widest">Volunteers</h3>
          <ul className="space-y-2.5">
            {[
              { to: "/volunteer/dashboard",    label: "My Dashboard" },
              { to: "/volunteer/tasks",        label: "My Tasks" },
              { to: "/volunteer/attendance",   label: "Attendance" },
              { to: "/volunteer/certificates", label: "Certificates" },
              { to: "/volunteer/profile",      label: "My Profile" },
            ].map(({ to, label }) => (
              <li key={to}><FooterLink to={to}>{label}</FooterLink></li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-widest">Volunteers</h3>
          <ul className="space-y-2.5">
            {[
              { label: "Privacy Policy", to: "/" },
                  { label: "Terms of Use", to: "/" },
                  { label: "Cookie Policy", to: "/" },
                  { label: "Grievance", to: "/" },
            ].map(({ to, label }) => (
              <li key={to}><FooterLink to={to}>{label}</FooterLink></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-5">
          <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-widest">Contact</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-ink-400">
              <MapPin size={15} className="mt-0.5 text-brand-500 shrink-0" />
              <span>NayePankh Foundation, New Delhi, India</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-ink-400">
              <Mail size={15} className="text-brand-500 shrink-0" />
              <a href="mailto:hello@nayepankh.org" className="hover:text-brand-400 transition-colors">
                hello@nayepankh.org
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-ink-400">
              <Phone size={15} className="text-brand-500 shrink-0" />
              <a href="tel:+911234567890" className="hover:text-brand-400 transition-colors">
                +91 123 456 7890
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-ink-500">
          © {new Date().getFullYear()} NayePankh Foundation. All rights reserved.
        </p>
        <p className="text-xs text-ink-500 flex items-center gap-1.5">
          Built with <Heart size={11} className="text-brand-500 fill-brand-500" /> for a better tomorrow
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
