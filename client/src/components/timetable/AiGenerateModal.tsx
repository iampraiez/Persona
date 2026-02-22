import React from "react";
import Modal from "../ui/Modal";
import { Sparkles, Loader2 } from "lucide-react";

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (description: string) => void;
  aiRange: { start: string; end: string };
  setAiRange: (range: { start: string; end: string }) => void;
  isGenerating: boolean;
  aiCredits: number;
}

const AiGenerateModal: React.FC<AiGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  aiRange,
  setAiRange,
  isGenerating,
  aiCredits,
}) => {
  const [description, setDescription] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onGenerate(description);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Timetable Generator">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 flex items-center gap-3 mb-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="text-xs text-foreground/80 leading-relaxed">
            Tell AI about your daily routine, work hours, or specific tasks, and it will generate an optimized schedule for you.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What's your plan?</label>
          <textarea
            className="input w-full h-32"
            placeholder="e.g., I work from 9 to 5, want to hit the gym at 6, and need 2 hours for deep work in the morning."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              className="input w-full"
              value={aiRange.start}
              onChange={(e) => setAiRange({ ...aiRange, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              className="input w-full"
              value={aiRange.end}
              onChange={(e) => setAiRange({ ...aiRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-xs font-medium text-foreground/60">
            Credits: <span className="text-accent">{aiCredits}/3</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn bg-secondary hover:bg-secondary/90"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-accent flex items-center gap-2"
              disabled={isGenerating || aiCredits <= 0}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AiGenerateModal;
