import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Layout, 
  Users, 
  ArrowRight,
  Zap,
  Cloud,
  ChevronRight
} from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Initialize Space',
    desc: 'Sign up and deploy your first secure workspace in seconds with global edge replication.',
    icon: Layout,
    color: '#3ecf8e',
    label: 'PROVISION_WS'
  },
  {
    num: '02',
    title: 'Invite Teammates',
    desc: 'Grant granular access to your team with RBAC. No complicated onboarding, just a single link.',
    icon: UserPlus,
    color: '#8499f5',
    label: 'TEAM_INVITE'
  },
  {
    num: '03',
    title: 'Collaborate Live',
    desc: 'Start editing together with zero-conflict CRDT sync and real-time presence indicators.',
    icon: Zap,
    color: '#fb923c',
    label: 'LIVE_COLLAB'
  }
];

const WorkflowSection = () => {
  return (
    <section className="py-40 px-6 md:px-10 bg-[#171717] border-b border-[#242424] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-24 text-center">
          <div className="text-[12px] font-medium text-[#3ecf8e] uppercase tracking-[2px] mb-4">The Process</div>
          <h2 className="text-4xl md:text-6xl font-medium text-[#fafafa] tracking-tighter mb-6 leading-tight">
            Up and running in <span className="text-[#3ecf8e]">record</span> time
          </h2>
          <p className="text-[#898989] font-normal text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We've removed the friction from team documentation. Deploy, invite, and co-write without ever touching a configuration file.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line - Desktop Only */}
          <div className="absolute top-10 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2e2e2e] to-transparent hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="group relative"
              >
                {/* Step Indicator */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="relative mb-10">
                     <div 
                       className="w-20 h-20 rounded-full bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-[#3ecf8e]/30 shadow-2xl overflow-hidden"
                     >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <step.icon className="w-8 h-8 transition-colors duration-500" style={{ color: step.color }} />
                     </div>
                     <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#0f0f0f] border border-[#2e2e2e] flex items-center justify-center text-[11px] font-bold text-[#fafafa]">
                        {step.num}
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                       <span className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">{step.label}</span>
                       {i < 2 && <ArrowRight className="w-3 h-3 text-[#2e2e2e] hidden md:block" />}
                    </div>
                    <h3 className="text-2xl font-medium text-[#fafafa] tracking-tight group-hover:text-[#3ecf8e] transition-colors duration-500">
                      {step.title}
                    </h3>
                    <p className="text-[#898989] font-normal leading-relaxed text-[15px] group-hover:text-[#b4b4b4] transition-colors duration-500">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Animated Flow Line - Subtle Decoration */}
                <div 
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700"
                  style={{ backgroundColor: step.color, boxShadow: `0 0 15px ${step.color}80` }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Callout */}
        <div className="mt-32 p-8 md:p-12 rounded-[32px] bg-gradient-to-br from-[#1c1c1c] to-[#0f0f0f] border border-[#2e2e2e] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-[#3ecf8e]/20 transition-all duration-500">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#3ecf8e]/10 flex items-center justify-center">
                 <Zap className="w-8 h-8 text-[#3ecf8e]" />
              </div>
              <div>
                 <h4 className="text-xl font-medium text-[#fafafa] mb-1">Ready to scale?</h4>
                 <p className="text-[#898989] text-[15px]">The first 1,000 documents are on us. No credit card required.</p>
              </div>
           </div>
           <button className="px-10 py-5 bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] rounded-full text-[15px] font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-95 group-hover:shadow-[0_0_30px_rgba(62,207,142,0.3)]">
              Get Started Now
              <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
