import React, { useEffect, useRef } from "react";
import { Check, Trash } from "lucide-react";
import { useEditor } from "novel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function getUrlFromString(str) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (e) {
    return null;
  }
}

export const LinkSelector = ({ open, onOpenChange }) => {
  const inputRef = useRef(null);
  const { editor } = useEditor();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  if (!editor) return null;

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant='ghost' 
          className='gap-2 rounded-none border-none hover:bg-white/5 h-full px-2 cursor-pointer'
        >
          <p className={cn("text-base", editor.isActive("link") ? "text-sky-400" : "text-slate-400")}>↗</p>
          <p className={cn("underline underline-offset-4", editor.isActive("link") ? "text-sky-400 decoration-sky-400" : "text-slate-400 decoration-slate-600")}>
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align='start' 
        className='z-[99] w-64 p-0 bg-[#16171d] border-white/10 backdrop-blur-xl' 
        sideOffset={10}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget[0];
            const url = getUrlFromString(input.value);
            if (url) {
                editor.chain().focus().setLink({ href: url }).run();
                onOpenChange(false);
            }
          }}
          className='flex p-1'
        >
          <input
            ref={inputRef}
            type='text'
            placeholder='Paste a link'
            className='flex-1 bg-transparent p-1 text-sm text-slate-200 outline-none placeholder:text-slate-600'
            defaultValue={editor.getAttributes("link").href || ""}
          />
          {editor.getAttributes("link").href ? (
            <Button
              size='icon'
              variant='ghost'
              type='button'
              className='flex h-8 w-8 items-center justify-center text-rose-500 hover:bg-rose-500/10'
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                onOpenChange(false);
              }}
            >
              <Trash className='h-4 w-4' />
            </Button>
          ) : (
            <Button size='icon' className='h-8 w-8 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'>
              <Check className='h-4 w-4' />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};
