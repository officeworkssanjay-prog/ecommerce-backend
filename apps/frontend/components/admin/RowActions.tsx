import { Pencil, Trash2 } from "lucide-react";

/** Edit / delete icon buttons with accessible names, for the last column of a table. */
export function RowActions({ name, onEdit, onDelete }: { name: string; onEdit: () => void; onDelete?: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={onEdit} aria-label={`Edit ${name}`} className="rounded p-2 text-ink/70 hover:bg-parchment hover:text-gold-dark">
        <Pencil className="h-4 w-4" aria-hidden />
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label={`Delete ${name}`} className="rounded p-2 text-danger hover:bg-danger/10">
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Clickable status pill: toggles the record's enabled state. */
export function StatusToggle({ active, name, onToggle }: { active: boolean; name: string; onToggle: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${name} is ${active ? "enabled" : "disabled"}. Toggle`}
      onClick={() => onToggle(!active)}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? "bg-success/15 text-success" : "bg-ink/10 text-ink/60"}`}
    >
      {active ? "Active" : "Disabled"}
    </button>
  );
}
