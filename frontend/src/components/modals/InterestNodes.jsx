import { PlusCircle } from 'lucide-react';

export const InterestNodes = ({ interests = [], onAdd, isEditMode }) => {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-3xl font-black uppercase tracking-tight">System Interests</h3>
        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Active_Nodes: {interests.length}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {interests.map((tech, i) => (
          <span key={i} className="text-[10px] font-black uppercase border-2 border-slate-900 px-4 py-2 hover:bg-slate-900 hover:text-white transition-all cursor-crosshair flex items-center gap-2">
            <div className="h-1 w-1 bg-emerald-500" /> {tech}
          </span>
        ))}
        {isEditMode && (
          <button onClick={onAdd} className="group flex items-center gap-2 text-[10px] font-black uppercase border-2 border-dashed border-slate-300 px-4 py-2 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all">
            <PlusCircle size={14} className="group-hover:rotate-90 transition-transform" /> 
            <span>Initialize_Node</span>
          </button>
        )}
      </div>
    </section>
  );
};