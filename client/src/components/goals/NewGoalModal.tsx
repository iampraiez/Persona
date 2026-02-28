import React from "react";
import { Goal } from "../../types";
import { X, Loader2 } from "lucide-react";
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-card rounded-xl p-8 w-full max-w-md md:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {newGoal.id ? "Edit Goal" : "New Goal"}
              </h2>
              <button
                className="p-1 rounded-full hover:bg-secondary"
                onClick={onClose}
              >
                <X className="h-5 w-5 text-foreground/70" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="input w-full h-24"
                  placeholder="Describe your goal in detail"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Frame (days)
                </label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="30"
                  min="1"
                  value={newGoal.totalDays?.toString() || ""}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      totalDays: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                />
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Steps</h3>
                <p className="text-xs text-foreground/70 mb-4">
                  You can define your own steps or let the AI generate steps for
                  you.
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">
                      Step Count
                    </label>
                    <input
                      type="number"
                      className="input w-full text-sm"
                      min="1"
                      max="30"
                      value={stepCount}
                      onChange={(e) =>
                        onStepCountChange(Number(e.target.value))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    disabled={generatingSteps}
                    className="flex-[2] btn bg-accent/10 text-accent hover:bg-accent/20 mt-5 disabled:opacity-50 flex justify-center items-center"
                    onClick={() =>
                      onGenerateSteps(
                        newGoal.title || newGoal.description || "",
                        newGoal.totalDays || 0,
                        stepCount,
                      )
                    }
                  >
                    {generatingSteps ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {generatingSteps ? "Generating..." : "Generate Steps"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button
                  type="button"
                  className="btn bg-secondary hover:bg-secondary/80"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent flex items-center justify-center gap-2"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {newGoal.id ? "Update Goal" : "Create Goal"}
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
