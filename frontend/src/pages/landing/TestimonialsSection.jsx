import React from 'react';

const testimonials = [
  {
    quote: "Switched from Notion last month — CollabDocs is faster and the real-time sync actually works without conflicts.",
    author: "Arjun Kapoor",
    role: "CTO, TechPulse",
    initials: "AK"
  },
  {
    quote: "The workspace and role system is perfect for client projects. Super clean UI, nothing feels bloated.",
    author: "Priya Rao",
    role: "Product Manager, CreativeCo",
    initials: "PR"
  },
  {
    quote: "Version history saved us when someone accidentally deleted an entire section of our API spec. Snapshots are a lifesaver.",
    author: "Mihir Verma",
    role: "Engineering Lead, FinFlow",
    initials: "MV"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-32 px-6 md:px-10 bg-[#171717] border-b border-[#242424]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 text-center">
          <div className="text-[12px] font-medium text-[#3ecf8e] uppercase tracking-[1.2px] mb-4">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-medium text-[#fafafa] tracking-tight">
            Loved by teams that move fast
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-[#2e2e2e] border border-[#2e2e2e] rounded-xl overflow-hidden">
          {testimonials.map((test, i) => (
            <div key={i} className="p-10 bg-[#171717] flex flex-col hover:bg-[#1c1c1c] transition-all group">
              <p className="text-[#fafafa] font-normal text-[16px] leading-relaxed mb-10 flex-1">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2e2e2e] flex items-center justify-center text-[12px] font-medium text-[#fafafa] border border-[#363636]">
                  {test.initials}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#fafafa]">{test.author}</div>
                  <div className="text-[12px] font-normal text-[#898989] uppercase tracking-wider">{test.role}</div>
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
