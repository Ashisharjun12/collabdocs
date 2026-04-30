import React from 'react';
import { Focus } from 'lucide-react';
import { useLayoutStore } from '../../../../store/layout-store';
import { toast } from 'sonner';

const PresenceSettingsAction = () => {
  const { isZenMode, setZenMode } = useLayoutStore();

  const handleToggle = () => {
    const next = !isZenMode;
    setZenMode(next);
    if (next) {
      toast('Focus Mode enabled', {
        description: 'Other collaborator cursors are hidden.',
      });
    } else {
      toast('Focus Mode disabled', {
        description: 'Collaborator cursors are visible again.',
      });
    }
  };

  return (
    <div
      onClick={handleToggle}
      title={isZenMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
      className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-all group text-slate-400 hover:bg-white/5 hover:text-slate-200"
    >
      <span className="shrink-0 transition-colors">
        <Focus className={`w-4 h-4 transition-colors ${isZenMode ? 'text-amber-400' : 'group-hover:text-slate-300'}`} />
      </span>
      <span className="text-xs font-medium truncate">Focus Mode</span>

    </div>
  );
};

export default PresenceSettingsAction;
