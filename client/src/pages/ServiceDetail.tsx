import React from 'react';
import { useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';

const serviceDetails: Record<string, any> = {
  automation: {
    title: 'WhatsApp Automation',
    subtitle: 'Automate customer interactions 24/7 with intelligent WhatsApp bots',
    description: 'Transform your customer service with AI-powered WhatsApp automation. Our bots handle inquiries, qualify leads, and provide instant support in 10 languages.',
    benefits: [
      'Respond to customers instantly, 24/7',
      'Qualify leads automatically',
      'Reduce response time by 95%',
      'Support 10 languages',
      'Seamless lead capture',
      'Real-time analytics',
    ],
    caseStudies: [
      {
        company: 'TechStart Solutions',
        industry: 'Software',
        result: '300% increase in lead response rate',
        quote: 'Our bot now handles 80% of initial inquiries automatically. Game changer!',
        metrics: { leads: '+450', response: '2 min', satisfaction: '94%' },
      },
      {
        company: 'RetailPro Group',
        industry: 'E-commerce',
        result: '250% improvement in customer satisfaction',
        quote: 'Customers love getting instant responses. Sales increased significantly.',
        metrics: { orders: '+320', conversion: '+45%', support: '-60%' },
      },
      {
        company: 'ServiceHub Africa',
        industry: 'Services',
        result: '400% ROI in first 6 months',
        quote: 'The bot pays for itself every month. Highly recommended.',
        metrics: { tickets: '-70%', revenue: '+280%', cost: '-50%' },
      },
    ],
  },
  ai: {
    title: 'AI Solutions',
    subtitle: 'Custom AI models tailored to your business needs',
    description: 'Leverage cutting-edge AI technology to automate complex tasks, predict trends, and unlock hidden insights in your data.',
    benefits: [
      'Custom AI models for your use case',
      'Predictive analytics',
      'Process automation',
      'Data-driven insights',
      'Continuous learning',
      'Enterprise security',
    ],
    caseStudies: [
      {
        company: 'FinanceFlow',
        industry: 'Finance',
        result: '450% ROI on fraud detection',
        quote: 'Our AI model catches 99.2% of fraudulent transactions.',
        metrics: { fraud: '-92%', savings: 'R2.3M', accuracy: '99.2%' },
      },
      {
        company: 'HealthTech Plus',
        industry: 'Healthcare',
        result: '380% improvement in diagnostics',
        quote: 'AI-assisted diagnosis reduced errors by 87%.',
        metrics: { accuracy: '+87%', time: '-65%', patients: '+420' },
      },
      {
        company: 'ManufacturePro',
        industry: 'Manufacturing',
        result: '520% productivity increase',
        quote: 'Predictive maintenance saved us millions in downtime.',
        metrics: { downtime: '-78%', efficiency: '+65%', cost: '-R4.2M' },
      },
      {
        company: 'RetailAnalytics',
        industry: 'Retail',
        result: '340% sales optimization',
        quote: 'AI-driven recommendations boosted average order value by 42%.',
        metrics: { aov: '+42%', revenue: '+340%', inventory: '-30%' },
      },
      {
        company: 'LogisticsMaster',
        industry: 'Logistics',
        result: '410% route optimization',
        quote: 'AI routing reduced delivery times and fuel costs dramatically.',
        metrics: { time: '-45%', fuel: '-38%', revenue: '+410%' },
      },
    ],
  },
  crm: {
    title: 'CRM Systems',
    subtitle: 'Manage customers, sales, and relationships in one platform',
    description: 'Centralize all customer interactions and sales data. Automate workflows, track pipelines, and close more deals faster.',
    benefits: [
      'Unified customer view',
      'Sales pipeline management',
      'Automated workflows',
      'Real-time reporting',
      'Team collaboration',
      'Mobile access',
    ],
    caseStudies: [
      {
        company: 'SalesForce Africa',
        industry: 'B2B Sales',
        result: '280% increase in sales productivity',
        quote: 'Our team closes deals 40% faster with better visibility.',
        metrics: { deals: '+280%', cycle: '-40%', team: '+8 reps' },
      },
      {
        company: 'ServiceHub',
        industry: 'Service Industry',
        result: '320% customer retention improvement',
        quote: 'CRM helped us understand and serve customers better.',
        metrics: { retention: '+32%', revenue: '+320%', churn: '-18%' },
      },
      {
        company: 'B2B Solutions',
        industry: 'B2B',
        result: '290% deal closure rate',
        quote: 'Better tracking means better follow-up and more closed deals.',
        metrics: { closure: '+29%', pipeline: '+290%', revenue: '+245%' },
      },
      {
        company: 'EnterpriseSales',
        industry: 'Enterprise',
        result: '350% team efficiency',
        quote: 'Automation freed up our team to focus on selling.',
        metrics: { efficiency: '+35%', admin: '-60%', revenue: '+380%' },
      },
    ],
  },
  analytics: {
    title: 'Business Analytics',
    subtitle: 'Transform data into actionable insights',
    description: 'Make smarter decisions with real-time dashboards, predictive analytics, and comprehensive business intelligence.',
    benefits: [
      'Real-time dashboards',
      'Predictive analytics',
      'Custom reports',
      'Data visualization',
      'Trend analysis',
      'Automated alerts',
    ],
    caseStudies: [
      {
        company: 'DataDriven Inc',
        industry: 'Analytics',
        result: '500% data-driven decision making',
        quote: 'We now make decisions based on data, not gut feeling.',
        metrics: { decisions: '+500%', accuracy: '+89%', revenue: '+420%' },
      },
      {
        company: 'RetailInsights',
        industry: 'Retail',
        result: '380% inventory optimization',
        quote: 'Analytics reduced stockouts by 76% and overstock by 82%.',
        metrics: { stockouts: '-76%', overstock: '-82%', revenue: '+380%' },
      },
      {
        company: 'MarketingPro',
        industry: 'Marketing',
        result: '450% campaign ROI',
        quote: 'Analytics showed us exactly where to spend marketing budget.',
        metrics: { roi: '+450%', cac: '-35%', revenue: '+520%' },
      },
      {
        company: 'OperationsHub',
        industry: 'Operations',
        result: '420% operational efficiency',
        quote: 'Real-time dashboards help us spot issues before they become problems.',
        metrics: { efficiency: '+42%', downtime: '-68%', cost: '-R3.1M' },
      },
      {
        company: 'FinanceOptimize',
        industry: 'Finance',
        result: '480% financial visibility',
        quote: 'We now have complete visibility into cash flow and profitability.',
        metrics: { visibility: '+480%', accuracy: '+94%', cash: '+R5.2M' },
      },
      {
        company: 'StrategyLabs',
        industry: 'Strategy',
        result: '510% strategic planning',
        quote: 'Data-driven insights transformed our strategic planning.',
        metrics: { planning: '+510%', execution: '+78%', revenue: '+640%' },
      },
    ],
  },
  messaging: {
    title: 'Omnichannel Messaging',
    subtitle: 'Reach customers across all channels from one platform',
    description: 'Manage WhatsApp, SMS, Email, and social messaging from a single unified inbox. Ensure no customer message goes unanswered.',
    benefits: [
      'Multi-channel messaging',
      'Unified inbox',
      'Message scheduling',
      'Team collaboration',
      'Automated routing',
      'Message history',
    ],
    caseStudies: [
      {
        company: 'OmniComm',
        industry: 'Communications',
        result: '350% customer reach',
        quote: 'Reaching customers on their preferred channel increased engagement by 65%.',
        metrics: { reach: '+350%', engagement: '+65%', response: '-80%' },
      },
      {
        company: 'CustomerFirst',
        industry: 'Customer Service',
        result: '380% service efficiency',
        quote: 'Unified inbox eliminated message silos and improved response times.',
        metrics: { efficiency: '+38%', response: '-75%', satisfaction: '+42%' },
      },
      {
        company: 'MultiChannel',
        industry: 'Retail',
        result: '320% omnichannel sales',
        quote: 'Seamless messaging across channels increased customer lifetime value.',
        metrics: { ltv: '+320%', repeat: '+48%', revenue: '+380%' },
      },
    ],
  },
  integration: {
    title: 'System Integration',
    subtitle: 'Connect all your tools and systems seamlessly',
    description: 'Eliminate data silos by integrating all your business systems. Automate workflows and ensure data consistency across platforms.',
    benefits: [
      'API integrations',
      'Workflow automation',
      'Data synchronization',
      'Custom connectors',
      'Real-time sync',
      'Error handling',
    ],
    caseStudies: [
      {
        company: 'IntegrationPro',
        industry: 'Technology',
        result: '400% system efficiency',
        quote: 'Integrated systems eliminated manual data entry and errors.',
        metrics: { efficiency: '+40%', errors: '-95%', time: '-80%' },
      },
      {
        company: 'EnterpriseTech',
        industry: 'Enterprise',
        result: '420% operational flow',
        quote: 'Seamless integration between systems transformed our operations.',
        metrics: { flow: '+42%', automation: '+88%', cost: '-R2.8M' },
      },
      {
        company: 'DataSync',
        industry: 'Data Management',
        result: '380% data accuracy',
        quote: 'Real-time synchronization ensures data consistency across all systems.',
        metrics: { accuracy: '+38%', sync: '100%', issues: '-92%' },
      },
      {
        company: 'ProcessOptimize',
        industry: 'Process Management',
        result: '450% process automation',
        quote: 'Integrated workflows automated 85% of previously manual processes.',
        metrics: { automation: '+85%', time: '-75%', cost: '-R3.5M' },
      },
    ],
  },
};

export default function ServiceDetail() {
  const [match, params] = useRoute('/services/:id');
  const serviceId = params?.id as string;
  const service = serviceDetails[serviceId];

  if (!service) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground">Service not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <Badge className="w-fit">{service.title}</Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">{service.title}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">{service.description}</p>
      </div>

      {/* Benefits */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {service.benefits.map((benefit: string) => (
            <div key={benefit} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Case Studies */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Case Studies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.caseStudies.map((caseStudy: any, idx: number) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{caseStudy.company}</h3>
                  <p className="text-sm text-muted-foreground">{caseStudy.industry}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-900">{caseStudy.result}</span>
                </div>
              </div>

              {/* Quote */}
              <p className="text-foreground italic mb-4">"{caseStudy.quote}"</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {Object.entries(caseStudy.metrics).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-green-600">{value}</div>
                    <div className="text-xs text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="p-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Ready to see similar results?</h2>
          <p className="text-lg text-muted-foreground">
            Let's discuss how {service.title} can transform your business
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
