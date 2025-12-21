import { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  BarChart as BarChartIcon,
  CheckCircle,
  Target,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  Loader2,
  InfoIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Event } from "../types/index";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "../config";

const COLORS = ["#8B5CF6", "#3B82F6", "#14B8A6", "#F97316"];

const Analytics = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [goalProgressData, setGoalProgressData] = useState<any[]>([]);
  const [weeklyCompletionData, setWeeklyCompletionData] = useState<any[]>([]);
  const [hour, setHour] = useState<any>();
  const [specialEventsData, setSpecialEventsData] = useState<any[]>([]);
  const [suggestion, setSuggestions] = useState([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);

  const startDate = startOfWeek(currentWeek);
  const endDate = endOfWeek(currentWeek);
  // const weeklyCompletionData = [
  //   { day: "Mon", completed: 5, skipped: 1 },
  //   { day: "Tue", completed: 4, skipped: 2 },
  //   { day: "Wed", completed: 6, skipped: 0 },
  //   { day: "Thu", completed: 3, skipped: 3 },
  //   { day: "Fri", completed: 5, skipped: 1 },
  //   { day: "Sat", completed: 2, skipped: 0 },
  //   { day: "Sun", completed: 1, skipped: 0 },
  // ];

  function getThisWeekTasks(tasks: Event[]) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // Should be +7 for a week
    endOfWeek.setHours(0, 0, 0, 0);

    return tasks.filter((task: any) => {
      const startTime = new Date(task.startTime);
      return startTime >= startOfWeek && startTime < endOfWeek;
    });
  }

  //filter through weekly tasks to get all tasks from the week start till current day
  function getWeekToDateTasks(tasks: Event[]) {
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

  // const goalProgressData = [
  //   { name: "Website Redesign", progress: 30 },
  //   { name: "Learn Python", progress: 15 },
  // ];

  // function getTotalHours(tasks) {
  //   return tasks.reduce((sum, task) => {
  //     if (!task.startTime || !task.endTime) return sum;

  //     const start = new Date(task.startTime);
  //     const end = new Date(task.endTime);

  //     const diffInMs = end - start;
  //     const diffInHours = diffInMs / (1000 * 60 * 60); // Convert milliseconds to hours

  //     return sum + diffInHours;
  //   }, 0);
  // }

  async function handleGenerateInsights() {
    try {
      setGeneratingInsights(true);
      const { data } = await axios.get(
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

  const totalCompleted = weeklyCompletionData.length;

  // const specialEventsData = [
  //   { name: "Business Networking", value: 3 },
  //   { name: "Learning Session", value: 4 },
  //   { name: "Family Time", value: 2 },
  //   { name: "Personal Project", value: 1 },
  // ];
  const nextWeek = () => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + 7);
    setCurrentWeek(date);
  };

  const prevWeek = () => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() - 7);
    setCurrentWeek(date);
  };

  function getTotalHours(tasks: Event[]) {
    return tasks.reduce((sum, task) => {
      if (!task.startTime || !task.endTime) return sum;

      const start = new Date(task.startTime);
      const end = new Date(task.endTime);

      const diffInMs = end - start;
      const diffInHours = diffInMs / (1000 * 60 * 60); // Convert milliseconds to hours

      return sum + diffInHours;
    }, 0);
  }

  function getWeeklyCompletionData(stepsArray: any) {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize weekly result
    const weeklyData = {
      Sun: { day: "Sun", completed: 0, skipped: 0 },
      Mon: { day: "Mon", completed: 0, skipped: 0 },
      Tue: { day: "Tue", completed: 0, skipped: 0 },
      Wed: { day: "Wed", completed: 0, skipped: 0 },
      Thu: { day: "Thu", completed: 0, skipped: 0 },
      Fri: { day: "Fri", completed: 0, skipped: 0 },
      Sat: { day: "Sat", completed: 0, skipped: 0 },
    };

    for (const step of stepsArray) {
      const date = new Date(step.startTime);
      const dayKey = dayMap[date.getUTCDay()]; // getUTCDay() gives 0-6 (Sun-Sat)

      if (step.isCompleted) {
        weeklyData[dayKey].completed++;
      }

      if (step.skippedIsImportant) {
        weeklyData[dayKey].skipped++;
      }
    }

    return Object.values(weeklyData);
  }

  function getImportantSkippedEvents(events: Event[]) {
    const titleCountMap = {};

    events.forEach((event) => {
      const title = event.skippedReason;
      titleCountMap[title] = (titleCountMap[title] || 0) + 1;
    });

    const result = Object.entries(titleCountMap).map(
      ([skippedReason, count]) => ({
        name: skippedReason,
        value: count,
      })
    );

    return result;
  }

  useEffect(() => {
    async function getEvents() {
      try {
        const { data } = await axios.get<Event[]>(`${API_URL}/api/events`);
        const week = getThisWeekTasks(data);
        setWeeklyCompletionData(
          getWeekToDateTasks(week).filter((task) => task.isCompleted)
        );

        setTotalEvents(getWeekToDateTasks(week).length);
        setSpecialEventsData(
          getImportantSkippedEvents(week.filter((task) => task.isSpecial))
        );

        setHour(getTotalHours(getWeekToDateTasks(week)).toFixed(1));
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
    async function fetchData() {
      const { data } = await axios.get(`${API_URL}/api/goals`);
      const arr: any = [];
      data.map((goal: any) => {
        const completedSteps = goal.steps.filter(
          (step: any) => step.isCompleted
        ).length;
        arr.push({
          name: goal.title,
          progress: ((completedSteps / goal.steps.length) * 100).toFixed(0),
        });
      });
      setGoalProgressData(arr);
    }
    fetchData();
  }, []);

  // const totalSkipped = weeklyCompletionData.reduce(
  //   (sum, day) => sum + day.skipped,
  //   0
  // );
  // const completionRate = Math.round(
  //   (totalCompleted / (totalCompleted + totalSkipped)) * 100
  // );
  // const totalSpecialEvents = specialEventsData.reduce(
  //   (sum, item) => sum + item.value,
  //   0
  // );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  var perc = 0;
  const percentag = goalProgressData.map(
    (goal) => (perc += parseInt(goal.progress))
  );

  const percentage = percentag[goalProgressData.length - 1];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Date selector */}
      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg">
        <button
          className="p-2 rounded-md hover:bg-secondary"
          onClick={prevWeek}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-medium">Week Overview</h2>
          <p className="text-sm text-foreground/70">
            {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
          </p>
        </div>

        <button
          className="p-2 rounded-md hover:bg-secondary"
          onClick={nextWeek}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card p-4 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Completion Rate</h3>
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold">
            {totalEvents > 0
              ? ((totalCompleted / totalEvents) * 100).toFixed(0)
              : 0}
            %
          </p>
          <p className="text-xs text-foreground/70">
            {weeklyCompletionData.length} completed, {specialEventsData.length}{" "}
            skipped
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card p-4 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Special Events</h3>
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <p className="text-2xl font-bold">
            {" "}
            {specialEventsData.length > 0
              ? `${specialEventsData.length} this week`
              : 0}
          </p>
          <p className="text-xs text-foreground/70">
            Activities outside your schedule
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card p-4 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Goal Progress</h3>
            <Target className="h-5 w-5 text-accent" />
          </div>
          <p className="text-2xl font-bold">
            {percentage ? Math.round(percentage / goalProgressData.length) : 0}%
          </p>
          <p className="text-xs text-foreground/70">Average across all goals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card p-4 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Focus Time</h3>
            <Clock className="h-5 w-5 text-accent" />
          </div>
          <p className="text-2xl font-bold">{hour}h</p>
          <p className="text-xs text-foreground/70">Total productive hours</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-accent" />
              Weekly Activity
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyCompletionData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="day" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="skipped"
                  name="Skipped"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Special Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-card p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Reasons for skipping
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specialEventsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {specialEventsData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Goal Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-card p-6 rounded-lg mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Goal Progress
          </h3>
        </div>

        <div className="space-y-4">
          {goalProgressData.length > 0 ? (
            goalProgressData.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No goals set yet.</p>
          )}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="bg-card p-6 rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            AI Insights
          </h3>
        </div>

        <div className="space-y-4">
          {suggestion.map((suggestion) => (
            <div key={suggestion.id} className="p-4 bg-secondary rounded-md">
              <h4 className="font-medium mb-2">
                {" "}
                {suggestion.type === "schedule" && (
                  <Calendar className="h-5 w-5 text-accent shrink-0" />
                )}
                {suggestion.type === "goal" && (
                  <Target className="h-5 w-5 text-accent shrink-0" />
                )}
                {suggestion.type === "focus" && (
                  <Activity className="h-5 w-5 text-accent shrink-0" />
                )}
                {suggestion.type === "description" && (
                  <InfoIcon className="h-5 w-5 text-accent shrink-0" />
                )}
              </h4>
              <p className="text-sm">{suggestion.message}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleGenerateInsights}
          className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
        >
          {generatingInsights ? (
            <Loader2 className="w-5 h-5 animate-spin inline-block" />
          ) : (
            "Generate New Insights"
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default Analytics;
