import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Brain, Users, BarChart3, MessageSquare, Cog } from 'lucide-react';
import { Link } from 'wouter';

const services = [
  {
    id: 'automation',
    title: 'WhatsApp Automation',
    description: 'Automate customer interactions 24/7 with intelligent WhatsApp bots',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    features: ['24/7 Availability', 'Multi-language Support', 'Lead Capture', 'Instant Responses'],
    caseStudies: 3,
    roi: '300%',
  },
  {
    id: 'ai',
    title: 'AI Solutions',
    description: 'Custom AI models tailored to your business needs and workflows',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    features: ['Custom Models', 'Data Analysis', 'Predictive Analytics', 'ML Integration'],
    caseStudies: 5,
    roi: '450%',
  },
  {
    id: 'crm',
    title: 'CRM Systems',
    description: 'Manage customers, sales, and relationships in one powerful platform',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    features: ['Contact Management', 'Sales Pipeline', 'Automation', 'Reporting'],
    caseStudies: 4,
    roi: '250%',
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    description: 'Transform data into actionable insights for better decisions',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    features: ['Real-time Dashboards', 'Custom Reports', 'Predictive Insights', 'Data Visualization'],
    caseStudies: 6,
    roi: '500%',
  },
  {
    id: 'messaging',
    title: 'Omnichannel Messaging',
    description: 'Reach customers across all channels from one unified platform',
    icon: MessageSquare,
    color: 'from-red-500 to-rose-500',
    features: ['Multi-channel', 'Unified Inbox', 'Message Scheduling', 'Team Collaboration'],
    caseStudies: 3,
    roi: '350%',
  },
  {
    id: 'integration',
    title: 'System Integration',
    description: 'Connect all your tools and systems for seamless workflows',
    icon: Cog,
    color: 'from-indigo-500 to-blue-500',
    features: ['API Integration', 'Workflow Automation', 'Data Sync', 'Custom Connectors'],
    caseStudies: 4,
    roi: '400%',
  },
];

export default function Services() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Our Services
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive solutions to transform your business with automation, AI, and data intelligence
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link key={service.id} href={`/services/${service.id}`}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                {/* Gradient Background */}
                <div className={`h-32 bg-gradient-to-br ${service.color} opacity-10`} />

                <div className="p-6 -mt-16 relative">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{service.roi}</div>
                      <div className="text-xs text-muted-foreground">Avg ROI</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{service.caseStudies}</div>
                      <div className="text-xs text-muted-foreground">Case Studies</div>
                    </div>
                    <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* CTA Section */}
      <Card className="p-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's discuss which services are right for your organization
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Schedule Consultation
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
