import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

const pricingPlans = {
  automation: {
    name: 'WhatsApp Automation',
    basePrice: 2999,
    features: ['24/7 Bot', '10 Languages', 'Lead Capture', '1000 msgs/month'],
    roiMultiplier: 3,
    description: 'Automate customer interactions',
  },
  ai: {
    name: 'AI Solutions',
    basePrice: 4999,
    features: ['Custom Model', 'Data Analysis', 'Predictive Analytics', 'Training'],
    roiMultiplier: 4.5,
    description: 'Custom AI for your business',
  },
  crm: {
    name: 'CRM System',
    basePrice: 3499,
    features: ['Contact Mgmt', 'Sales Pipeline', 'Automation', 'Reports'],
    roiMultiplier: 2.5,
    description: 'Manage customers & sales',
  },
  analytics: {
    name: 'Business Analytics',
    basePrice: 3999,
    features: ['Real-time Dashboards', 'Custom Reports', 'Predictive Insights', 'Alerts'],
    roiMultiplier: 5,
    description: 'Data-driven decisions',
  },
};

export default function PricingCalculator() {
  const [selectedService, setSelectedService] = useState('automation');
  const [teamSize, setTeamSize] = useState(5);
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [currentCosts, setCurrentCosts] = useState(5000);
  const [implementationTime, setImplementationTime] = useState(2);

  const service = pricingPlans[selectedService as keyof typeof pricingPlans];

  const calculations = useMemo(() => {
    const monthlyCost = service.basePrice + teamSize * 500 + (monthlyRevenue / 100000) * 1000;
    const annualCost = monthlyCost * 12;
    
    // ROI Calculation
    const timeToBreakeven = (monthlyCost / (currentCosts * 0.3)) * 30; // days
    const yearOneROI = ((currentCosts * 0.3 * 12 - monthlyCost * 12) / (monthlyCost * 12)) * 100;
    const threeyearROI = ((currentCosts * 0.3 * 36 - monthlyCost * 36) / (monthlyCost * 36)) * 100;
    
    // Efficiency gains
    const timeSaved = teamSize * 8 * 20; // hours per month
    const costSavings = timeSaved * 25; // $25/hour
    const revenueIncrease = monthlyRevenue * (service.roiMultiplier / 100);
    
    return {
      monthlyCost: Math.round(monthlyCost),
      annualCost: Math.round(annualCost),
      timeToBreakeven: Math.round(timeToBreakeven),
      yearOneROI: Math.round(yearOneROI),
      threeyearROI: Math.round(threeyearROI),
      timeSaved: Math.round(timeSaved),
      costSavings: Math.round(costSavings),
      revenueIncrease: Math.round(revenueIncrease),
      totalBenefit: Math.round(costSavings + revenueIncrease),
    };
  }, [selectedService, teamSize, monthlyRevenue, currentCosts, service]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Pricing & ROI Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See exactly how much you'll save and earn with Manna solutions
        </p>
      </div>

      {/* Service Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(pricingPlans).map(([key, plan]) => (
          <Card
            key={key}
            className={`p-4 cursor-pointer transition-all ${
              selectedService === key
                ? 'ring-2 ring-green-500 bg-green-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedService(key)}
          >
            <h3 className="font-semibold text-foreground text-sm">{plan.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
            <div className="text-lg font-bold text-green-600 mt-2">
              R{plan.basePrice.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>

      {/* Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Your Scenario</h2>

          {/* Team Size */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Size
              </label>
              <span className="text-2xl font-bold text-green-600">{teamSize}</span>
            </div>
            <Slider
              value={[teamSize]}
              onValueChange={(value) => setTeamSize(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">people</p>
          </div>

          {/* Monthly Revenue */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Revenue
              </label>
              <span className="text-2xl font-bold text-green-600">
                R{(monthlyRevenue / 1000).toFixed(0)}k
              </span>
            </div>
            <Slider
              value={[monthlyRevenue]}
              onValueChange={(value) => setMonthlyRevenue(value[0])}
              min={10000}
              max={500000}
              step={10000}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">per month</p>
          </div>

          {/* Current Costs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Current Manual Costs
              </label>
              <span className="text-2xl font-bold text-green-600">
                R{(currentCosts / 1000).toFixed(0)}k
              </span>
            </div>
            <Slider
              value={[currentCosts]}
              onValueChange={(value) => setCurrentCosts(value[0])}
              min={1000}
              max={50000}
              step={1000}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">per month</p>
          </div>

          {/* Implementation Time */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-foreground">Implementation Time</label>
              <span className="text-2xl font-bold text-green-600">{implementationTime} weeks</span>
            </div>
            <Slider
              value={[implementationTime]}
              onValueChange={(value) => setImplementationTime(value[0])}
              min={1}
              max={12}
              step={1}
              className="w-full"
            />
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* ROI Card */}
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Your ROI</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-green-700">Year 1 ROI</div>
                <div className="text-4xl font-bold text-green-600">
                  {calculations.yearOneROI > 0 ? '+' : ''}{calculations.yearOneROI}%
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <div className="text-sm text-green-700">3-Year ROI</div>
                <div className="text-4xl font-bold text-green-600">
                  {calculations.threeyearROI > 0 ? '+' : ''}{calculations.threeyearROI}%
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <div className="text-sm text-green-700">Breakeven in</div>
                <div className="text-2xl font-bold text-green-600">
                  {calculations.timeToBreakeven} days
                </div>
              </div>
            </div>
          </Card>

          {/* Savings Card */}
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-foreground">Monthly Benefits</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cost Savings</span>
                <span className="font-bold text-green-600">R{calculations.costSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Revenue Increase</span>
                <span className="font-bold text-green-600">R{calculations.revenueIncrease.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total Benefit</span>
                <span className="font-bold text-green-600 text-lg">
                  R{calculations.totalBenefit.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Pricing Card */}
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-foreground">Investment</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Monthly Cost</span>
                <span className="font-bold">R{calculations.monthlyCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Annual Cost</span>
                <span className="font-bold">R{calculations.annualCost.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Button size="lg" className="w-full gap-2">
            Get Started Today
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Efficiency Gains</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{calculations.timeSaved}</div>
            <div className="text-sm text-muted-foreground mt-2">Hours Saved Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{teamSize * 2}</div>
            <div className="text-sm text-muted-foreground mt-2">Equivalent FTEs Freed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{Math.round((calculations.totalBenefit / calculations.monthlyCost) * 10) / 10}x</div>
            <div className="text-sm text-muted-foreground mt-2">Benefit to Cost Ratio</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
