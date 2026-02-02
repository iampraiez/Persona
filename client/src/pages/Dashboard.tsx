import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Loader from "../components/Loader";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  Loader2,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useUser } from "../hooks/useUser";
import { useEvents } from "../hooks/useEvents";
import { useInsights } from "../hooks/useInsights";
import { AiSuggestion, Event } from "../types/index";
import "../index.css";

const Dashboard = () => {
  const { data: user, isLoading: isUserLoading, isError, refetch } = useUser();
  const {
    suggestions,
    generateInsights,
    isGenerating,
    isError: insightsError,
  } = useInsights();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { events } = useEvents(); 

  const now = new Date();
  
  const todaysEvents = events?.filter((event: Event) => {
    const eventDate = new Date(event.startTime);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    return eventDate >= startOfDay && eventDate <= endOfDay;
  }) || [];

  const upcomingTasks = todaysEvents
    .filter((event: Event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= now;
    })
    .slice(0, 5);

  const activeGoals = user?.goals?.slice(0, 3) || [];

  const completedToday = todaysEvents.filter(t => t.isCompleted).length;
  const totalToday = todaysEvents.length;
  const dayProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-sm text-foreground/70 mt-1">
          Here's what's happening with your schedule and goals
        </p>
      </div>

      {isUserLoading ? (
        <Loader />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard data</h2>
          <p className="text-foreground/70 mb-4">
            We couldn't fetch your latest data. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-1 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Today's Schedule</h2>
              </div>
              <button 
                onClick={() => navigate("/timetable")}
                className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                title="Add Event"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {totalToday > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1 text-foreground/70">
                  <span>Day Progress</span>
                  <span>{completedToday}/{totalToday} completed</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dayProgress}%` }}
                    className="h-full bg-success rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-secondary rounded-md"
                  >
                    <div className="min-w-[40px] flex flex-col items-center">
                      <Clock className="h-5 w-5 text-accent mb-1" />
                      <span className="text-xs text-foreground/70">
                        {format(new Date(event.startTime), "HH:mm")}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{event.title}</h3>
                        {event.isSpecial && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium uppercase tracking-wider">
                            Special
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto text-sm text-foreground/60">
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/focus/${event.id}`);
                      }}
                      className="ml-2 p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
                      title="Start Focus Session"
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-md bg-secondary/30 border border-dashed border-border flex flex-col items-center text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
                  <h3 className="font-medium text-foreground/70">Your day is clear!</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enjoy your free time or plan something new.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/timetable")}
              className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
            >
              View Full Schedule
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="col-span-1 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Active Goals
              </h2>
              <span
                className="text-sm text-accent cursor-pointer"
                onClick={() => navigate("/goals")}
              >
                {activeGoals.length > 0 ? "Don't sleep on it" : "Create goals"}
              </span>
            </div>

            <div className="space-y-4">
              {activeGoals.length > 0 ? (
                activeGoals.slice(0, 4).map((goal) => {
                  const elapsedDays = Math.floor(
                    (new Date().getTime() - new Date(goal.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const daysLeft = Math.max(0, (goal.totalDays || 0) - elapsedDays);
                  
                  const roundedPercentage = (goal.percentage * 100).toFixed(1);

                  return (
                    <div key={goal.id} className="p-3 bg-secondary rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{goal.title}</h3>
                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                          {roundedPercentage}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${goal.percentage * 100}%` }}
                        ></div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-foreground/70 line-clamp-2">
                          {goal.description || "All steps completed!"}
                        </p>
                        <span className="text-xs text-foreground/50 ml-2 whitespace-nowrap">
                          {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 bg-secondary rounded-md">
                  <div className="flex justify-center items-center text-center">
                    <h3 className="font-medium">No active goals</h3>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/goals")}
              className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
            >
              View All Goals
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                AI Insights
              </h2>
              <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-1 rounded-full">
                {user?.aiCredits ?? 0}/3 Credits
              </span>
            </div>

            <div className="space-y-4">
              {(suggestions || user?.cachedInsights) && (suggestions || user?.cachedInsights)!.length > 0 ? (
                (suggestions || user?.cachedInsights)!
                  .slice(0, 4)
                  .map((suggestion: AiSuggestion, index: number) => (
                    <div key={index} className="p-3 bg-secondary rounded-md">
                      <div className="flex items-start gap-3">
                        {suggestion.type === "schedule" && (
                          <Calendar className="h-5 w-5 text-accent shrink-0" />
                        )}
                        {suggestion.type === "goal" && (
                          <Target className="h-5 w-5 text-accent shrink-0" />
                        )}
                        {suggestion.type === "focus" && (
                          <Activity className="h-5 w-5 text-accent shrink-0" />
                        )}
                        <p className="text-sm text-foreground/70">
                          {suggestion.message}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-3 bg-secondary rounded-md">
                  <div className="flex justify-center items-center text-center">
                    <h3 className="font-medium">No AI insights</h3>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (
                  (!user?.events || user.events.length === 0) &&
                  (!user?.goals || user.goals.length === 0)
                ) {
                  toast.info("Add some events or goals first to generate insights!");
                  return;
                }
                if (insightsError) {
                  toast.error("Failed to generate insights. Please try again.");
                  return;
                }
                generateInsights();
              }}
              disabled={isGenerating || (user?.aiCredits || 0) <= 0}
              className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin inline-block" />
              ) : (user?.aiCredits || 0) <= 0 ? (
                "Daily Limit Reached"
              ) : (
                "Generate Insights"
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1 md:col-span-2 lg:col-span-3 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Weekly Summary</h2>
              <span className="text-sm text-foreground/70">
                {format(new Date(), "MMMM d, yyyy")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Events Completed</h3>
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {user?.weeklySummary?.completedEvents || 0}/
                  {user?.weeklySummary?.totalEvents || 0}
                </p>
                <p className="text-xs text-foreground/70 mt-1">
                  {(user?.weeklySummary?.totalEvents || 0) > 0
                    ? (
                        ((user?.weeklySummary?.completedEvents || 0) /
                          (user?.weeklySummary?.totalEvents || 1)) *
                        100
                      ).toFixed(0)
                    : 0}
                  % completion rate
                </p>
              </div>

              <div className="bg-secondary p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Special Events</h3>
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {user?.weeklySummary?.specialEvents || 0}
                </p>
                <p className="text-xs text-foreground/70 mt-1">
                  {(user?.weeklySummary?.specialEvents || 0) > 0
                    ? `${user?.weeklySummary?.specialEvents} this week`
                    : "No special events"}
                </p>
              </div>

              <div className="bg-secondary p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Goal Progress</h3>
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {user?.weeklySummary?.aggregateGoalProgress || 0}%
                </p>
                <p className="text-xs text-foreground/70 mt-1">
                  On track for completion
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
