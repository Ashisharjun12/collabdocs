import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Switched from Notion last month — CollabDocs is faster and the real-time sync actually works without conflicts. It's transformed how our dev team documents architecture.",
    author: "Arjun Kapoor",
    role: "CTO, TechPulse",
    initials: "AK",
    color: "bg-[#1D9E75]"
  },
  {
    quote: "The workspace and role system is perfect for client projects. Super clean UI, nothing feels bloated. Our clients love the simplicity of the shared links.",
    author: "Priya Rao",
    role: "Product Manager, CreativeCo",
    initials: "PR",
    color: "bg-[#534AB7]"
  },
  {
    quote: "Version history saved us when someone accidentally deleted an entire section of our API spec. The ability to restore snapshots in one click is a lifesaver.",
    author: "Mihir Verma",
    role: "Engineering Lead, FinFlow",
    initials: "MV",
    color: "bg-[#D85A30]"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 px-6 md:px-10 bg-[#0f1117] border-b border-[#1e2130]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h4 className="text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.2em] mb-4">What teams say</h4>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Loved by teams that move fast
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <div key={i} className="p-8 rounded-[2rem] border border-[#1e2130] bg-[#13151f] flex flex-col hover:border-[#1D9E75]/20 transition-all group">
              <Quote className="w-8 h-8 text-[#1D9E75]/20 mb-6 group-hover:text-[#1D9E75]/40 transition-colors" />
              <p className="text-slate-400 font-medium leading-relaxed mb-8 flex-1 italic">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`${test.color} w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white ring-4 ring-white/5`}>
                  {test.initials}
                </div>
                <div>
                  <div className="text-sm font-black text-white">{test.author}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{test.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
