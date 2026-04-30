import React, { useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const TEXT_COLORS = [
  { name: "Standard", color: "inherit" },
  { name: "Black", color: "#000000" },
  { name: "White", color: "#FFFFFF" },
  { name: "Gray", color: "#A8A29E" },
  { name: "Gold", color: "#EAB308" },
  { name: "Blue", color: "#2563EB" },
  { name: "Green", color: "#008A00" },
  { name: "Orange", color: "#FFA500" },
  { name: "Pink", color: "#BA4081" },
  { name: "Purple", color: "#9333EA" },
  { name: "Red", color: "#E00000" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", color: "transparent" },
  { name: "Black", color: "#000000" },
  { name: "Gray", color: "rgba(168, 162, 158, 0.3)" },
  { name: "Gold", color: "rgba(234, 179, 8, 0.3)" },
  { name: "Blue", color: "rgba(37, 99, 235, 0.3)" },
  { name: "Green", color: "rgba(0, 138, 0, 0.3)" },
  { name: "Orange", color: "rgba(255, 165, 0, 0.3)" },
  { name: "Pink", color: "rgba(186, 64, 129, 0.3)" },
  { name: "Purple", color: "rgba(147, 51, 234, 0.3)" },
  { name: "Red", color: "rgba(224, 0, 0, 0.3)" },
];

export const ColorSelector = ({ open, onOpenChange }) => {
  const { editor } = useEditor();

  if (!editor) return null;

  // Use isActive which is more reliable for Tiptap extensions
  const activeColorItem = TEXT_COLORS.find(({ color }) => 
    editor.isActive("textStyle", { color })
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) => 
    editor.isActive("highlight", { color })
  );

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='gap-2 rounded-none border-none hover:bg-white/5 h-full px-2 cursor-pointer'>
          <div 
            className="w-4 h-4 rounded-full transition-all duration-200 border border-white/20"
            style={{ 
              backgroundColor: activeColorItem?.color || 'white',
              boxShadow: activeColorItem?.color ? `0 0 8px ${activeColorItem.color}88` : 'none',
              outline: activeHighlightItem?.color && activeHighlightItem.color !== 'transparent' 
                ? `2px solid ${activeHighlightItem.color}` 
                : 'none',
              outlineOffset: '2px'
            }}
          />
          <ChevronDown className='h-4 w-4 text-slate-500' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className='z-[99] my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded-2xl border border-white/10 bg-[#16171d] p-1 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl'
        align='start'
      >
        <div className='flex flex-col'>
          <div className='my-1 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest'>Text Color</div>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <EditorBubbleItem
              key={index}
              onSelect={() => {
                editor.chain().focus().unsetColor().run();
                if (name !== "Standard") {
                  editor.chain().focus().setColor(color).run();
                }
                onOpenChange(false);
              }}
              className='flex cursor-pointer items-center justify-between px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-all'
            >
              <div className='flex items-center gap-2'>
                <div 
                  className='w-4 h-4 rounded-full border border-white/10' 
                  style={{ backgroundColor: color }} 
                />
                <span>{name}</span>
              </div>
              {editor.isActive("textStyle", { color }) && <Check className='h-4 w-4 text-[#1D9E75]' />}
            </EditorBubbleItem>
          ))}
        </div>
        <div className="mt-2 border-t border-white/5 pt-2">
          <div className='my-1 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest'>Background</div>
          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <EditorBubbleItem
              key={index}
              onSelect={() => {
                editor.chain().focus().unsetHighlight().run();
                if (name !== "None") {
                  editor.chain().focus().setHighlight({ color }).run();
                }
                onOpenChange(false);
              }}
              className='flex cursor-pointer items-center justify-between px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-all'
            >
              <div className='flex items-center gap-2'>
                <div
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }} />
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", { color }) && <Check className='h-4 w-4 text-[#1D9E75]' />}
            </EditorBubbleItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
