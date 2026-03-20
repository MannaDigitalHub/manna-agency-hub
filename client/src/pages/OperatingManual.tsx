import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Zap, Shield, Download, ExternalLink } from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    subsections: [
      {
        title: 'Dashboard Overview',
        content: 'Your dashboard is your command center. Here you can see real-time metrics, access all tools, and manage your business.',
        steps: [
          'Log in to your Manna Hub account',
          'You\'ll see the Dashboard with 4 key metrics: Active Clients, Monthly Revenue, Conversion Rate, Live Projects',
          'Use the left sidebar to navigate to different sections',
          'Click on any metric card to drill down into details',
        ],
      },
      {
        title: 'First Time Setup',
        content: 'Get your Manna Hub ready in 5 steps.',
        steps: [
          'Go to Settings & Integration → General',
          'Update your company name and logo',
          'Add your team members (Settings → Staff Management)',
          'Configure your WhatsApp number (Bot Manager)',
          'Create your first client bot (Client Bot Builder)',
        ],
      },
    ],
  },
  {
    id: 'staff-management',
    title: 'Staff Management & Access Control',
    icon: Users,
    subsections: [
      {
        title: 'Adding Team Members',
        content: 'Invite your team to Manna Hub with role-based access.',
        steps: [
          'Go to Staff Management page',
          'Click "Add Staff Member"',
          'Enter their name, email, and select their role',
          'Click "Invite" - they\'ll receive an email invitation',
          'They can accept and create their password',
          'Their access level is determined by their role',
        ],
      },
      {
        title: 'Understanding Roles',
        content: 'Each role has different permissions and responsibilities.',
        steps: [
          'Admin: Full access to all features, can manage staff and billing',
          'Manager: Can manage projects, leads, and team members',
          'Agent: Can manage leads and customer interactions',
          'Viewer: Read-only access to reports and dashboards',
          'Assign the minimum role necessary for each person',
          'Review permissions quarterly for security',
        ],
      },
      {
        title: 'Removing Staff',
        content: 'Safely remove team members and revoke access.',
        steps: [
          'Go to Staff Management',
          'Find the team member you want to remove',
          'Click the "Remove" button',
          'Confirm the removal - their access is revoked immediately',
          'All their data and projects remain in the system',
          'You can reassign their projects to other team members',
        ],
      },
    ],
  },
  {
    id: 'client-bots',
    title: 'Building Client Bots',
    icon: Zap,
    subsections: [
      {
        title: 'Creating a New Bot',
        content: 'Build a WhatsApp bot for your client in minutes.',
        steps: [
          'Go to Client Bot Builder',
          'Click "Create New Bot"',
          'Enter: Bot Name, Client Name, WhatsApp Number',
          'Click "Create" - the bot is created instantly',
          'The bot comes with default flows and 10 languages',
          'You can customize it after creation',
        ],
      },
      {
        title: 'Customizing Bot Flows',
        content: 'Tailor the bot to your client\'s specific needs.',
        steps: [
          'Go to Client Bot Builder',
          'Click "Configure" on the bot you want to customize',
          'Edit conversation flows: Welcome, Services, Pricing, Contact, etc.',
          'Add your client\'s specific information and services',
          'Choose which languages to enable',
          'Set up lead capture fields (name, email, phone, etc.)',
          'Test the bot before deploying',
        ],
      },
      {
        title: 'Deploying to WhatsApp',
        content: 'Go live with your client\'s bot.',
        steps: [
          'In Bot Configuration, click "Deploy to WhatsApp"',
          'Verify the WhatsApp number is correct',
          'Connect to your client\'s WhatsApp Business Account',
          'The bot will be live within 5 minutes',
          'Test by sending a message to the WhatsApp number',
          'Monitor the bot\'s performance in real-time',
        ],
      },
      {
        title: 'Monitoring & Analytics',
        content: 'Track your bot\'s performance and ROI.',
        steps: [
          'Go to Bot Leads Dashboard',
          'View total messages, leads captured, and conversion rates',
          'Filter by date range, language, or status',
          'See detailed metrics for each lead',
          'Export reports for client presentations',
          'Use data to optimize bot flows',
        ],
      },
    ],
  },
  {
    id: 'crm-management',
    title: 'CRM & Lead Management',
    icon: Users,
    subsections: [
      {
        title: 'Managing Leads',
        content: 'Track and manage all your leads in one place.',
        steps: [
          'Go to CRM Leads page',
          'View all leads captured by your bots',
          'Filter by status: New, Contacted, Qualified, Converted, Lost',
          'Click on a lead to see full details',
          'Update lead status as you progress through sales cycle',
          'Assign leads to team members',
        ],
      },
      {
        title: 'Lead Qualification',
        content: 'Qualify leads to focus on high-value opportunities.',
        steps: [
          'Review new leads daily',
          'Check their business type and needs',
          'Assess fit with your services',
          'Update status to "Qualified" for promising leads',
          'Assign to appropriate sales agent',
          'Track conversion rate to optimize bot flows',
        ],
      },
    ],
  },
  {
    id: 'whatchimp-migration',
    title: 'WhatChimp Migration & Cancellation',
    icon: Shield,
    subsections: [
      {
        title: 'Why Migrate from WhatChimp',
        content: 'Your Manna Hub now handles everything WhatChimp did - and more.',
        steps: [
          'Manna Hub: All-in-one platform (Bot, CRM, Analytics, Pricing)',
          'WhatChimp: Bot only (limited features)',
          'Cost: Manna Hub is more affordable with better features',
          'Support: Manna Hub has dedicated support team',
          'No more juggling multiple platforms',
        ],
      },
      {
        title: 'Step-by-Step Migration',
        content: 'Safely migrate your bots from WhatChimp to Manna Hub.',
        steps: [
          'Step 1: Export your bot flows from WhatChimp (Settings → Export)',
          'Step 2: Create new bots in Manna Hub Client Bot Builder',
          'Step 3: Import your flows into Manna Hub bots',
          'Step 4: Test all flows thoroughly',
          'Step 5: Deploy to WhatsApp from Manna Hub',
          'Step 6: Verify everything works for 24 hours',
          'Step 7: Cancel WhatChimp subscription',
        ],
      },
      {
        title: 'Cancelling WhatChimp',
        content: 'How to safely cancel your WhatChimp subscription.',
        steps: [
          'Log in to WhatChimp account',
          'Go to Settings → Billing',
          'Click "Cancel Subscription"',
          'Choose reason (optional)',
          'Confirm cancellation',
          'Your account will be active until end of billing period',
          'After cancellation, your bots will stop working on WhatChimp',
          'All your data is already in Manna Hub',
        ],
      },
      {
        title: 'Post-Migration Checklist',
        content: 'Ensure smooth transition.',
        steps: [
          '✓ All bots migrated to Manna Hub',
          '✓ All flows tested and working',
          '✓ Lead capture confirmed',
          '✓ Team trained on new platform',
          '✓ Clients notified (if applicable)',
          '✓ WhatChimp subscription cancelled',
          '✓ Monitor Manna Hub for 1 week',
          '✓ Update documentation',
        ],
      },
    ],
  },
  {
    id: 'facebook-setup',
    title: 'Facebook Page Setup',
    icon: ExternalLink,
    subsections: [
      {
        title: 'Creating Your Facebook Page',
        content: 'Set up your professional Facebook presence.',
        steps: [
          'Go to facebook.com',
          'Click "Create" in top left',
          'Select "Page"',
          'Choose "Business or Brand"',
          'Enter your business name (Manna Digital Hub)',
          'Select category: "Advertising/Marketing"',
          'Add profile picture (your logo)',
          'Write compelling about section',
          'Add cover photo (professional banner)',
        ],
      },
      {
        title: 'Optimizing Your Page',
        content: 'Make your Facebook page professional and conversion-focused.',
        steps: [
          'Add website URL to your page',
          'Create a compelling "About" section',
          'Add call-to-action button: "Contact Us" or "Learn More"',
          'Link to your Manna Hub website',
          'Post regular content: case studies, tips, updates',
          'Enable messaging for customer inquiries',
          'Set up Facebook Messenger bot (optional)',
          'Create a business email for inquiries',
        ],
      },
      {
        title: 'Content Strategy',
        content: 'What to post on your Facebook page.',
        steps: [
          'Post 3-4 times per week',
          'Share client success stories (with permission)',
          'Post industry tips and insights',
          'Share your blog posts and case studies',
          'Announce new features or services',
          'Engage with comments and messages',
          'Use relevant hashtags: #MannaDHub #Automation #AI',
          'Encourage followers to visit your website',
        ],
      },
      {
        title: 'Connecting Facebook to Manna Hub',
        content: 'Link your Facebook page for integrated messaging.',
        steps: [
          'Go to Settings & Integration → Social Media',
          'Click "Connect Facebook"',
          'Authorize Manna Hub to access your page',
          'Select your Manna Digital Hub page',
          'Enable Facebook Messenger integration',
          'Now leads from Facebook will appear in your CRM',
          'You can respond to Facebook messages from Manna Hub',
          'All conversations are tracked and saved',
        ],
      },
    ],
  },
  {
    id: 'publishing',
    title: 'Publishing Your Website',
    icon: BookOpen,
    subsections: [
      {
        title: 'Pre-Publication Checklist',
        content: 'Make sure everything is ready before going live.',
        steps: [
          '✓ All pages created and content added',
          '✓ Services page with all 6 services',
          '✓ Case studies with real metrics',
          '✓ Pricing calculator working',
          '✓ Contact forms functional',
          '✓ Bot integrated and tested',
          '✓ Team bios added',
          '✓ All links working',
          '✓ Mobile responsive design verified',
          '✓ SEO metadata added',
        ],
      },
      {
        title: 'Publishing Steps',
        content: 'Go live with your website.',
        steps: [
          'Step 1: Open your Manus project',
          'Step 2: Click "Publish" button (top right)',
          'Step 3: Review the publish dialog',
          'Step 4: Click "Publish latest version"',
          'Step 5: Wait for deployment (usually 1-2 minutes)',
          'Step 6: Your website is now LIVE!',
          'Step 7: Visit your domain to verify',
          'Step 8: Share with your team',
        ],
      },
      {
        title: 'Post-Publication',
        content: 'After your website goes live.',
        steps: [
          'Test all functionality thoroughly',
          'Check bot is working on all pages',
          'Verify forms are capturing leads',
          'Monitor analytics in Manna Hub dashboard',
          'Share website with your team',
          'Add to your email signature',
          'Share on social media',
          'Monitor for any issues',
        ],
      },
    ],
  },
];

