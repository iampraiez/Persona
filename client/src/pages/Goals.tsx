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
