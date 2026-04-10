import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  MessageCircle, Bot, Zap, TrendingUp, Clock, Shield, ChevronRight,
  Phone, Mail, MapPin, ArrowRight, CheckCircle2, Star, Menu, X,
  Users, BarChart3, Globe, Sparkles, Play, ExternalLink,
  Calendar, Monitor, Lock
} from "lucide-react";

// ─── Sticky Navigation ───────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how" },
    { label: "Industries", href: "#who" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[oklch(0.12_0.015_260/95%)] backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg glow-green-sm group-hover:scale-110 transition-transform">M</div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">Manna Digital Hub</span>
            <span className="hidden sm:block text-[10px] text-lime-400/80 tracking-widest uppercase -mt-0.5">AI Automation</span>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">{l.label}</a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <Button onClick={() => setLocation("/admin")} className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-slate-900 font-semibold shadow-lg glow-green-sm">
              Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <>
              <a href="/admin/login" className="px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Admin
              </a>
              <a href="https://wa.me/27734061526?text=Hi%2C%20I%20want%20to%20automate%20my%20business" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-lime-500/30 text-lime-400 hover:bg-lime-500/10 hover:border-lime-400/50">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
                </Button>
              </a>
              <a href="#contact">
                <Button className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-slate-900 font-semibold shadow-lg glow-green-sm">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[oklch(0.14_0.015_260/98%)] backdrop-blur-xl border-t border-white/5 pb-6">
          <div className="container mx-auto flex flex-col gap-1 pt-4">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{l.label}</a>
            ))}
            <div className="flex flex-col gap-2 mt-4 px-4">
              <a href="/admin/login" className="flex items-center gap-2 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors text-sm">
                <Lock className="w-4 h-4" /> Admin Login
              </a>
              <a href="https://wa.me/27734061526?text=Hi%2C%20I%20want%20to%20automate%20my%20business" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-lime-500/30 text-lime-400">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
                </Button>
              </a>
              <a href="#contact">
                <Button className="w-full bg-gradient-to-r from-lime-500 to-lime-600 text-slate-900 font-semibold">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[oklch(0.1_0.02_260)]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-400/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-lime-300/5 rounded-full blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-lime-400">
              <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse-dot" />
              Serving businesses across Africa &amp; beyond
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              <span className="text-white">Your Business.</span><br />
              <span className="text-gradient-green">Automated.</span><br />
              <span className="text-white">Always On.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-400 max-w-xl leading-relaxed">
              We help South African businesses stop losing leads after hours, on weekends, and during load-shedding — with <strong className="text-white">AI-powered WhatsApp bots</strong>, chatbots, and automated follow-up systems.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "24/7", label: "Always-on" },
                { value: "48hr", label: "Setup time" },
                { value: "R0", label: "Leads lost" },
                { value: "9×", label: "More conversions" },
              ].map(s => (
                <div key={s.label} className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-green">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://wa.me/27734061526?text=Hi%2C%20I%20want%20a%20free%20discovery%20call" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-lime-400 to-lime-600 hover:from-lime-300 hover:to-lime-500 text-slate-900 font-bold text-lg px-8 py-6 shadow-xl glow-green">
                  Start Automating <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="#services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 text-lg px-8 py-6">
                  See Our Services
                </Button>
              </a>
            </div>
          </div>

          {/* Right — Live bot demo card */}
          <div className="relative">
            <div className="relative glass rounded-2xl p-6 space-y-4 glow-green">
              {/* Live indicator */}
              <div className="flex items-center gap-2 text-lime-400 text-sm font-medium">
                <span className="w-2.5 h-2.5 bg-lime-400 rounded-full animate-pulse-dot" />
                Live right now
              </div>

              {/* Simulated bot interactions */}
              <div className="space-y-3">
                {[
                  { icon: MessageCircle, text: "WhatsApp bot responding to leads", color: "text-lime-400" },
                  { icon: Bot, text: "AI chatbot capturing enquiries", color: "text-lime-300" },
                  { icon: TrendingUp, text: "Follow-up sequences running", color: "text-yellow-400" },
                  { icon: Globe, text: "11 languages active", color: "text-cyan-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-500/20 to-lime-600/20 flex items-center justify-center">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-slate-300 text-base group-hover:text-white transition-colors">{item.text}</span>
                    <CheckCircle2 className="w-4 h-4 text-lime-500 ml-auto" />
                  </div>
                ))}
              </div>

              {/* Mini chat preview */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-lime-900/20 to-lime-800/10 border border-lime-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-slate-900 text-xs font-bold">M</div>
                  <div>
                    <div className="text-sm font-medium text-white">Manna Bot</div>
                    <div className="text-[10px] text-lime-400">Online</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-white/10 rounded-lg rounded-bl-none px-3 py-2 text-slate-300 max-w-[80%]">
                    Hi! Welcome to Manna Digital Hub. How can I help your business today?
                  </div>
                  <div className="bg-lime-500/20 rounded-lg rounded-br-none px-3 py-2 text-lime-200 max-w-[80%] ml-auto">
                    I want to automate my WhatsApp
                  </div>
                  <div className="bg-white/10 rounded-lg rounded-bl-none px-3 py-2 text-slate-300 max-w-[80%]">
                    Great choice! Our WhatsApp automation responds to every message 24/7. Let me book you a free discovery call...
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-lime-500 text-slate-900 text-xs font-bold shadow-lg glow-green-sm animate-float">
              AI Powered
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div className="absolute bottom-0 left-0 right-0 py-4 bg-gradient-to-r from-lime-900/10 via-lime-800/5 to-lime-900/10 border-t border-b border-white/5 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {["WhatsApp Automation", "AI Chatbots", "Lead Follow-Up", "Social Media AI", "24/7 Response", "Website Design", "South Africa", "Nigeria", "Kenya", "Ghana", "Garden Route", "George", "Cape Town", "POPIA Compliant", "Stop Losing Leads", "WhatsApp Automation", "AI Chatbots", "Lead Follow-Up", "Social Media AI", "24/7 Response", "Website Design", "South Africa", "Nigeria", "Kenya", "Ghana", "Garden Route", "George", "Cape Town", "POPIA Compliant", "Stop Losing Leads"].map((t, i) => (
            <span key={i} className="mx-6 text-sm text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-lime-500/50 rounded-full" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem Section ──────────────────────────────────────────
function ProblemSection() {
  const problems = [
    {
      icon: "😴",
      title: "Leads arrive at midnight",
      desc: "Customers WhatsApp and enquire outside business hours. Without automation, those messages sit unanswered until morning — and the customer is gone."
    },
    {
      icon: "🔁",
      title: "Follow-up falls through the cracks",
      desc: "Staff forget to follow up. Leads go cold. Deals that were 80% closed get lost simply because nobody sent a second message in time."
    },
    {
      icon: "⚡",
      title: "Load-shedding kills communication",
      desc: "When the lights go out, your automated systems keep running. Cloud-based AI doesn't need your office power — it works through anything."
    },
  ];

  return (
    <section className="relative py-24 bg-[oklch(0.08_0.02_260)]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm text-red-400/80 font-medium uppercase tracking-wider">The Problem</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            Your business is losing money<br />
            <span className="text-gradient-green">while you sleep.</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            South African businesses respond to leads an average of <strong className="text-white">11 hours late</strong>. By then, the customer has already gone elsewhere. AI automation fixes this — permanently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <Card key={i} className="bg-white/[0.03] border-white/5 hover:border-lime-500/20 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">{p.title}</h3>
                <p className="text-slate-400 text-base leading-relaxed">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────
function ServicesSection() {
  const services = [
    {
      num: "01",
      icon: MessageCircle,
      title: "WhatsApp Automation",
      desc: "Your business responds to every WhatsApp message instantly — 24/7, including weekends and public holidays. Automatically answers FAQs, captures lead details, books appointments, and escalates only when needed.",
      setup: "R3,500–R5,000",
      monthly: "R1,200/month",
      popular: true,
    },
    {
      num: "02",
      icon: Bot,
      title: "AI Website Chatbot",
      desc: "A fully trained AI assistant lives on your website and answers visitor questions around the clock. It qualifies leads, captures contact details, and passes hot leads directly to your inbox or WhatsApp.",
      setup: "R4,000–R6,000",
      monthly: "R950/month",
    },
    {
      num: "03",
      icon: TrendingUp,
      title: "Automated Lead Follow-Up",
      desc: "The moment a lead comes in — from your website, Facebook, or walk-in — an automated sequence of WhatsApp and email messages fires off. Follow-up happens in seconds, not hours. Deals close faster.",
      setup: "R2,500–R4,000",
      monthly: "R750/month",
    },
    {
      num: "04",
      icon: Calendar,
      title: "Social Media AI Management",
      desc: "AI-generated content calendars and automated posting across Facebook, Instagram, and Google Business. 8+ posts per week, monthly analytics, and community management — zero effort on your side.",
      setup: "R3,500–R6,000",
      monthly: "R2,000/month",
    },
    {
      num: "05",
      icon: Monitor,
      title: "Website Design & Development",
      desc: "Custom-coded websites — not templates, not WordPress. Fast, mobile-first, SEO-ready, and built to convert. Every site includes WhatsApp and AI chatbot integration baked in from day one.",
      setup: "R5,000–R15,000",
      monthly: "R800/month",
      badge: "Our Work",
    },
  ];

  return (
    <section id="services" className="relative py-24 bg-[oklch(0.12_0.015_260)]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">Our Services</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            Everything you need to<br />
            <span className="text-gradient-green">never lose a lead again.</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            High-end AI automation at accessible prices. Built for South African businesses.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((s, i) => (
            <Card key={i} className={`relative bg-white/[0.03] border-white/5 hover:border-lime-500/20 transition-all duration-500 group hover:-translate-y-2 ${s.popular ? "ring-1 ring-lime-500/30" : ""}`}>
              {s.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-lime-500 to-lime-600 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              {s.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-slate-600 to-slate-700 text-lime-400 text-xs font-bold rounded-full shadow-lg border border-lime-500/20">
                  {s.badge}
                </div>
              )}
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-lime-500/40 text-sm font-mono">{s.num}</span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500/20 to-lime-600/10 flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-lime-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-lime-400 transition-colors">{s.title}</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-6">{s.desc}</p>
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Once-off setup</span>
                    <span className="text-white font-semibold">{s.setup}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly retainer</span>
                    <span className="text-lime-400 font-semibold">{s.monthly}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bundle card */}
        <Card className="bg-gradient-to-r from-lime-900/20 to-lime-800/10 border-lime-500/20 glow-green">
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-lime-400" />
                  <span className="text-lime-400 font-semibold text-sm uppercase tracking-wider">The Full AI Business Stack</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">All five services. One complete package.</h3>
                <p className="text-slate-300 text-lg">WhatsApp bot + Website chatbot + Lead follow-up + Social Media AI + AI Voice Receptionist. One setup, one monthly fee, total automation.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["WhatsApp Bot", "Website Chatbot", "Lead Follow-Up", "Social Media AI", "AI Voice (coming soon)"].map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-lime-500/10 text-lime-300 border border-lime-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-right shrink-0">
                <div className="text-4xl font-bold text-white">R15,000</div>
                <div className="text-lime-400 text-lg">setup + R4,500/month</div>
                <a href="https://wa.me/27734061526?text=Hi%2C%20I%27m%20interested%20in%20the%20Full%20AI%20Business%20Stack" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="mt-4 bg-gradient-to-r from-lime-500 to-lime-600 text-slate-900 font-bold shadow-lg">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "01", icon: Phone, title: "Free Discovery Call", desc: "We spend 30 minutes understanding your business, your customers, and where you're losing leads right now.", color: "from-blue-500/20 to-cyan-500/10" },
    { num: "02", icon: Zap, title: "We Build It", desc: "Our team configures your automation flows, trains your AI on your business, and sets everything up. You don't touch a thing.", color: "from-lime-500/20 to-lime-600/10" },
    { num: "03", icon: CheckCircle2, title: "You Approve", desc: "We show you exactly how it works, make any tweaks you want, and only go live once you're 100% happy.", color: "from-purple-500/20 to-pink-500/10" },
    { num: "04", icon: TrendingUp, title: "It Runs Itself", desc: "Your automation goes live. Leads get responded to instantly. You focus on your business. We handle the tech.", color: "from-amber-500/20 to-orange-500/10" },
  ];

  return (
    <section id="how" className="relative py-24 bg-[oklch(0.08_0.02_260)]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">How It Works</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            From zero to automated<br />
            <span className="text-gradient-green">in 48 hours.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative group">
              <Card className="bg-white/[0.03] border-white/5 hover:border-lime-500/20 transition-all duration-500 h-full hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-lime-500/40 text-xs font-mono">{s.num}</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-3 group-hover:text-lime-400 transition-colors">{s.title}</h3>
                  <p className="text-slate-400 text-base leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
              {i < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 text-lime-500/30">
                  <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who We Serve ─────────────────────────────────────────────
function IndustriesSection() {
  const industries = [
    { icon: "🏡", title: "Estate Agents", desc: "Never miss a property enquiry. Respond to buyers and renters instantly, 24/7." },
    { icon: "🏨", title: "Guest Houses & Tourism", desc: "Automate bookings, FAQs, and availability responses for local and international guests." },
    { icon: "🛒", title: "Retail & FMCG", desc: "Manage trade enquiries, order follow-ups, and rep communication automatically." },
    { icon: "⚕️", title: "Professionals & Clinics", desc: "Book appointments, send reminders, and answer patient queries without lifting a finger." },
    { icon: "🔧", title: "Trades & Services", desc: "Capture quotes, confirm bookings, and follow up with potential customers automatically." },
    { icon: "🍽️", title: "Restaurants & Food", desc: "Take reservations, share menus, answer hours and location questions — without a person needed." },
    { icon: "🌾", title: "Agriculture & Farming", desc: "Manage supplier communications, buyer enquiries, and order follow-ups efficiently." },
    { icon: "💼", title: "Professional Services", desc: "Attorneys, accountants, and consultants — automate intake and follow-up from day one." },
  ];

  return (
    <section id="who" className="relative py-24 bg-[oklch(0.12_0.015_260)]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">Who We Serve</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            Built for SA businesses<br />
            <span className="text-gradient-green">of all sizes.</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            Whether you're a one-person operation or a growing team, AI automation works for your business.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((ind, i) => (
            <Card key={i} className="bg-white/[0.03] border-white/5 hover:border-lime-500/20 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">{ind.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-lime-400 transition-colors">{ind.title}</h3>
                <p className="text-slate-400 text-base leading-relaxed">{ind.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────
function StatsSection() {
  return (
    <section className="relative py-24 bg-[oklch(0.08_0.02_260)]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">Why It Works</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            The numbers speak<br />
            <span className="text-gradient-green">for themselves.</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            Businesses that respond to leads within 5 minutes are 9× more likely to convert. AI automation makes that response time instant — every time, for every lead, forever.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: "9×", label: "Higher lead conversion with instant response", color: "from-lime-400 to-lime-600" },
            { value: "67%", label: "Of customers leave if not responded to quickly", color: "from-red-500 to-orange-600" },
            { value: "24/7", label: "Your business is open and responding", color: "from-blue-500 to-cyan-600" },
            { value: "48hr", label: "Average time from brief to going live", color: "from-purple-500 to-pink-600" },
          ].map((s, i) => (
            <Card key={i} className="bg-white/[0.03] border-white/5 text-center group hover:-translate-y-1 transition-all duration-500">
              <CardContent className="p-8">
                <div className={`text-5xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-3`}>{s.value}</div>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ──────────────────────────────────────────
function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null);
  const createForm = trpc.payment.createSubscriptionForm.useMutation();

  const plans = [
    {
      key: "starter" as const,
      name: "WhatsApp Starter",
      desc: "Perfect for businesses that live on WhatsApp and want to automate lead response.",
      setup: "R3,500",
      monthly: "R1,200",
      features: [
        "WhatsApp Business API setup",
        "Automated greeting & FAQ responses",
        "Lead capture & contact collection",
        "Business hours routing",
        "Monthly performance report",
      ],
      payfast: true,
    },
    {
      key: "chatbot" as const,
      name: "AI Website Chatbot",
      desc: "Add an AI chatbot to your website that captures leads and answers enquiries 24/7.",
      setup: "R4,000",
      monthly: "R950",
      features: [
        "Trained AI chatbot for your website",
        "Lead capture & qualification",
        "Connects to your WhatsApp or email",
        "Multi-language support",
        "Monthly review & updates",
      ],
      payfast: true,
    },
    {
      key: "social" as const,
      name: "Social Media AI",
      desc: "AI-powered content creation and automated posting across Facebook, Instagram, and Google.",
      setup: "R3,500",
      monthly: "R2,000",
      features: [
        "8+ posts per week across 3 platforms",
        "AI-generated content calendar",
        "Facebook & Instagram automation",
        "Google Business posting",
        "Monthly analytics report",
        "Community management",
      ],
      payfast: true,
    },
    {
      key: "complete" as const,
      name: "AI Complete",
      desc: "WhatsApp + website chatbot + lead follow-up + CRM dashboard. Full automation from first contact to close.",
      setup: "R9,500",
      monthly: "R2,800",
      popular: true,
      features: [
        "Everything in WhatsApp Starter",
        "Trained AI website chatbot",
        "Automated lead follow-up sequences",
        "Facebook & website lead integration",
        "CRM + lead tracking dashboard",
        "Priority support & monthly optimisation",
      ],
      payfast: true,
    },
    {
      key: "fullsuite" as const,
      name: "Full Suite",
      desc: "The complete AI business stack — every service, total automation, dedicated support.",
      setup: "R15,000",
      monthly: "R4,500",
      features: [
        "Everything in AI Complete",
        "Social Media AI (8+ posts/week, 3 platforms)",
        "AI Voice Receptionist (answers calls 24/7)",
        "WhatsApp auto-invoice delivery",
        "Dedicated account manager",
      ],
      payfast: true,
    },
  ];

  async function handleSubscribe(key: string) {
    setLoading(key);
    try {
      const { action, fields } = await createForm.mutateAsync({ plan: key as any });
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="relative py-24 bg-[oklch(0.12_0.015_260)]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">Pricing</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            High-end AI automation<br />
            <span className="text-gradient-green">at affordable prices.</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            No massive upfront costs. No lock-in contracts. Month-to-month flexibility.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((p, i) => (
            <Card key={i} className={`relative bg-white/[0.03] border-white/5 transition-all duration-500 hover:-translate-y-2 ${p.popular ? "ring-2 ring-lime-500/40 glow-green" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-lime-400 to-lime-600 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                  ★ Most Popular
                </div>
              )}
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-white mb-2">{p.name}</h3>
                <p className="text-slate-400 text-base mb-6">{p.desc}</p>

                <div className="mb-6">
                  <div className="text-sm text-slate-500">Setup from</div>
                  <div className="text-3xl font-bold text-white">{p.setup}</div>
                  <div className="text-base text-slate-500 mt-1">
                    Then <span className="text-lime-400 font-semibold">{p.monthly}</span>/month
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-base text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-lime-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(p.key)}
                  disabled={loading === p.key}
                  className={`w-full text-base ${p.popular ? "bg-gradient-to-r from-lime-400 to-lime-600 text-slate-900 font-bold shadow-lg" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"}`}
                >
                  {loading === p.key ? "Redirecting…" : <>Get Started — {p.monthly}/mo <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Website design callout */}
        <Card className="bg-gradient-to-r from-slate-800/60 to-slate-900/40 border-white/10 border">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-500/20 to-lime-600/10 flex items-center justify-center shrink-0">
                <Monitor className="w-7 h-7 text-lime-400" />
              </div>
              <div className="flex-1">
                <div className="text-lime-400 text-sm font-semibold uppercase tracking-wider mb-2">Custom Website Design</div>
                <h3 className="text-2xl font-bold text-white mb-2">Not a template. Not WordPress.</h3>
                <p className="text-slate-300 text-base">A custom-coded, lightning-fast website built for your business — with a live AI chatbot and WhatsApp bot baked in from day one. This site is the proof.</p>
              </div>
              <div className="text-center lg:text-right shrink-0">
                <div className="text-2xl font-bold text-white">From R5,000</div>
                <div className="text-slate-400 text-sm">once-off | R800/month hosting</div>
                <a href="https://wa.me/27734061526?text=Hi%2C%20I%27d%20like%20to%20discuss%20a%20custom%20website" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="mt-4 bg-gradient-to-r from-lime-500 to-lime-600 text-slate-900 font-bold shadow-lg">
                    Book a Design Call <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="relative py-24 bg-[oklch(0.08_0.02_260)]">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">About Us</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
              SA is 3 years behind.<br />
              <span className="text-gradient-green">That's your opportunity.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed mb-8">
              Most South African businesses are still doing manually what the rest of the world automated years ago. Manna Digital Hub exists to close that gap — affordably, practically, and fast.
            </p>

            <div className="space-y-6">
              {[
                { icon: Globe, title: "Built for SA realities", desc: "Our solutions are designed for South African businesses — load-shedding, data costs, WhatsApp culture and all." },
                { icon: Shield, title: "Accessible pricing", desc: "High-end AI automation at affordable prices. No massive upfront costs, no lock-in contracts longer than month-to-month." },
                { icon: Users, title: "We do the work for you", desc: "You don't need to be technical. We set everything up, train the AI on your business, and manage it ongoing." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500/20 to-lime-600/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-base">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SA flag/pride card */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-lime-900/15 to-lime-800/5 border-lime-500/10 overflow-hidden">
              <CardContent className="p-10 text-center">
                <div className="text-6xl mb-6">🇿🇦</div>
                <h3 className="text-2xl font-bold text-white mb-2">Proudly South African</h3>
                <p className="text-slate-400 text-lg">
                  Serving businesses across the Garden Route,<br />
                  Western Cape &amp; beyond
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { val: "100+", label: "Bots deployed" },
                    { val: "50+", label: "Happy clients" },
                    { val: "24/7", label: "Support" },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="text-2xl font-bold text-gradient-green">{s.val}</div>
                      <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────
function CTASection() {
  return (
    <section id="contact" className="relative py-24 bg-[oklch(0.12_0.015_260)]">
      <div className="container mx-auto">
        <Card className="bg-gradient-to-br from-lime-900/20 via-lime-800/10 to-lime-900/5 border-lime-500/20 glow-green overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-[100px]" />
          <CardContent className="p-10 sm:p-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">Ready to Start?</span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
                Let's automate your business<br />
                <span className="text-gradient-green">this week.</span>
              </h2>
              <p className="text-slate-300 text-xl mb-8">
                Book a free 30-minute discovery call. We'll identify exactly where your business is losing leads and show you how to fix it.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {["Free discovery call", "No obligation", "Live in 48 hours", "Month-to-month"].map((t, i) => (
                  <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-base text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-lime-500" />
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/27734061526?text=Hi%2C%20I%20want%20a%20free%20discovery%20call" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-lime-400 to-lime-600 hover:from-lime-300 hover:to-lime-500 text-slate-900 font-bold text-lg px-10 py-6 shadow-xl glow-green">
                    <MessageCircle className="w-5 h-5 mr-2" /> Book Free Call on WhatsApp
                  </Button>
                </a>
                <a href="mailto:info@mannadigitalhub.co.za">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 text-lg px-10 py-6">
                    <Mail className="w-5 h-5 mr-2" /> Email Us
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── Payment Section ──────────────────────────────────────────
function PaymentSection() {
  return (
    <section id="payment" className="relative py-24 bg-[oklch(0.08_0.02_260)]">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <span className="text-sm text-lime-400 font-medium uppercase tracking-wider">Payment</span>
          <h2 className="text-3xl font-bold text-white mt-4">Payment Options</h2>
        </div>

        <Card className="bg-white/[0.03] border-white/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">EFT / Direct Transfer</h3>
                <p className="text-sm text-slate-400">Transfer directly into our business account</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Account Name", value: "MannaDigitalHub" },
                { label: "Bank", value: "Capitec Business" },
                { label: "Account Number", value: "1055056238" },
                { label: "Branch Code", value: "470010" },
                { label: "Account Type", value: "Business" },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-slate-400 text-sm">{r.label}</span>
                  <span className="text-white font-medium text-sm">{r.value}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Use your name or business name as reference. Send proof of payment to <a href="mailto:info@mannadigitalhub.co.za" className="text-lime-400 hover:underline">info@mannadigitalhub.co.za</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[oklch(0.06_0.02_260)] border-t border-white/5 py-16">
      <div className="container mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-slate-900 font-bold text-lg">M</div>
              <span className="font-bold text-lg text-white">Manna Digital Hub</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              AI-powered automation for South African businesses. Stop losing leads. Start growing.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4" /> Garden Route, South Africa
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#services" className="hover:text-lime-400 transition-colors">WhatsApp Automation</a></li>
              <li><a href="#services" className="hover:text-lime-400 transition-colors">AI Website Chatbot</a></li>
              <li><a href="#services" className="hover:text-lime-400 transition-colors">Social Media AI</a></li>
              <li><a href="#services" className="hover:text-lime-400 transition-colors">Lead Follow-Up</a></li>
              <li><a href="#services" className="hover:text-lime-400 transition-colors">Full AI Business Stack</a></li>
              <li><a href="#services" className="hover:text-lime-400 transition-colors">Website Design</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-lime-400 transition-colors">About Us</a></li>
              <li><a href="#how" className="hover:text-lime-400 transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-lime-400 transition-colors">Pricing</a></li>
              <li><a href="#contact" className="hover:text-lime-400 transition-colors">Contact</a></li>
              <li><a href="/admin/login" className="hover:text-lime-400 transition-colors">Admin Login</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-lime-500" />
                <a href="tel:+27734061526" className="hover:text-lime-400 transition-colors">+27 73 406 1526</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lime-500" />
                <a href="mailto:info@mannadigitalhub.co.za" className="hover:text-lime-400 transition-colors">info@mannadigitalhub.co.za</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-lime-500" />
                <a href="https://wa.me/27734061526" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors">WhatsApp Us</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Manna Digital Hub. All rights reserved.</p>
          <p className="text-sm text-slate-600">Proudly South African 🇿🇦</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Landing Page ────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.12_0.015_260)] overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <ServicesSection />
      <HowItWorksSection />
      <IndustriesSection />
      <StatsSection />
      <PricingSection />
      <AboutSection />
      <CTASection />
      <PaymentSection />
      <Footer />
    </div>
  );
}
