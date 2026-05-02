import React, { useState, useEffect, useRef } from 'react';
import { Columns, Loader2, ChevronDown, Palette, Maximize } from 'lucide-react';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarItem from './SidebarItem';

const PAGE_SIZES = [
  { name: 'Letter', width: '21.59cm', height: '27.94cm' },
  { name: 'Legal', width: '21.59cm', height: '35.56cm' },
  { name: 'A4', width: '21.0cm', height: '29.7cm' },
  { name: 'A3', width: '29.7cm', height: '42.0cm' },
  { name: 'A5', width: '14.8cm', height: '21.0cm' },
];

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
  '#fff7ed', '#fefce8', '#f0fdf4', '#eff6ff', '#faf5ff',
  '#fff1f2', '#171717'
];

const PageSetupAction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const provider = useHocuspocusProvider();
  const colorInputRef = useRef(null);

  const [settings, setSettings] = useState({
    mode: 'pages',
    orientation: 'portrait',
    pageSize: 'A4',
    backgroundColor: '#ffffff',
    pageCount: 1,
    margins: { top: '2.54', bottom: '2.54', left: '2.54', right: '2.54' }
  });

  useEffect(() => {
    if (!provider) return;
    const yMap = provider.document.getMap('settings');
    const updateSettings = () => {
      const data = yMap.toJSON();
      if (Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    };
    yMap.observe(updateSettings);
    updateSettings();
    return () => yMap.unobserve(updateSettings);
  }, [provider]);

  const updateYjs = (newSettings) => {
    if (!provider) return;
    const yMap = provider.document.getMap('settings');
    Object.entries(newSettings).forEach(([key, value]) => {
      yMap.set(key, value);
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsOpen(false);
  };

  return (
    <>
      <SidebarItem
        icon={<Columns className="w-4 h-4" />}
        label="Page Setup"
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] shadow-2xl sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border-none focus:outline-none">
          <div className="sr-only">
            <DialogHeader><DialogTitle>Page Setup</DialogTitle></DialogHeader>
          </div>

          <Tabs defaultValue={settings.mode} onValueChange={(v) => updateYjs({ mode: v })} className="w-full flex flex-col">
            <div className="border-b border-[#2e2e2e] bg-[#1c1c1c]/50">
              <div className="px-6 py-4 flex items-center gap-3 border-b border-[#2e2e2e]">
                <div className="w-8 h-8 bg-[#3ecf8e]/10 rounded-lg flex items-center justify-center border border-[#3ecf8e]/20">
                  <Columns className="w-4 h-4 text-[#3ecf8e]" />
                </div>
                <span className="text-sm font-bold tracking-tight">Page Setup</span>
              </div>

              <TabsList className="bg-transparent h-12 p-0 flex px-6 gap-8">
                <TabsTrigger
                  value="pages"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#3ecf8e] data-[state=active]:text-[#3ecf8e] text-[#4d4d4d] rounded-none px-0 h-full transition-all cursor-pointer shadow-none data-[state=active]:shadow-none hover:text-[#fafafa]"
                >
                  <span className="text-[12px] font-bold uppercase tracking-widest">Pages</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pageless"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#3ecf8e] data-[state=active]:text-[#3ecf8e] text-[#4d4d4d] rounded-none px-0 h-full transition-all cursor-pointer shadow-none data-[state=active]:shadow-none hover:text-[#fafafa]"
                >
                  <span className="text-[12px] font-bold uppercase tracking-widest">Pageless</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8 space-y-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <TabsContent value="pages" className="space-y-10 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Orientation & Size */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] block">Orientation</label>
                    <div className="flex bg-[#1c1c1c] p-1 rounded-xl border border-[#2e2e2e]">
                      {['portrait', 'landscape'].map(o => (
                        <button
                          key={o}
                          onClick={() => updateYjs({ orientation: o })}
                          className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${settings.orientation === o
                              ? 'bg-[#3ecf8e] text-[#171717] shadow-lg shadow-[#3ecf8e]/10'
                              : 'text-[#4d4d4d] hover:text-[#fafafa]'
                            }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] block">Paper Size</label>
                    <div className="relative group">
                      <select
                        value={settings.pageSize}
                        onChange={(e) => updateYjs({ pageSize: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl py-2.5 px-4 text-[12px] font-bold text-[#fafafa] focus:outline-none focus:border-[#3ecf8e]/40 transition-all appearance-none cursor-pointer"
                      >
                        {PAGE_SIZES.map(s => <option key={s.name} value={s.name} className="bg-[#1c1c1c] text-[#fafafa]">{s.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d] pointer-events-none group-hover:text-[#3ecf8e] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Page Count */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] block">Initial Pages</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={settings.pageCount || 1}
                      onChange={(e) => updateYjs({ pageCount: parseInt(e.target.value) || 1 })}
                      className="w-24 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl py-2.5 px-4 text-[12px] font-bold text-[#fafafa] focus:outline-none focus:border-[#3ecf8e]/40 transition-all"
                    />
                    <span className="text-[11px] text-[#4d4d4d] font-medium">Sheets generated at birth</span>
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] block">Margins (cm)</label>
                    <button
                      onClick={() => updateYjs({ margins: { top: '2.54', bottom: '2.54', left: '2.54', right: '2.54' } })}
                      className="text-[10px] font-bold text-[#3ecf8e] hover:opacity-80 cursor-pointer uppercase tracking-widest"
                    >
                      Reset Default
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {['Top', 'Bottom', 'Left', 'Right'].map(m => (
                      <div key={m} className="relative pt-4">
                        <input
                          type="number"
                          step="0.1"
                          value={settings.margins[m.toLowerCase()]}
                          onChange={(e) => {
                            const newMargins = { ...settings.margins, [m.toLowerCase()]: e.target.value };
                            updateYjs({ margins: newMargins });
                          }}
                          className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl py-3 px-2 text-[12px] font-bold text-[#fafafa] focus:outline-none focus:border-[#3ecf8e]/40 transition-all text-center"
                        />
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#4d4d4d] uppercase tracking-widest">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pageless" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-6 bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 rounded-2xl flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20">
                     <Maximize className="w-5 h-5 text-[#3ecf8e]" />
                  </div>
                  <p className="text-[13px] text-[#fafafa] leading-relaxed font-medium tracking-tight">
                    Pageless mode removes physical breaks and adapts content to your viewport width. 
                    <span className="block mt-2 text-[#898989] text-xs">Ideal for large images, tables, and ultra-wide displays.</span>
                  </p>
                </div>
              </TabsContent>

              {/* Background Color */}
              <div className="pt-10 border-t border-[#2e2e2e] space-y-4">
                <label className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] block">Surface Appearance</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center justify-between bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-3 hover:bg-[#242424] transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md shadow-inner border border-[#2e2e2e]" style={{ backgroundColor: settings.backgroundColor }} />
                        <span className="text-[12px] font-bold text-[#fafafa] tracking-tight">Canvas Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#4d4d4d] uppercase font-bold">{settings.backgroundColor}</span>
                        <ChevronDown className="w-4 h-4 text-[#4d4d4d] group-hover:text-[#fafafa]" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-[#1c1c1c] border border-[#2e2e2e] p-5 rounded-2xl w-64 shadow-2xl z-[250]">
                    <div className="space-y-5">
                      <p className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">Core Presets</p>
                      <div className="grid grid-cols-6 gap-3">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updateYjs({ backgroundColor: c })}
                            className={`w-7 h-7 rounded-lg border transition-all cursor-pointer ${settings.backgroundColor === c ? 'border-[#3ecf8e] ring-2 ring-[#3ecf8e]/20 scale-110' : 'border-[#2e2e2e] hover:scale-110 shadow-sm'
                              }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="h-px bg-[#2e2e2e]" />
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">Custom Tone</p>
                        <div className="flex gap-2">
                          <button onClick={() => colorInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-[#242424] border border-[#2e2e2e] flex items-center justify-center hover:bg-[#2e2e2e] transition-all cursor-pointer">
                            <Palette className="w-4 h-4 text-[#3ecf8e]" />
                          </button>
                          <input ref={colorInputRef} type="color" value={settings.backgroundColor} onChange={(e) => updateYjs({ backgroundColor: e.target.value })} className="sr-only" />
                          <input type="text" value={settings.backgroundColor} onChange={(e) => updateYjs({ backgroundColor: e.target.value })} className="flex-1 h-10 bg-[#242424] border border-[#2e2e2e] rounded-xl px-3 text-[11px] font-mono text-[#fafafa] focus:outline-none focus:border-[#3ecf8e]/40" placeholder="#ffffff" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-between px-8 py-6 bg-[#1c1c1c]/50 border-t border-[#2e2e2e]">
              <button className="text-[10px] font-bold text-[#4d4d4d] hover:text-[#fafafa] transition-all uppercase tracking-[2px] cursor-pointer">Set Default</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center min-w-[100px] h-10 px-6 bg-[#3ecf8e] rounded-xl text-xs font-bold text-[#171717] shadow-lg shadow-[#3ecf8e]/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Setup'}
              </button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageSetupAction;
