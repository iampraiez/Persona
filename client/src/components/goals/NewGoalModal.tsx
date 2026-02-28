import React from "react";
import { Goal } from "../../types";
import { X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  newGoal: Goal;
  setNewGoal: React.Dispatch<React.SetStateAction<Goal>>;
  stepCount: number;
  onStepCountChange: (count: number) => void;
  onGenerateSteps: (title: string, days: number, count: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
  isUpdating: boolean;
  generatingSteps: boolean;
}

const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  onClose,
  newGoal,
  setNewGoal,
  stepCount,
  onStepCountChange,
  onGenerateSteps,
  onSubmit,
  isCreating,
  isUpdating,
  generatingSteps,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-border scrollbar-hide"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {newGoal.id ? "Edit Your Goal" : "Design a New Goal"}
              </h2>
              <button
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                onClick={onClose}
              >
                <X className="h-6 w-6 text-foreground/40" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground/40 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    className="input w-full bg-secondary/30 border-none ring-1 ring-border focus:ring-2 focus:ring-accent transition-all"
                    placeholder="e.g., Master Advanced TypeScript"
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground/40 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    className="input w-full h-24 bg-secondary/30 border-none ring-1 ring-border focus:ring-2 focus:ring-accent transition-all resize-none"
                    placeholder="Help the AI understand the scope of your goal..."
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider text-foreground/40 mb-2">
                      Timeframe (Days)
                    </label>
                    <input
                      type="number"
                      className="input w-full bg-secondary/30 border-none ring-1 ring-border"
                      placeholder="30"
                      min="1"
                      value={newGoal.totalDays || ""}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          totalDays: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider text-foreground/40 mb-2">
                      Target Steps
                    </label>
                    <input
                      type="number"
                      className="input w-full bg-secondary/30 border-none ring-1 ring-border"
                      placeholder="7"
                      min="1"
                      max="30"
                      value={stepCount || ""}
                      onChange={(e) =>
                        onStepCountChange(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-accent/5 rounded-2xl p-6 border border-accent/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-accent mb-1">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-foreground/60">
                      Generate a structured roadmap automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={generatingSteps}
                    className="btn btn-accent px-6 flex items-center gap-2 shrink-0 disabled:opacity-50"
                    onClick={() =>
                      onGenerateSteps(
                        newGoal.title,
                        newGoal.totalDays || 0,
                        stepCount,
                      )
                    }
                  >
                    {generatingSteps ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generatingSteps ? "Analyzing..." : "Generate Roadmap"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="btn bg-secondary hover:bg-secondary/80 px-8"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent px-10 shadow-lg shadow-accent/25"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {newGoal.id ? "Save Changes" : "Create Goal"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewGoalModal;
