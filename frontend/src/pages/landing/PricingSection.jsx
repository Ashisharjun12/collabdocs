import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'For individuals and side projects.',
    features: ['5 documents', '3 members', 'Basic block editor', 'Real-time sync'],
    cta: 'Get started',
    featured: false
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    desc: 'For growing teams that need power.',
    features: ['Unlimited docs', '20 members', '30-day history', 'Priority support'],
    cta: 'Get started',
    featured: true
  },
  {
    name: 'Team',
    price: '₹999',
    period: '/mo',
    desc: 'For large organizations.',
    features: ['Everything in Pro', 'Unlimited members', 'SSO + Admin Panel', 'Dedicated support'],
    cta: 'Contact Sales',
    featured: false
  }
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-32 px-6 md:px-10 bg-[#171717] border-b border-[#242424]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-[12px] font-medium text-[#3ecf8e] uppercase tracking-[1.2px] mb-4">
            Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-medium text-[#fafafa] tracking-tight mb-6 leading-tight">
            Predictable pricing for every team
          </h2>
          <p className="text-[#898989] font-normal text-lg max-w-2xl mx-auto leading-relaxed">
            Start for free and scale as you grow. No hidden costs, just straightforward pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-[#2e2e2e] border border-[#2e2e2e] rounded-xl overflow-hidden">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-10 bg-[#171717] flex flex-col transition-all duration-300 relative ${
                plan.featured ? 'z-10' : ''
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 p-4">
                   <span className="text-[10px] font-medium text-[#3ecf8e] bg-[#3ecf8e]/10 px-2 py-0.5 rounded uppercase tracking-wider">Most Popular</span>
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-[14px] font-medium text-[#898989] mb-6 uppercase tracking-[1.2px]">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-medium text-[#fafafa]">{plan.price}</span>
                  <span className="text-[#4d4d4d] text-[14px] font-normal">{plan.period}</span>
                </div>
                <p className="text-[14px] text-[#898989] font-normal leading-relaxed">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Check className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span className="text-[13px] text-[#898989] font-normal">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/signup')}
                className={`w-full py-6 rounded-[6px] text-[14px] font-medium transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                  plan.featured
                    ? 'bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] border-none'
                    : 'bg-[#2e2e2e] hover:bg-[#363636] text-[#fafafa] border-none'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
