import React, { useState, useEffect, useRef } from 'react';
import { Columns, Loader2, ChevronDown, Palette } from 'lucide-react';
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
  '#fff1f2', '#000000'
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
        <DialogContent className="bg-[#ffffff] dark:bg-[#16171d] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white shadow-2xl sm:max-w-[440px] rounded-[16px] p-0 overflow-hidden border-none focus:outline-none">
          <div className="sr-only">
            <DialogHeader><DialogTitle>Page Setup</DialogTitle></DialogHeader>
          </div>

          <Tabs defaultValue={settings.mode} onValueChange={(v) => updateYjs({ mode: v })} className="w-full flex flex-col">
            <div className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
              <div className="px-5 py-3 flex items-center gap-3 border-b border-slate-200 dark:border-white/5">
                <div className="w-5 h-5 bg-[#1D9E75] rounded flex items-center justify-center shadow-md shadow-[#1D9E75]/20">
                  <Columns className="w-3 h-3 text-white" />
                </div>
                <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">Page Setup</span>
              </div>

              <TabsList className="bg-transparent h-10 p-0 flex px-5 gap-5">
                <TabsTrigger
                  value="pages"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#1D9E75] data-[state=active]:text-[#1D9E75] text-slate-500 dark:text-slate-400 rounded-none px-0 h-full transition-all cursor-pointer shadow-none data-[state=active]:shadow-none hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <span className="text-[12px] font-bold">Pages</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pageless"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#1D9E75] data-[state=active]:text-[#1D9E75] text-slate-500 dark:text-slate-400 rounded-none px-0 h-full transition-all cursor-pointer shadow-none data-[state=active]:shadow-none hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <span className="text-[12px] font-bold">Pageless</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <TabsContent value="pages" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Orientation & Size */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Orientation</label>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                      {['portrait', 'landscape'].map(o => (
                        <button
                          key={o}
                          onClick={() => updateYjs({ orientation: o })}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${settings.orientation === o
                              ? 'bg-[#1D9E75] text-white shadow-md shadow-[#1D9E75]/20'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Paper Size</label>
                    <div className="relative group">
                      <select
                        value={settings.pageSize}
                        onChange={(e) => updateYjs({ pageSize: e.target.value })}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-[12px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1D9E75] transition-all appearance-none cursor-pointer"
                      >
                        {PAGE_SIZES.map(s => <option key={s.name} value={s.name} className="bg-white dark:bg-[#16171d] text-slate-800 dark:text-slate-200">{s.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-[#1D9E75] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Page Count */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Number of Pages</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={settings.pageCount || 1}
                      onChange={(e) => updateYjs({ pageCount: parseInt(e.target.value) || 1 })}
                      className="w-24 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-[12px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1D9E75] transition-all"
                    />
                    <span className="text-[11px] text-slate-500">Initial sheets in document</span>
                  </div>
                </div>

                {/* Margins in CM */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Margins (cm)</label>
                    <button
                      onClick={() => updateYjs({ margins: { top: '2.54', bottom: '2.54', left: '2.54', right: '2.54' } })}
                      className="text-[10px] font-bold text-[#1D9E75] hover:underline cursor-pointer uppercase tracking-widest"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {['Top', 'Bottom', 'Left', 'Right'].map(m => (
                      <div key={m} className="relative group">
                        <input
                          type="number"
                          step="0.1"
                          value={settings.margins[m.toLowerCase()]}
                          onChange={(e) => {
                            const newMargins = { ...settings.margins, [m.toLowerCase()]: e.target.value };
                            updateYjs({ margins: newMargins });
                          }}
                          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-2 text-[12px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1D9E75]/50 transition-all text-center"
                        />
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 bg-white dark:bg-[#16171d] text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pageless" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-xl flex gap-3 items-start">
                  <p className="text-[12px] text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
                    Pageless mode removes page breaks and adapts to your screen size. Perfect for wide tables and collaborative drafts.
                  </p>
                </div>
              </TabsContent>

              {/* Background Selection */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Background Color</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center justify-between bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md shadow-sm border border-slate-200 dark:border-white/10" style={{ backgroundColor: settings.backgroundColor }} />
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Page Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500 uppercase">{settings.backgroundColor}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-white dark:bg-[#1c1d25] border border-slate-200 dark:border-white/10 p-4 rounded-xl w-64 shadow-xl">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Presets</p>
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updateYjs({ backgroundColor: c })}
                            className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${settings.backgroundColor === c ? 'border-[#1D9E75] ring-2 ring-[#1D9E75]/30' : 'border-slate-200 dark:border-white/10 hover:scale-110 shadow-sm'
                              }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-white/5" />
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Custom</p>
                        <div className="flex gap-2">
                          <button onClick={() => colorInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer">
                            <Palette className="w-4 h-4 text-[#1D9E75]" />
                          </button>
                          <input ref={colorInputRef} type="color" value={settings.backgroundColor} onChange={(e) => updateYjs({ backgroundColor: e.target.value })} className="sr-only" />
                          <input type="text" value={settings.backgroundColor} onChange={(e) => updateYjs({ backgroundColor: e.target.value })} className="flex-1 h-9 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-[12px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none" placeholder="#ffffff" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/5">
              <button className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all uppercase tracking-widest cursor-pointer">Default</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center min-w-[80px] px-5 py-2 bg-[#1D9E75] rounded-xl text-[12px] font-bold text-white shadow-lg shadow-[#1D9E75]/20 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Done'}
              </button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageSetupAction;
