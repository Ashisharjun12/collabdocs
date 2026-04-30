import React from 'react';
import { Users, Zap, Shield, History, MessageCircle, Box } from 'lucide-react';

const features = [
  {
    title: 'Real-time Editing',
    desc: 'Multiple people edit the same document simultaneously using Yjs CRDT — zero conflicts, zero lag.',
    icon: Users,
    color: 'bg-[#1D9E75]/10',
    iconColor: 'text-[#1D9E75]'
  },
  {
    title: 'Smart Workspaces',
    desc: 'Organize documents into workspaces. Invite your team with granular role-based access control.',
    icon: Box,
    color: 'bg-[#534AB7]/10',
    iconColor: 'text-[#534AB7]'
  },
  {
    title: 'Roles & Permissions',
    desc: 'Viewer · Commenter · Editor · Admin — full RBAC so the right people see the right things.',
    icon: Shield,
    color: 'bg-[#D85A30]/10',
    iconColor: 'text-[#D85A30]'
  },
  {
    title: 'Version History',
    desc: 'Every change is snapshotted. Restore any past version in one click, and see exactly who changed what.',
    icon: History,
    color: 'bg-[#1D9E75]/10',
    iconColor: 'text-[#1D9E75]'
  },
  {
    title: 'Inline Comments',
    desc: 'Select any text and add a comment. Mention teammates with @name and resolve when finished.',
    icon: MessageCircle,
    color: 'bg-[#534AB7]/10',
    iconColor: 'text-[#534AB7]'
  },
  {
    title: 'Rich Block Editor',
    desc: 'Headings, bullets, todos, code blocks, tables, images — type / for quick commands and formatting.',
    icon: Zap,
    color: 'bg-[#D85A30]/10',
    iconColor: 'text-[#D85A30]'
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6 md:px-10 bg-[#0f1117] border-b border-[#1e2130]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h4 className="text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.2em] mb-4">Features</h4>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 max-w-xl">
            Everything your team needs to write better, together
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl">
            Built for speed, built for collaboration — not just another doc editor. Experience the power of a truly synchronized workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-[#1e2130] bg-[#13151f] hover:border-[#1D9E75]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#1D9E75]/5">
              <div className={`${feat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feat.icon className={`${feat.iconColor} w-6 h-6`} />
              </div>
              <h3 className="text-lg font-black text-white mb-3 tracking-tight">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
