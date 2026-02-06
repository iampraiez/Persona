import { useEffect, useState, useRef } from "react";
import { format, differenceInDays } from "date-fns";
import {
  Clock,
  Plus,
  Check,
  X,
  MoreHorizontal,
  ChevronRight,
  RotateCcw,
  Pencil,
  Trash,
  Loader2,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Step } from "../types";
import { toast } from "react-toastify";
import { useGoals } from "../hooks/useGoals";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";

const Goals: React.FC = () => {
  const {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    isLoading,
    updateStepStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStep,
  } = useGoals();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState<string | null>(null);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [stepCount, setStepCount] = useState<number>(10);
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    totalDays: 0,
    createdAt: new Date().toISOString(),
    userId: "",
    steps: [],
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOptionsModalOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setOptionsModalOpen]);

  const handleReset = async (id: string) => {
    const goal = goals?.find((g: Goal) => g.id === id);
    if (!goal) return;

    const updatedSteps = (goal.steps || []).map((step: Step) => ({
      ...step,
      isCompleted: false,
      skippedIsImportant: false,
      skippedReason: null,
    }));

    updateGoal(
      { id, goal: { steps: updatedSteps } },
      {
        onSuccess: () => {
          setExpandedGoal(null);
          setOptionsModalOpen(null);
          toast.success("Goal reset successfully");
        },
        onError: () => {
          toast.error("Failed to reset goal");
        },
      }
    );
  };

  const handleEdit = (id: string) => {
    const goal = goals?.find((g: Goal) => g.id === id);
    if (goal) {
      setNewGoal(goal);
      setShowNewGoalModal(true);
      setExpandedGoal(null);
      setOptionsModalOpen(null);
    } else {
      toast.error("Goal not found");
    }
  };

  const handleDelete = async (id: string) => {
    deleteGoal(id, {
      onSuccess: () => {
        setExpandedGoal(null);
        setOptionsModalOpen(null);
        toast.success("Goal deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete goal");
      },
    });
  };

  const completeStep = async (stepId: string) => {
    const goal = goals?.find((g: Goal) =>
      (g.steps || []).some((s: Step) => s.id === stepId)
    );
    if (!goal) return;

    updateStepStatus(
      { goalId: goal.id, stepId },
      {
        onSuccess: () => {
          toast.success("Step marked as complete");
        },
        onError: () => {
          toast.error("Failed to mark step as complete");
        },
      }
    );
  };

  const addStep = () => {
    setNewGoal((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `${prev.steps.length + 1}`,
          title: "",
          description: "",
          dueDate: new Date().toISOString(),
          isCompleted: false,
        },
      ],
    }));
  };

  const removeStep = (index: number) => {
    setNewGoal((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = <K extends keyof Step>(
    index: number,
    field: K,
    value: Step[K]
  ) => {
    setNewGoal((prev) => {
      const updatedSteps = [...prev.steps]; 
      let finalValue = value;
      if (field === "dueDate" && typeof value === "string") {
        finalValue = new Date(value).toISOString() as Step[K];
      }
      updatedSteps[index] = { ...updatedSteps[index], [field]: finalValue };
      return { ...prev, steps: updatedSteps };
    });
  };

  const sortStepsByTitleNumber = (steps: Step[]) => {
    return [...steps].sort((a, b) => {
      const getNumber = (title: string) => {
        const match = title.match(/\d+/);
        return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
      };

      return getNumber(a.title) - getNumber(b.title);
    });
  };

  const formatDateToYMD = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const convertYMDToISOString = (ymdString: string): string => {
    try {
      const date = new Date(`${ymdString}T00:00:00Z`);
      return isNaN(date.getTime())
        ? new Date().toISOString()
        : date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.totalDays) {
      toast.error("Please fill out goal title and valid time frame");
      return;
    }

    createGoal(newGoal, {
      onSuccess: () => {
        setShowNewGoalModal(false);
        setNewGoal({
          id: "",
          title: "",
          description: "",
          totalDays: 0,
          createdAt: new Date().toISOString(),
          userId: "",
          steps: [],
        });
        toast.success("Goal created successfully");
      },
      onError: () => {
        toast.error("Failed to create goal");
      },
    });
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.id || !newGoal.title || (newGoal.totalDays || 0) <= 0) {
      toast.error("Please fill out goal title and valid time frame");
      return;
    }

    // Only send fields that should be updated
    const updateData: Partial<Goal> = {
      title: newGoal.title,
      description: newGoal.description,
      totalDays: newGoal.totalDays,
      steps: newGoal.steps.map((s) => ({
        ...s,
        dueDate: new Date(s.dueDate).toISOString(),
      })),
    };

    updateGoal(
      { id: newGoal.id.toString(), goal: updateData },
      {
        onSuccess: () => {
          setShowNewGoalModal(false);
          setNewGoal({
            id: "",
            title: "",
            description: "",
            totalDays: 0,
            createdAt: new Date().toISOString(),
            userId: "",
            steps: [],
          });
          toast.success("Goal updated successfully");
        },
        onError: () => {
          toast.error("Failed to update goal");
        },
      }
    );
  };

  useEffect(() => {
    if (newGoal.steps.length !== stepCount) {
      setStepCount(newGoal.steps.length || 1);
    }
  }, [newGoal.steps.length, stepCount]);

  const handleStepCountChange = (count: number) => {
    setStepCount(count);
    setNewGoal((prev) => {
      const currentSteps = [...prev.steps];
      if (count > currentSteps.length) {
        const stepsToAdd = count - currentSteps.length;
        for (let i = 0; i < stepsToAdd; i++) {
          currentSteps.push({
            id: `${currentSteps.length + 1 + i}`,
            title: "",
            description: "",
            dueDate: new Date().toISOString(),
            isCompleted: false,
          });
        }
      } else if (count < currentSteps.length) {
        currentSteps.splice(count);
      }
      return { ...prev, steps: currentSteps };
    });
  };

  const generateSteps = async (
    goal: string,
    days: number,
    stepCount: number
  ) => {
    if (!goal.trim() || days <= 0 || stepCount <= 0) {
      toast.error("Please provide a goal, valid time frame, and step count");
      return;
    }
    try {
      setGeneratingSteps(true);
      const getApi = () => (useAuthStore.getState().isDemo ? demoApi : api);
      
      const currentSteps = newGoal.steps.map(({ title, description }) => ({
        title,
        description,
      }));

      const data = await getApi().generateSteps(
        { title: goal, description: newGoal.description },
        days,
        stepCount,
        currentSteps
      );

      const editedSteps = data.steps.map(({ dueDate, ...rest }) => ({
        ...rest,
        dueDate: new Date(dueDate as string).toISOString(),
      }));
      setNewGoal((prev) => ({
        ...prev,
        steps: editedSteps.map((step) => ({
          ...step,
          dueDate: new Date(step.dueDate).toISOString(),
          id: `${prev.steps.length + 1}`, 
          isCompleted: false,
        })),
      }));

      toast.success("Steps generated successfully");
    } catch {
      toast.error("Error generating steps");
    } finally {
      setGeneratingSteps(false);
    }
  };

  const toggleExpandGoal = (goalId: string | null) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
    setOptionsModalOpen(null);
  };

  const toggleExpandOption = (optId: string | null) => {
    setOptionsModalOpen(optionsModalOpen === optId ? null : optId);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" ref={modalRef}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold">Goals</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-accent flex items-center gap-2"
          onClick={() => setShowNewGoalModal(true)}
        >
          <Plus className="h-5 w-5" />
          New Goal
        </motion.button>
      </motion.div>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
        className="grid gap-6 grid-cols-1"
      >
        {goals && goals.length > 0 ? (
          goals.map((goal: Goal) => {
            const isExpanded = expandedGoal === goal.id;
            const isOpened = optionsModalOpen === goal.id;
            const steps = goal.steps || [];
            const completedSteps = steps.filter(
              (step) => step.isCompleted,
            ).length;
            const progressPercentage =
              steps.length > 0
                ? Math.round((completedSteps / steps.length) * 100)
                : 0;
            const elapsedDays = differenceInDays(
              new Date(),
              new Date(goal.createdAt),
            );
            if (!goal.totalDays) return;

            const remainingDays = goal.totalDays - elapsedDays;
            const timePercentage = Math.min(
              100,
              Math.round((elapsedDays / goal.totalDays) * 100),
            );

            return (
              <motion.div
                key={goal.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/50 hover:border-accent/30 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{goal.title}</h2>
                      <p className="text-foreground/70 mt-1">
                        {goal.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                        {progressPercentage}%
                      </span>
                      <div className="relative">
                        <button className="p-2 rounded-full hover:bg-secondary">
                          <MoreHorizontal
                            onClick={() => {
                              toggleExpandOption(`${goal.id}`);
                            }}
                            className="h-5 w-5 text-foreground/70"
                          />
                        </button>
                        <AnimatePresence>
                          {isOpened && (
                            <motion.div
                              ref={dropdownRef}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute right-0 mt-2 w-44 bg-card rounded-md shadow-lg z-50 border border-border"
                            >
                              <button
                                onClick={() => handleReset(`${goal.id}`)}
                                disabled={isUpdating}
                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-secondary rounded-md disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                )}
                                Reset Goal
                              </button>
                              <button
                                onClick={() => handleEdit(`${goal.id}`)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-secondary rounded-md"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Goal
                              </button>
                              <button
                                onClick={() => handleDelete(`${goal.id}`)}
                                disabled={isDeleting}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive hover:bg-secondary rounded-md disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4 mr-2" />
                                )}
                                Delete Goal
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-foreground/70">
                        <span>Progress</span>
                        <span>
                          {completedSteps}/{(goal.steps || []).length} steps
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-accent rounded-full"
                        ></motion.div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1 text-foreground/70">
                        <span>Time</span>
                        <span>
                          {remainingDays > 0
                            ? `${remainingDays} days left`
                            : "Deadline passed"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${timePercentage}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2,
                          }}
                          className={`h-full rounded-full ${
                            timePercentage > 75
                              ? "bg-destructive"
                              : timePercentage > 50
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                        ></motion.div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full mt-4 flex items-center justify-center p-2 text-sm rounded-md bg-secondary hover:bg-secondary/80"
                    onClick={() =>
                      toggleExpandGoal(isExpanded ? null : `${goal.id}`)
                    }
                  >
                    <span>{isExpanded ? "Hide Steps" : "Show Steps"}</span>
                    <ChevronRight
                      className={`h-4 w-4 ml-1 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-secondary/50 border-t border-border px-6 py-4"
                  >
                    <h3 className="text-sm font-medium mb-4">Steps</h3>
                    <div className="space-y-3">
                      {(goal.steps || []).length > 0 ? (
                        sortStepsByTitleNumber(goal.steps || []).map(
                          (step: Step, index: number) => (
                            <div
                              key={step.id}
                              className={`p-3 rounded-md flex items-start gap-3 ${
                                step.isCompleted
                                  ? "bg-success/20"
                                  : "bg-secondary"
                              }`}
                            >
                              <motion.div
                                className="flex-shrink-0 mt-0.5"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {step.isCompleted ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
                                  >
                                    <Check className="h-3 w-3 text-success-foreground" />
                                  </motion.div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-xs">
                                    {index + 1}
                                  </div>
                                )}
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4
                                      className={`font-medium ${
                                        step.isCompleted
                                          ? "line-through opacity-70"
                                          : ""
                                      }`}
                                    >
                                      {step.title}
                                    </h4>
                                    {step.description && (
                                      <p className="text-sm text-foreground/70 mt-1">
                                        {step.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center text-xs text-foreground/70">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>
                                      {format(new Date(step.dueDate), "MMM d")}
                                    </span>
                                  </div>
                                </div>
                                {!step.isCompleted && (
                                  <div className="mt-2">
                                    <button
                                      onClick={() => completeStep(step.id)}
                                      disabled={isUpdatingStep}
                                      className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50"
                                    >
                                      {isUpdatingStep ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : null}
                                      {isUpdatingStep
                                        ? "Updating..."
                                        : "Mark Complete"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="p-4 bg-secondary rounded-md text-center text-muted-foreground">
                          <p>No steps defined for this goal yet.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-xl bg-card border-2 border-dashed border-border text-center"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No goals found</h3>
            <p className="text-foreground/60 mb-6 max-w-sm mx-auto">
              You haven't set any goals yet. Start by creating a new goal and
              let AI help you break it down!
            </p>
            <button
              className="btn btn-accent"
              onClick={() => setShowNewGoalModal(true)}
            >
              Create Your First Goal
            </button>
          </motion.div>
        )}
      </motion.div>
      <AnimatePresence>
        {showNewGoalModal && (
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
                  onClick={() => {
                    setShowNewGoalModal(false);
                    setNewGoal({
                      id: "",
                      title: "",
                      description: "",
                      totalDays: 0,
                      createdAt: new Date().toISOString(),
                      userId: "",
                      steps: [],
                    });
                  }}
                >
                  <X className="h-5 w-5 text-foreground/70" />
                </button>
              </div>

              <form className="space-y-4">
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
                    You can define your own steps or let the AI generate steps
                    for you.
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
                          handleStepCountChange(Number(e.target.value))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      disabled={generatingSteps}
                      className="flex-[2] btn bg-accent/10 text-accent hover:bg-accent/20 mt-5 disabled:opacity-50 flex justify-center items-center"
                      onClick={() =>
                        generateSteps(
                          newGoal.title || newGoal.description || "",
                          newGoal.totalDays || 0,
                          stepCount,
                        )
                      }
                    >
                      {generatingSteps ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Generate Steps with AI"
                      )}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newGoal.steps.map((step, index) => (
                      <div key={index} className="p-3 bg-secondary rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Step {index + 1}
                          </span>
                          {newGoal.steps.length > 1 && (
                            <button
                              type="button"
                              className="text-destructive hover:text-destructive/80"
                              onClick={() => removeStep(index)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          className="input w-full text-sm mb-2"
                          placeholder={`Step ${index + 1} title`}
                          value={step.title}
                          onChange={(e) =>
                            updateStep(index, "title", e.target.value)
                          }
                        />
                        <textarea
                          className="input w-full text-sm mb-2"
                          placeholder={`Step ${index + 1} description (optional)`}
                          value={step.description}
                          onChange={(e) =>
                            updateStep(index, "description", e.target.value)
                          }
                        />
                        <input
                          type="date"
                          className="input w-full text-sm"
                          value={formatDateToYMD(step.dueDate)}
                          onChange={(e) =>
                            updateStep(
                              index,
                              "dueDate",
                              convertYMDToISOString(e.target.value),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full mt-3 p-2 text-sm rounded-md border border-dashed border-border hover:bg-secondary"
                    onClick={addStep}
                  >
                    + Add Step
                  </button>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="submit"
                    className="btn btn-accent disabled:opacity-50 flex items-center gap-2"
                    disabled={isCreating || isUpdating}
                    onClick={(e) =>
                      newGoal.id ? handleUpdateGoal(e) : handleCreateGoal(e)
                    }
                  >
                    {isCreating || isUpdating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{isCreating ? "Creating..." : "Updating..."}</span>
                      </>
                    ) : newGoal.id ? (
                      "Update Goal"
                    ) : (
                      "Create Goal"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;
