import React from "react";
import Modal from "../ui/Modal";
import { Copy, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface CopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  range: { start: string; end: string };
  setRange: (range: { start: string; end: string }) => void;
  targetStart: string;
  setTargetStart: (date: string) => void;
  isCopying: boolean;
}

export const CopyModal: React.FC<CopyModalProps> = ({
  isOpen,
  onClose,
  onCopy,
  range,
  setRange,
  targetStart,
  setTargetStart,
  isCopying,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Copy Events">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/70">
            Source Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="input w-full"
              value={range.start}
              onChange={(e) => setRange({ ...range, start: e.target.value })}
            />
            <input
              type="date"
              className="input w-full"
              value={range.end}
              onChange={(e) => setRange({ ...range, end: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/70">
            Target Start Date
          </label>
          <input
            type="date"
            className="input w-full"
            value={targetStart}
            onChange={(e) => setTargetStart(e.target.value)}
          />
          <p className="text-[10px] text-foreground/50 mt-1 italic">
            Events from source range will be mapped starting from this date.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button className="btn bg-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent flex items-center gap-2"
            onClick={onCopy}
            disabled={isCopying}
          >
            {isCopying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {isCopying ? "Copying..." : "Copy Events"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface ClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  range: { start: string; end: string };
  setRange: (range: { start: string; end: string }) => void;
  isClearing: boolean;
}

export const ClearModal: React.FC<ClearModalProps> = ({
  isOpen,
  onClose,
  onClear,
  range,
  setRange,
  isClearing,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clear Events">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-xs text-foreground/80">
            This action will permanently delete all events in the selected
            range. This cannot be undone.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/70">
            Range to Clear
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="input w-full"
              value={range.start}
              onChange={(e) => setRange({ ...range, start: e.target.value })}
            />
            <input
              type="date"
              className="input w-full"
              value={range.end}
              onChange={(e) => setRange({ ...range, end: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button className="btn bg-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn bg-destructive text-white flex items-center gap-2"
            onClick={onClear}
            disabled={isClearing}
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
