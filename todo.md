# Manna Agency Hub — Project TODO

## Phase 1: Database Schema & Core Models
- [x] Design and implement leads table (Apollo integration data)
- [x] Design and implement clients table (paying customers)
- [x] Design and implement projects table (bot deployment tracking)
- [x] Design and implement invoices table (PayFast integration)
- [x] Design and implement tasks table (workflow automation)
- [x] Design and implement bot_connections table (WhatChimp integration)
- [x] Create Drizzle migrations and apply to database

## Phase 2: Backend API Procedures
- [x] CRM procedures: create/update/list leads with status tracking
- [x] Lead conversion procedures: move leads through pipeline
- [x] Client management procedures: CRUD operations
- [x] Project tracking procedures: create/update project status
- [x] Invoice procedures: generate, track, and manage payments
- [x] Analytics procedures: MRR, LTV, conversion funnel calculations
- [x] WhatChimp integration procedures: fetch bot data
- [x] Task automation procedures: create and manage workflows

## Phase 3: Admin Dashboard UI
- [x] Dashboard homepage with key metrics (MRR, active clients, conversion rate)
- [x] CRM lead tracker with Apollo integration
- [x] Lead pipeline visualization (funnel chart)
- [x] Project tracker with deployment status
- [ ] Client management interface
- [x] Invoice management and payment tracking
- [ ] Revenue analytics dashboard
- [ ] Bot performance monitoring dashboard

## Phase 4: Client Portal
- [ ] Client authentication and login
- [ ] Bot analytics view (conversations, response times)
- [ ] Subscription management interface
- [ ] Support ticket system
- [ ] Invoice history and payment methods

## Phase 5: WhatsApp Bot Integration
- [ ] WhatChimp API connection setup
- [ ] Bot conversation log viewer
- [ ] Real-time bot status monitoring
- [ ] Bot performance metrics collection
- [ ] Webhook handler for incoming bot data

## Phase 6: PayFast Integration
- [ ] PayFast API integration for payment processing
- [ ] Automated invoice generation and sending
- [ ] Payment status tracking and reconciliation
- [ ] Monthly retainer billing automation
- [ ] Payment failure handling and retry logic

## Phase 7: Task Automation & Workflows
- [ ] Onboarding workflow automation
- [ ] Follow-up reminder system
- [ ] Client milestone notifications
- [ ] Lead qualification automation
- [ ] Invoice reminder scheduling

## Phase 8: Manna Bot Feature (11-Language Chatbot)
- [x] Create ChatBot component with conversation flow engine
- [x] Implement 12 conversation flows (Welcome, Consultation, Services, Results, AI, About, Contact, etc.)
- [x] Integrate 10-language translations (EN, AF, XH, ZU, ST, TN, ND, SS, TS, VE) - Portuguese removed
- [x] Build lead capture form with database integration
- [x] Add language selector and persistence
- [x] Implement chat animations and UI polish
- [x] Make mobile-responsive
- [x] Test all flows in all 10 languages
- [x] Create Bot Leads Dashboard for admin
- [x] Add WhatsApp Integration setup page
- [ ] Deploy and verify live

## Phase 9: Service Pages & Pricing (Follow-ups)
- [x] Create Services overview page with 6 services
- [x] Build individual service detail pages with case studies
- [x] Create interactive pricing calculator with ROI tool
- [x] Integrate all new pages into navigation
- [x] Add service routing to App.tsx
- [ ] Publish website live

## Phase 10: Advanced Features & Operations
- [x] Create About Us page with team bios
- [x] Build Staff Management system with role-based access
- [x] Create Client Bot Builder interface
- [x] Build comprehensive Operating Manual with tutorials
- [x] Add all pages to main navigation
- [ ] Publish website live
- [ ] Connect TrueHost custom domain
- [ ] Create Facebook page and connect
- [ ] Provide WhatChimp migration guide
- [ ] Final delivery and handoff

## Phase 11: Testing & Delivery
- [ ] Unit tests for all new components
- [ ] Integration tests
- [ ] UI/UX testing and refinement
- [ ] Performance optimization
- [ ] Final checkpoint and publish

## Phase 12: COMPLETE REBUILD — Customer-Facing Landing Page (The Storefront)
- [x] Set up Google Fonts (Inter + DM Sans)
- [x] Configure brand color palette (dark theme + green/emerald accents)
- [x] Build stunning Hero section with animated elements and live bot indicators
- [x] Build Problem section (losing money while you sleep)
- [x] Build Services section (3 core services + bundle)
- [x] Build How It Works section (4 steps)
- [x] Build Who We Serve section (8 industries)
- [x] Build Stats/Social Proof section (9x conversion etc)
- [x] Build Pricing section (3 tiers with CTAs)
- [x] Build About section (SA is 3 years behind)
- [x] Build Contact/CTA section (book discovery call)
- [x] Build Payment section (EFT details)
- [x] Build sticky navigation header
- [x] Build footer with links and contact info
- [x] Add scrolling ticker/marquee animation
- [x] Integrate AI-powered ChatBot widget on landing page

## Phase 13: REBUILD — Admin Dashboard (The Factory)
- [x] Update DashboardLayout with proper Manna navigation
- [ ] Build admin dashboard with real metrics and charts
- [ ] Rebuild CRM Leads management with pipeline view
- [ ] Build Clients management page
- [ ] Rebuild Projects tracking with Kanban view
- [ ] Rebuild Invoices/Billing with payment tracking
- [ ] Build Analytics reporting page with charts

## Phase 14: AI-Powered Bot Upgrade
- [x] Upgrade ChatBot to use LLM for intelligent responses
- [x] Connect ChatBot lead capture to backend API
- [x] AI-powered conversation (not keyword matching)

## Phase 15: Tests & Final Delivery
- [x] Write vitest tests for key procedures
- [ ] Responsive design verification
- [ ] Save checkpoint and deliver

## Phase 16: AI LLM Integration for Manna Bot
- [x] Create server-side AI chat procedure with comprehensive system prompt
- [x] Design system prompt that sells Manna services, qualifies leads, speaks all 11 SA languages
- [x] Build conversation history management (per-session context)
- [x] Rebuild ChatBot frontend with AI streaming responses
- [x] Connect WhatsApp webhook to AI-powered responses (replace keyword matching)
- [x] Add lead capture detection (AI identifies when to capture contact details)
- [x] Write vitest tests for AI chat procedure
- [x] Verify end-to-end conversation quality

## Phase 17: Facebook Lead Forms Integration
- [x] Create Facebook webhook receiver endpoint (GET verify + POST lead data)
- [x] Build lead processing logic (parse Facebook lead form fields, map to CRM)
- [x] Store Facebook leads in database with source tracking (facebook_ads)
- [x] Auto-trigger WhatsApp follow-up for new Facebook leads
- [x] Build Facebook Leads section in admin dashboard (view, filter, status)
- [x] Add Facebook campaign tracking (ad name, form name, campaign)
- [x] Send owner notification on new Facebook lead
- [x] Write vitest tests for Facebook webhook and lead processing
- [x] Verify end-to-end flow (89 tests passing)
