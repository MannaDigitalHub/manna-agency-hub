import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Twitter, Mail, ArrowRight } from 'lucide-react';

const teamMembers = [
  {
    name: 'Themba Mthembu',
    role: 'Founder & CEO',
    bio: 'Visionary leader with 15+ years in digital transformation. Built Manna from ground zero to serve 500+ businesses across Africa.',
    expertise: ['Strategy', 'AI/ML', 'Business Growth'],
    image: '👔',
  },
  {
    name: 'Lerato Nkosi',
    role: 'Head of Product',
    bio: 'Product strategist obsessed with solving real business problems. Leads the charge on innovation and customer-centric development.',
    expertise: ['Product Design', 'UX/UI', 'Customer Success'],
    image: '🎯',
  },
  {
    name: 'Sipho Dlamini',
    role: 'CTO',
    bio: 'Tech architect with expertise in scalable systems. Ensures Manna infrastructure handles millions of interactions daily.',
    expertise: ['Cloud Architecture', 'AI Integration', 'Security'],
    image: '⚙️',
  },
  {
    name: 'Naledi Mokoena',
    role: 'Head of Client Success',
    bio: 'Customer champion ensuring every client gets maximum ROI. Builds lasting relationships and drives retention.',
    expertise: ['Client Management', 'Training', 'Support'],
    image: '🤝',
  },
  {
    name: 'Kabelo Sekhoto',
    role: 'Lead Developer',
    bio: 'Full-stack wizard building the future of automation. Passionate about clean code and elegant solutions.',
    expertise: ['Full-Stack Dev', 'API Design', 'DevOps'],
    image: '💻',
  },
  {
    name: 'Zola Ndaba',
    role: 'AI/ML Specialist',
    bio: 'Data scientist turning raw data into actionable insights. Continuously improving bot intelligence and accuracy.',
    expertise: ['Machine Learning', 'Data Science', 'Analytics'],
    image: '🧠',
  },
];

const values = [
  {
    title: 'Innovation',
    description: 'We stay ahead of the curve, constantly exploring new technologies and methodologies.',
    icon: '🚀',
  },
  {
    title: 'Excellence',
    description: 'We deliver nothing less than exceptional results for every client, every time.',
    icon: '⭐',
  },
  {
    title: 'Integrity',
    description: 'We build trust through transparency, honesty, and keeping our commitments.',
    icon: '🤲',
  },
  {
    title: 'Impact',
    description: 'We measure success by the real business results our clients achieve.',
    icon: '📈',
  },
];

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-foreground">
          About Manna Digital Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're on a mission to transform African businesses through intelligent automation, AI, and data-driven decision making.
        </p>
      </div>

      {/* Story Section */}
      <Card className="p-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
          <p className="text-lg text-muted-foreground">
            Manna Digital Hub was born from a simple observation: African businesses are losing millions in productivity because they're still doing things manually that should be automated.
          </p>
          <p className="text-lg text-muted-foreground">
            We saw brilliant entrepreneurs spending 80% of their time on admin tasks instead of growing their business. We saw customer service teams overwhelmed with inquiries. We saw data sitting unused while decisions were made on gut feeling.
          </p>
          <p className="text-lg text-muted-foreground">
            So we built Manna — a comprehensive platform that brings together automation, AI, CRM, and analytics in one place. Today, we're helping 500+ businesses across South Africa, Nigeria, Kenya, and beyond reclaim their time and grow their revenue.
          </p>
          <p className="text-lg font-semibold text-green-900">
            Our clients report an average 350% ROI within the first year. That's not luck. That's the power of intelligent automation.
          </p>
        </div>
      </Card>

      {/* Values Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <Card key={value.title} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground">
            Brilliant minds working together to solve your biggest business challenges.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.name} className="p-6 hover:shadow-lg transition-shadow">
              {/* Avatar */}
              <div className="text-6xl mb-4 text-center">{member.image}</div>

              {/* Info */}
              <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
              <p className="text-sm text-green-600 font-semibold mb-3">{member.role}</p>
              <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>

              {/* Expertise */}
              <div className="flex flex-wrap gap-2">
                {member.expertise.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">500+</div>
          <div className="text-muted-foreground mt-2">Active Clients</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">350%</div>
          <div className="text-muted-foreground mt-2">Avg ROI (Year 1)</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">5</div>
          <div className="text-muted-foreground mt-2">Countries Served</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">15+</div>
          <div className="text-muted-foreground mt-2">Years Experience</div>
        </Card>
      </div>

      {/* CTA */}
      <Card className="p-12 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Ready to join 500+ successful businesses?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's discuss how Manna can transform your business
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Schedule Consultation
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Services
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