export default function OperatingManual() {
  const [selectedSection, setSelectedSection] = useState('getting-started');
  const currentSection = sections.find(s => s.id === selectedSection);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
          <BookOpen className="w-10 h-10" />
          Operating Manual
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete guide to operating your Manna Hub - your dream machine for running a digital agency
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={selectedSection === section.id ? 'default' : 'outline'}
              onClick={() => setSelectedSection(section.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {section.title}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      {currentSection && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            {React.createElement(currentSection.icon, { className: 'w-8 h-8 text-green-600' })}
            <h2 className="text-3xl font-bold text-foreground">{currentSection.title}</h2>
          </div>

          <div className="space-y-6">
            {currentSection.subsections.map((subsection, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{subsection.title}</h3>
                <p className="text-muted-foreground mb-4">{subsection.content}</p>

                <div className="space-y-2">
                  {subsection.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                        {stepIdx + 1}
                      </div>
                      <p className="text-foreground pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="text-2xl font-bold text-foreground mb-6">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="gap-2 justify-start h-auto py-3">
            <Download className="w-4 h-4" />
            <div className="text-left">
              <div className="font-semibold">Download PDF</div>
              <div className="text-xs">Full manual for offline reading</div>
            </div>
          </Button>
          <Button variant="outline" className="gap-2 justify-start h-auto py-3">
            <ExternalLink className="w-4 h-4" />
            <div className="text-left">
              <div className="font-semibold">Video Tutorials</div>
              <div className="text-xs">Step-by-step video guides</div>
            </div>
          </Button>
          <Button variant="outline" className="gap-2 justify-start h-auto py-3">
            <Users className="w-4 h-4" />
            <div className="text-left">
              <div className="font-semibold">Contact Support</div>
              <div className="text-xs">Get help from our team</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-foreground mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Bookmark this manual for quick reference</li>
          <li>✓ Share sections with your team members</li>
          <li>✓ Review the staff management section before adding team members</li>
          <li>✓ Test everything in a sandbox before deploying to clients</li>
          <li>✓ Monitor analytics daily to optimize bot performance</li>
          <li>✓ Keep your contact information updated for client inquiries</li>
        </ul>
      </Card>
    </div>
  );
}
