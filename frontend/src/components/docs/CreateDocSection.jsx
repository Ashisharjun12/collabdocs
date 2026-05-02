import React from 'react';
import { Plus, FileText, Layout, CheckSquare, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const CreateDocSection = ({ onOpenModal }) => {
  const templates = [
    { 
      id: 'blank', 
      label: 'Blank document', 
      icon: Plus, 
      color: '#3ecf8e', 
      bg: 'bg-[#3ecf8e]/10', 
      border: 'border-[#3ecf8e]/20',
      onClick: onOpenModal 
    },
    { 
      id: 'meeting', 
      label: 'Meeting notes', 
      icon: FileText, 
      color: '#3b82f6', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20',
      onClick: () => toast.info('Meeting notes template coming soon!')
    },
    { 
      id: 'project', 
      label: 'Project plan', 
      icon: Layout, 
      color: '#a855f7', 
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/20',
      onClick: () => toast.info('Project plan template coming soon!')
    },
    { 
      id: 'todo', 
      label: 'Tasks list', 
      icon: CheckSquare, 
      color: '#eab308', 
      bg: 'bg-yellow-500/10', 
      border: 'border-yellow-500/20',
      onClick: () => toast.info('Tasks list template coming soon!')
    },
    { 
      id: 'brainstorm', 
      label: 'Brainstorm', 
      icon: MessageSquare, 
      color: '#f43f5e', 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/20',
      onClick: () => toast.info('Brainstorm template coming soon!')
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-[12px] font-medium text-[#898989] uppercase tracking-[1.2px] mb-6">Start a new document</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="flex flex-col gap-3">
            <button 
              onClick={template.onClick}
              className={`w-full h-32 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#4d4d4d] transition-all group relative overflow-hidden shadow-sm cursor-pointer`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-10 h-10 ${template.bg} rounded-xl flex items-center justify-center ${template.border} group-hover:scale-110 transition-transform shadow-inner`}>
                <template.icon className="w-5 h-5" style={{ color: template.color }} />
              </div>
              <span className="text-[13px] font-medium text-[#fafafa] group-hover:text-white transition-colors">{template.label}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CreateDocSection;
