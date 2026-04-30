import React from "react";
import { EditorBubbleItem } from "novel";
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "../../../../store/media-store";

export const MediaSelector = () => {
  const { setOpen } = useMediaStore();

  return (
    <EditorBubbleItem
      onSelect={() => {
        setOpen(true);
      }}
    >
      <Button 
        size='icon'
        variant='ghost'
        className='rounded-none h-full w-9 hover:bg-white/5 cursor-pointer'
      >
        <Image className="h-4 w-4 text-slate-400" />
      </Button>
    </EditorBubbleItem>
  );
};
