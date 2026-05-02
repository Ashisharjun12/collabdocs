import React from "react";
import { cn } from "@/lib/utils";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "./ui/avatar";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Flow has completely changed how our product team collaborates. The zero-latency sync is a game changer for real-time brainstorming.",
    name: "Sarah Chen",
    role: "Product Lead",
    company: "Linear",
    image: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    quote: "The cleanest markdown editor I've ever used. The document conversion from PDF is surprisingly accurate and fast.",
    name: "Alex Rivera",
    role: "Fullstack Developer",
    company: "Vercel",
    image: "https://i.pravatar.cc/150?u=alex"
  },
  {
    quote: "The Emerald design system is just stunning. It feels like a premium tool from the moment you log in.",
    name: "Jordan Smith",
    role: "Design Director",
    company: "Airbnb",
    image: "https://i.pravatar.cc/150?u=jordan"
  },
  {
    quote: "Finally, a documentation tool that doesn't feel bloated. Simple, fast, and secure. Exactly what our startup needed.",
    name: "Emily Watson",
    role: "CTO",
    company: "Revolut",
    image: "https://i.pravatar.cc/150?u=emily"
  },
  {
    quote: "The R2 integration for media storage is seamless. We can handle massive amounts of documentation with ease.",
    name: "Marcus Low",
    role: "Software Architect",
    company: "Supabase",
    image: "https://i.pravatar.cc/150?u=marcus"
  },
  {
    quote: "Best collaborative experience since Google Docs, but with the power of modern markdown and AI.",
    name: "Sofia G.",
    role: "Content Strategist",
    company: "Notion",
    image: "https://i.pravatar.cc/150?u=sofia"
  }
];

const TestimonialCard = ({ testimonial }) => (
  <div className="flex flex-col gap-6 p-8 rounded-3xl bg-[#1c1c1c]/40 border border-[#2e2e2e] hover:border-[#3ecf8e]/30 transition-all duration-500 w-[350px] shrink-0 group">
    <div className="flex items-center gap-4">
      <Avatar className="size-11 border-2 border-[#2e2e2e] group-hover:border-[#3ecf8e]/40 transition-colors">
        <AvatarImage src={testimonial.image} />
        <AvatarFallback className="bg-[#171717] text-[#3ecf8e] text-[10px] font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="text-[14px] font-medium text-[#fafafa]">{testimonial.name}</h4>
        <p className="text-[11px] text-[#4d4d4d] font-medium uppercase tracking-wider">{testimonial.role} @ {testimonial.company}</p>
      </div>
    </div>
    
    <div className="relative">
      <Quote className="absolute -top-2 -left-2 size-10 text-[#3ecf8e]/5 -rotate-6" />
      <p className="text-[#898989] text-[14px] leading-relaxed relative z-10">
        "{testimonial.quote}"
      </p>
    </div>
  </div>
);

const MarqueeRow = ({ items, reverse = false }) => (
  <div className="flex overflow-hidden group py-4">
    <motion.div 
      animate={{ x: reverse ? [0, -1750] : [-1750, 0] }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      className="flex gap-6 shrink-0"
    >
      {[...items, ...items, ...items].map((t, i) => (
        <TestimonialCard key={i} testimonial={t} />
      ))}
    </motion.div>
  </div>
);

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-[#171717] relative overflow-hidden border-b border-[#242424]">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#3ecf8e]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 mb-20 text-center">
        <div className="text-[12px] font-medium text-[#3ecf8e] uppercase tracking-[1.5px] mb-4">Wall of Love</div>
        <h2 className="text-4xl md:text-6xl font-medium text-[#fafafa] tracking-tight mb-8 leading-tight">
          Trusted by the <br /> best teams <span className="text-[#3ecf8e]">worldwide</span>
        </h2>
        <p className="text-lg text-[#898989] font-normal max-w-2xl mx-auto leading-relaxed">
          Join thousands of high-performing teams who have switched to Flow for their documentation and collaboration needs.
        </p>
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Top Gradient Shadow */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#171717] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#171717] to-transparent z-20 pointer-events-none" />
        
        <MarqueeRow items={testimonials.slice(0, 3)} />
        <MarqueeRow items={testimonials.slice(3, 6)} reverse />
      </div>

      <div className="mt-20 flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Google_logo_%282015%29.svg" alt="Google" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="h-7 invert" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI" className="h-6 invert" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-6 invert" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Tesla_Motors.svg" alt="Tesla" className="h-5 invert" />
      </div>
    </section>
  );
}
