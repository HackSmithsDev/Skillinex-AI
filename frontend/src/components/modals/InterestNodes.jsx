import { PlusCircle } from 'lucide-react';

export const InterestNodes = ({ interests = [], onAdd, isEditMode }) => {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-muted pb-4">
        <h3 className="text-3xl font-black uppercase tracking-tight">System Interests</h3>
        <span className="text-caption font-black uppercase text-subtle tracking-widest">Active_Nodes: {interests.length}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {interests.map((tech, i) => (
          <span key={i} className="text-compact font-black uppercase border-2 border-primary px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all cursor-crosshair flex items-center gap-2">
            <div className="h-1 w-1 bg-success" /> {tech}
          </span>
        ))}
        {isEditMode && (
          <button onClick={onAdd} className="group flex items-center gap-2 text-compact font-black uppercase border-2 border-dashed border-line-strong px-4 py-2 text-subtle hover:border-primary hover:text-foreground transition-all">
            <PlusCircle size={14} className="group-hover:rotate-90 transition-transform" /> 
            <span>Initialize_Node</span>
          </button>
        )}
      </div>
    </section>
  );
};