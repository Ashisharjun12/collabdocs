import React from "react";
import {
  Check,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  TextQuote,
  ListOrdered,
  TextIcon,
  Code,
  CheckSquare,
} from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const items = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) => editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
    isActive: (editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
    isActive: (editor) => editor.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) =>
      editor.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: Code,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
];

export const NodeSelector = ({ open, onOpenChange }) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant='ghost' 
          className='gap-2 rounded-none border-none hover:bg-white/5 h-full focus-visible:ring-0 px-2 cursor-pointer'
        >
          <span className='whitespace-nowrap text-sm text-slate-300'>{activeItem.name}</span>
          <ChevronDown className='h-4 w-4 text-slate-500' />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        sideOffset={5} 
        align='start' 
        className='z-[99] w-48 p-1 bg-[#16171d] border-white/10 backdrop-blur-xl'
      >
        {items.map((item, index) => (
          <EditorBubbleItem
            key={index}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className='flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5 transition-colors'
          >
            <div className='flex items-center space-x-2'>
              <div className='rounded-sm border border-white/10 p-1 bg-white/5'>
                <item.icon className='h-3 w-3' />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className='h-4 w-4 text-[#1D9E75]' />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
