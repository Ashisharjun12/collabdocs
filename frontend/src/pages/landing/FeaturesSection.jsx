import React from 'react';
import { 
  Users, 
  Zap, 
  Shield, 
  History, 
  MessageCircle, 
  Box, 
  Layers,
  Cpu,
  Globe,
  Lock,
  Sparkles,
  Command
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Real-time Editing',
    desc: 'Multiple people edit the same document simultaneously using Yjs CRDT — zero conflicts, zero lag.',
    icon: Users,
    color: '#3ecf8e', // Emerald
    label: 'COLLAB_CRDT'
  },
  {
    title: 'Smart Workspaces',
    desc: 'Organize documents into workspaces. Invite your team with granular role-based access control.',
    icon: Layers,
    color: '#8499f5', // Indigo
    label: 'WORKSPACE_MGMT'
  },
  {
    title: 'Roles & Permissions',
    desc: 'Viewer · Commenter · Editor · Admin — full RBAC so the right people see the right things.',
    icon: Lock,
    color: '#f36a88', // Crimson
    label: 'RBAC_SECURITY'
  },
  {
    title: 'Version History',
    desc: 'Every change is snapshotted. Restore any past version in one click, and see exactly who changed what.',
    icon: History,
    color: '#f5d147', // Yellow
    label: 'SNAP_RESTORE'
  },
  {
    title: 'Inline Comments',
    desc: 'Select any text and add a comment. Mention teammates with @name and resolve when finished.',
    icon: MessageCircle,
    color: '#a78bfa', // Violet
    label: 'THREADED_DISC'
  },
  {
    title: 'Rich Block Editor',
    desc: 'Headings, bullets, todos, code blocks, tables, images — type / for quick commands and formatting.',
    icon: Command,
    color: '#fb923c', // Orange
    label: 'BLOCK_EDITOR'
  }
];

const FeatureCard = ({ feat, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative p-8 md:p-12 border border-[#2e2e2e] bg-[#171717] hover:bg-[#1c1c1c] transition-all duration-500 overflow-hidden"
    >
      {/* Dynamic Hover Glow */}
      <div 
        className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
        style={{ backgroundColor: feat.color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg"
            style={{ backgroundColor: `${feat.color}15`, border: `1px solid ${feat.color}30` }}
          >
            <feat.icon className="w-6 h-6 transition-colors duration-500" style={{ color: feat.color }} />
          </div>
          <span className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {feat.label}
          </span>
        </div>
        
        <h3 className="text-[20px] font-medium text-[#fafafa] mb-4 tracking-tight group-hover:text-[#fafafa] transition-colors">
          {feat.title}
        </h3>
        <p className="text-[15px] text-[#898989] leading-relaxed font-normal group-hover:text-[#b4b4b4] transition-colors">
          {feat.desc}
        </p>
      </div>

      {/* Decorative Corner Line */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700"
        style={{ backgroundColor: feat.color }}
      />
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-40 px-6 md:px-10 bg-[#171717] border-b border-[#242424]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-24 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e] text-[12px] font-medium tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powerful capabilities
          </div>
          <h2 className="text-4xl md:text-6xl font-medium text-[#fafafa] tracking-tighter mb-8 max-w-3xl leading-[1.1]">
            Engineered for <br/> <span className="text-[#3ecf8e]">uninterrupted</span> workflow
          </h2>
          <p className="text-[#898989] font-normal text-lg md:text-xl max-w-2xl leading-relaxed">
            Built for speed and collaboration. Experience a workspace that feels like your favorite code editor, designed for modern teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-[#2e2e2e] rounded-3xl overflow-hidden shadow-2xl">
          {features.map((feat, i) => (
            <FeatureCard key={i} feat={feat} index={i} />
          ))}
        </div>
        
        <div className="mt-20 flex flex-wrap justify-center gap-10 md:gap-20 opacity-20 grayscale">
           <div className="flex items-center gap-2 text-xl font-bold italic">FLOW_ENGINE</div>
           <div className="flex items-center gap-2 text-xl font-bold italic">SYNC_MESH</div>
           <div className="flex items-center gap-2 text-xl font-bold italic">EDGE_DOCS</div>
           <div className="flex items-center gap-2 text-xl font-bold italic">CRDT_PROTO</div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
