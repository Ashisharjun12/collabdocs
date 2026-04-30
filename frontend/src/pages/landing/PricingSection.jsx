import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'For individuals and small side projects.',
    features: ['5 documents', '3 members', 'Basic block editor', 'Real-time collaboration'],
    cta: 'Get started',
    featured: false
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    desc: 'For growing teams that need more power.',
    features: ['Unlimited documents', 'Up to 20 members', 'Version history (30 days)', 'Priority support'],
    cta: 'Upgrade to Pro',
    featured: true
  },
  {
    name: 'Team',
    price: '₹999',
    period: '/mo',
    desc: 'For large organizations and startups.',
    features: ['Everything in Pro', 'Unlimited members', 'SSO + Admin Panel', 'Dedicated support'],
    cta: 'Contact Sales',
    featured: false
  }
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 px-6 md:px-10 bg-[#0f1117] border-b border-[#1e2130]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h4 className="text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.2em] mb-4">Pricing</h4>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Start free. Upgrade when your team grows. No hidden fees, just pure productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-[2.5rem] border ${
                plan.featured
                  ? 'border-[#1D9E75] bg-[#1D9E75]/5 shadow-2xl shadow-[#1D9E75]/10'
                  : 'border-[#1e2130] bg-[#13151f]'
              } flex flex-col transition-all duration-300 hover:translate-y-[-4px]`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                  Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-sm font-black mb-4 uppercase tracking-widest ${plan.featured ? 'text-[#1D9E75]' : 'text-slate-400'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm font-bold">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-4">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.featured ? 'bg-[#1D9E75]/20' : 'bg-slate-800/50'}`}>
                      <Check className={`w-3 h-3 ${plan.featured ? 'text-[#1D9E75]' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className={`w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 group ${
                  plan.featured
                    ? 'bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white shadow-xl shadow-[#1D9E75]/20'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
