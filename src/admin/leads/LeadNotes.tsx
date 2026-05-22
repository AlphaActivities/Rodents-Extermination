import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, X, Check, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── types ─────────────────────────────────────────────────────

export interface LeadNote {
  id: string;
  lead_id: number;
  body: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── helpers ───────────────────────────────────────────────────

function formatNoteDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function wasEdited(note: LeadNote): boolean {
  return (
    Math.abs(new Date(note.updated_at).getTime() - new Date(note.created_at).getTime()) > 3000
  );
}

// ── NoteEditor ────────────────────────────────────────────────

interface NoteEditorProps {
  initialBody?: string;
  onSave: (body: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  saveError: string | null;
}

function NoteEditor({ initialBody = '', onSave, onCancel, saving, saveError }: NoteEditorProps) {
  const [body, setBody] = useState(initialBody);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="db-note-editor">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a note about this lead…"
        className="db-note-textarea"
        rows={4}
        disabled={saving}
        aria-label="Note text"
      />

      {saveError && (
        <div
          className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg mt-2"
          style={{
            color: 'var(--db-error)',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          {saveError}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="db-btn-primary flex items-center gap-1.5"
          style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', minHeight: '32px' }}
        >
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />Saving…</>
          ) : (
            <><Check className="w-3.5 h-3.5" aria-hidden="true" />Save note</>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="db-btn-ghost flex items-center gap-1.5"
          style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', minHeight: '32px' }}
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── NoteItem ──────────────────────────────────────────────────

interface NoteItemProps {
  note: LeadNote;
  onUpdate: (id: string, body: string) => Promise<void>;
}

function NoteItem({ note, onUpdate }: NoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = useCallback(async (body: string) => {
    setSaving(true);
    setSaveError(null);
    try {
      await onUpdate(note.id, body);
      setEditing(false);
      setToast('Note updated');
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update note.');
    }
    setSaving(false);
  }, [note.id, onUpdate]);

  const edited = wasEdited(note);

  if (editing) {
    return (
      <NoteEditor
        initialBody={note.body}
        onSave={handleSave}
        onCancel={() => { setEditing(false); setSaveError(null); }}
        saving={saving}
        saveError={saveError}
      />
    );
  }

  return (
    <div className="db-note-item" role="article">
      {/* Note body */}
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: 'var(--db-text-1)' }}
      >
        {note.body}
      </p>

      {/* Footer: timestamps + edit */}
      <div className="flex items-center justify-between gap-2 mt-2.5 flex-wrap">
        <div className="text-xs" style={{ color: 'var(--db-text-3)' }}>
          <span>Admin · {formatNoteDate(note.created_at)}</span>
          {edited && (
            <span style={{ color: 'var(--db-text-3)' }}>
              {' · edited {}'.replace('{}', formatNoteDate(note.updated_at))}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="db-note-edit-btn flex items-center gap-1 text-xs"
          aria-label="Edit note"
        >
          <Pencil className="w-3 h-3" aria-hidden="true" />
          Edit
        </button>
      </div>

      {toast && (
        <div
          className="mt-2 text-xs font-medium"
          style={{ color: 'var(--db-success)' }}
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ── LeadNotes (main export) ───────────────────────────────────

interface Props {
  leadId: number;
  leadCreatedAt: string;
  leadStatus: string;
}

export default function LeadNotes({ leadId, leadCreatedAt, leadStatus }: Props) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createToast, setCreateToast] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('lead_notes')
      .select('id, lead_id, body, created_by, created_at, updated_at')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
    if (error) {
      setLoadError('Could not load notes.');
    } else {
      setNotes((data as LeadNote[]) ?? []);
    }
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = useCallback(async (body: string) => {
    setCreateSaving(true);
    setCreateError(null);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('lead_notes')
      .insert({ lead_id: leadId, body, created_by: user?.id ?? null })
      .select('id, lead_id, body, created_by, created_at, updated_at')
      .single();

    if (error || !data) {
      setCreateError('Failed to save note. Please try again.');
    } else {
      setNotes((prev) => [...prev, data as LeadNote]);
      setAdding(false);
      setCreateToast('Note saved');
      setTimeout(() => setCreateToast(null), 2500);
    }
    setCreateSaving(false);
  }, [leadId]);

  const handleUpdate = useCallback(async (id: string, body: string) => {
    const { data, error } = await supabase
      .from('lead_notes')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, lead_id, body, created_by, created_at, updated_at')
      .single();

    if (error || !data) throw new Error('Failed to update note.');
    setNotes((prev) => prev.map((n) => (n.id === id ? (data as LeadNote) : n)));
  }, []);

  return (
    <div>
      {/* ── Timeline header ──────────────────────────── */}
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--db-text-3)' }}
      >
        Customer Timeline
      </div>

      {/* ── Timeline list ────────────────────────────── */}
      <div className="db-timeline">

        {/* Lead submitted event — always first */}
        <div className="db-timeline-event db-timeline-event--system">
          <div className="db-timeline-dot db-timeline-dot--system" aria-hidden="true" />
          <div className="db-timeline-content">
            <span className="db-timeline-label" style={{ color: 'var(--db-text-2)' }}>
              Lead submitted via Website Contact Form
            </span>
            <span className="db-timeline-time">{formatNoteDate(leadCreatedAt)}</span>
          </div>
        </div>

        {/* Current status marker */}
        <div className="db-timeline-event db-timeline-event--status">
          <div className="db-timeline-dot db-timeline-dot--status" aria-hidden="true" />
          <div className="db-timeline-content">
            <span className="db-timeline-label" style={{ color: 'var(--db-text-2)' }}>
              Status: <strong style={{ color: 'var(--db-text-1)' }}>{leadStatus.charAt(0).toUpperCase() + leadStatus.slice(1)}</strong>
            </span>
          </div>
        </div>

        {/* Notes load error */}
        {loadError && (
          <div
            className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg my-2"
            style={{
              color: 'var(--db-error)',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.16)',
            }}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {loadError}
            <button
              type="button"
              onClick={fetchNotes}
              className="underline ml-1 hover:opacity-80"
              style={{ color: 'var(--db-error)' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Notes loading skeleton */}
        {loading && !loadError && (
          <div className="space-y-3 py-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-12 rounded-xl animate-pulse"
                style={{ background: 'var(--db-elevated)', opacity: 0.7 - i * 0.1 }}
              />
            ))}
          </div>
        )}

        {/* Saved notes */}
        {!loading && notes.map((note) => (
          <div key={note.id} className="db-timeline-event db-timeline-event--note">
            <div className="db-timeline-dot db-timeline-dot--note" aria-hidden="true" />
            <div className="db-timeline-content w-full min-w-0">
              <NoteItem note={note} onUpdate={handleUpdate} />
            </div>
          </div>
        ))}

        {/* Create toast */}
        {createToast && (
          <div
            className="text-xs font-medium py-1 px-2"
            style={{ color: 'var(--db-success)' }}
            role="status"
          >
            {createToast}
          </div>
        )}

        {/* Add note editor inline */}
        {adding && (
          <div className="db-timeline-event db-timeline-event--note">
            <div className="db-timeline-dot db-timeline-dot--new" aria-hidden="true" />
            <div className="db-timeline-content w-full min-w-0">
              <NoteEditor
                onSave={handleCreate}
                onCancel={() => { setAdding(false); setCreateError(null); }}
                saving={createSaving}
                saveError={createError}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Add note button ───────────────────────────── */}
      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="db-add-note-btn flex items-center gap-2 mt-3 text-sm font-medium w-full"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          Add note
          <MessageSquare className="w-3.5 h-3.5 ml-auto opacity-40" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
