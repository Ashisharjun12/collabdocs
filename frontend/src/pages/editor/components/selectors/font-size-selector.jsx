import React from "react";
import { Minus, Plus } from "lucide-react";
import { useEditor } from "novel";
import { Button } from "@/components/ui/button";

export const FontSizeSelector = () => {
  const { editor } = useEditor();

  if (!editor) return null;

  // Get current font size from selection
  const getCurrentFontSize = () => {
    const { fontSize } = editor.getAttributes("textStyle");
    if (!fontSize) return 16; // Default size
    return parseInt(fontSize.replace("px", ""), 10);
  };

  const currentSize = getCurrentFontSize();

  const updateFontSize = (newSize) => {
    if (newSize < 1) return;
    editor.chain().focus().setFontSize(`${newSize}px`).run();
  };

  return (
    <div className="flex items-center border-l border-white/5 ml-1 pl-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        onClick={() => updateFontSize(currentSize - 1)}
        title="Decrease font size"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <div className="flex items-center justify-center w-10 h-8 bg-white/5 rounded-md mx-0.5">
        <span className="text-[11px] font-black text-slate-200 tabular-nums">
          {currentSize}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        onClick={() => updateFontSize(currentSize + 1)}
        title="Increase font size"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
