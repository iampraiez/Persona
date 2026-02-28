import { Plus, Loader2, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useGoalsPage } from "../hooks/useGoalsPage";
import GoalCard from "../components/goals/GoalCard";
import NewGoalModal from "../components/goals/NewGoalModal";

const Goals: React.FC = () => {
  const {
    goals,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStep,

    showNewGoalModal,
    setShowNewGoalModal,
    expandedGoal,
    optionsModalOpen,
    generatingSteps,
    stepCount,
    newGoal,
    setNewGoal,

    handleReset,
    handleEdit,
    handleDelete,
    completeStep,
    handleCreateGoal,
    handleUpdateGoal,
    handleStepCountChange,
    generateSteps,
    toggleExpandGoal,
    toggleExpandOption,
  } = useGoalsPage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Your Goals
          </h1>
          <p className="text-foreground/40 mt-1 text-sm">
            Transform your ambitions into structured roadmaps.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-accent flex items-center gap-2 shadow-lg shadow-accent/20"
          onClick={() => setShowNewGoalModal(true)}
        >
          <Plus className="h-5 w-5" />
          Add New Goal
        </motion.button>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {goals && goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoal === goal.id}
              isOptionsOpen={optionsModalOpen === goal.id}
              onToggleExpand={() => toggleExpandGoal(goal.id)}
              onToggleOptions={() => toggleExpandOption(goal.id)}
              onReset={() => handleReset(goal.id)}
              onEdit={() => handleEdit(goal.id)}
              onDelete={() => handleDelete(goal.id)}
              onCompleteStep={completeStep}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              isUpdatingStep={isUpdatingStep}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 rounded-3xl bg-card border-2 border-dashed border-border/50 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="h-10 w-10 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No goals active</h3>
            <p className="text-foreground/40 mb-8 max-w-sm mx-auto leading-relaxed">
              Start your journey today. Create a goal and let our AI help you
              break it down into manageable steps.
            </p>
            <button
              className="btn btn-accent px-8"
              onClick={() => setShowNewGoalModal(true)}
            >
              Start Your First Goal
            </button>
          </motion.div>
        )}
      </div>

      <NewGoalModal
        isOpen={showNewGoalModal}
        onClose={() => setShowNewGoalModal(false)}
        newGoal={newGoal}
        setNewGoal={setNewGoal}
        stepCount={stepCount}
        onStepCountChange={handleStepCountChange}
        onGenerateSteps={generateSteps}
        onSubmit={newGoal.id ? handleUpdateGoal : handleCreateGoal}
        isCreating={isCreating}
        isUpdating={isUpdating}
        generatingSteps={generatingSteps}
      />
    </div>
  );
};

export default Goals;