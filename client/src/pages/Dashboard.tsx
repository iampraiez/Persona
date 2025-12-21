import { useEffect, useState, useRef, Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  Loader2,
  InfoIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import runDailyNotifications from "../store/notis.store";
import axios from "axios";
import { API_URL } from "../config";
import "../index.css";

interface Step {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  goalId: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  createdAt: string;
  userId: string;
  steps: Step[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  skippedReason: string | null;
  skippedIsImportant: boolean;
  isSpecial: boolean;
  userId: string;
}

interface AiSuggestion {
  message: string;
  type: "schedule" | "goal" | "focus";
}

interface GoalProgress {
  id: string;
  name: string;
  progress: string;
}

// Simple Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [goalProgressData, setGoalProgressData] = useState<GoalProgress[]>([]);
  const [weeklyCompletionData, setWeeklyCompletionData] = useState<Task[]>([]);
  const [specialEventsData, setSpecialEventsData] = useState<Task[]>([]);
  const [upcoming, setUpcoming] = useState<Task[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const hasFetched = useRef(false);
  const notificationIntervalRef = useRef(null);

  function getThisWeekTasks(tasks: Task[]) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 8); // Should be +7 for a week
    endOfWeek.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      const startTime = new Date(task.startTime);
      return startTime >= startOfWeek && startTime < endOfWeek;
    });
  }

  const sortStepsByTitleNumber = (steps: Step[]) => {
    return [...steps].sort((a, b) => {
      const getNumber = (title: string) => {
        const match = title.match(/\d+/);
        return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
      };
      return getNumber(a.title) - getNumber(b.title);
    });
  };

  function getWeekToDateTasks(tasks: Task[]) {
    const now = new Date();

    // Start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // End date = today at 23:59:59
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      const startTime = new Date(task.startTime);
      return startTime >= startOfWeek && startTime <= endOfToday;
    });
  }

  useEffect(() => {
    async function getEvents() {
      try {
        const { data } = await axios.get<Task[]>(`${API_URL}/api/events`);
        const week = getThisWeekTasks(data);
        setWeeklyCompletionData(
          getWeekToDateTasks(week).filter((task) => task.isCompleted)
        );
        setTotalEvents(getWeekToDateTasks(week).length);
        setSpecialEventsData(week.filter((task) => task.isSpecial));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }
    getEvents();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("insights")) {
      setSuggestions(JSON.parse(localStorage.getItem("insights") as string));
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    async function getEvents() {
      try {
        const { data } = await axios.get<Task[]>(
          `${API_URL}/api/events/upcoming`
        );
        hasFetched.current = true;

        notificationIntervalRef.current = await runDailyNotifications(data);
        // await runDailyNotifications(data);
        console.log("Data", data);
        setUpcoming(data);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    }
    getEvents();
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function getEvents() {
      try {
        const { data } = await axios.get<Goal[]>(`${API_URL}/api/goals`);
        setGoals(data);
        const arr: GoalProgress[] = data.map((goal) => {
          const completedSteps = goal.steps.filter(
            (step) => step.isCompleted
          ).length;
          return {
            id: goal.id,
            name: goal.title,
            progress: ((completedSteps / goal.steps.length) * 100).toFixed(0),
          };
        });
        setGoalProgressData(arr);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    }
    getEvents();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const percentage =
    goalProgressData.length > 0
      ? (
          goalProgressData.reduce(
            (sum, goal) => sum + parseInt(goal.progress),
            0
          ) / goalProgressData.length
        ).toFixed(1)
      : "0";

  const totalCompleted = weeklyCompletionData.length;

  async function handleGenerateInsights() {
    try {
      setGeneratingInsights(true);
      const { data } = await axios.get<AiSuggestion[]>(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/ai/suggestions`
      );
      setSuggestions(data);
      localStorage.setItem("insights", JSON.stringify(data));
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setGeneratingInsights(false);
    }
  }

  return (
    <ErrorBoundary>
      <div>
        <h1 className="text-2xl font-bold mb-6">
          Dashboard
        </h1>

        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-lg bg-card animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-1 bg-card rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Today's Schedule
                </h2>
                <span className="text-sm text-foreground/70">
                  {format(new Date(), "EEEE, MMMM d")}
                </span>
              </div>

              <div className="space-y-4">
                {upcoming.length > 0 ? (
                  upcoming.slice(0, 4).map((event) => (
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
                        <h3 className="font-medium">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-foreground/70 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto text-sm text-foreground/60">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-md bg-secondary">
                    <div className="flex justify-center items-center text-center">
                      <h3 className="font-medium">
                        No active events
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/auths/timetable")}
                className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
              >
                View Full Schedule
              </button>
            </motion.div>

            {/* Active Goals */}
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
                  onClick={() => navigate("/auths/goals")}
                >
                  {goals.length > 0 ? "Don't sleep on it" : "Create goals"}
                </span>
              </div>

              <div className="space-y-4">
                {goals.length > 0 ? (
                  goals.slice(0, 4).map((goal) => {
                    const completedSteps = goal.steps.filter(
                      (step: Step) => step.isCompleted
                    ).length;
                    const progressPercentage = Math.round(
                      (completedSteps / goal.steps.length) * 100
                    );

                    return (
                      <div
                        key={goal.id}
                        className="p-3 bg-secondary rounded-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">
                            {goal.title}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                            {progressPercentage}%
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>

                        <div className="mt-3 text-sm text-foreground/70">
                          {sortStepsByTitleNumber(goal.steps).find(
                            (step) => !step.isCompleted
                          )?.title || "All steps completed!"}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 bg-secondary rounded-md">
                    <div className="flex justify-center items-center text-center">
                      <h3 className="font-medium">
                        No active goals
                      </h3>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/auths/goals")}
                className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
              >
                View All Goals
              </button>
            </motion.div>

            {/* AI Insights */}
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
              </div>

              <div className="space-y-4">
                {suggestions.length > 0 ? (
                  suggestions.slice(0, 4).map((suggestion, index) => (
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
                        {/* {suggestion.type === "description" && (
                          <InfoIcon className="h-5 w-5 text-accent shrink-0" />
                        )} */}
                        <p className="text-sm text-foreground/70">
                          {suggestion.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-secondary rounded-md">
                    <div className="flex justify-center items-center text-center">
                      <h3 className="font-medium">
                        No AI insights
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerateInsights}
                className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
              >
                {generatingInsights ? (
                  <Loader2 className="w-5 h-5 animate-spin inline-block" />
                ) : (
                  "Generate Insights"
                )}
              </button>
            </motion.div>

            {/* Weekly Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="col-span-1 md:col-span-2 lg:col-span-3 bg-card rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Weekly Summary
                </h2>
                <span className="text-sm text-foreground/70">
                  {format(new Date(), "MMMM d, yyyy")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Events Completed
                    </h3>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {totalCompleted}/{totalEvents}
                  </p>
                  <p className="text-xs text-foreground/70 mt-1">
                    {totalEvents > 0
                      ? ((totalCompleted / totalEvents) * 100).toFixed(0)
                      : 0}
                    % completion rate
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Special Events
                    </h3>
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {specialEventsData.length}
                  </p>
                  <p className="text-xs text-foreground/70 mt-1">
                    {specialEventsData.length > 0
                      ? `${specialEventsData.length} this week`
                      : "No special events"}
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Goal Progress
                    </h3>
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {/* {Math.round(percentage)}% */}
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
    </ErrorBoundary>
  );
};

export default Dashboard;
