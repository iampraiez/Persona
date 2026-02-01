import { useState } from "react";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
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
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAnalytics } from "../hooks/useAnalytics";
import { useInsights } from "../hooks/useInsights";

const COLORS = ["#8B5CF6", "#3B82F6", "#14B8A6", "#F97316"];

 const CustomTooltip = ({
   active,
   payload,
   label,
 }: {
   active: boolean;
   payload: {
     name: string;
     value: number;
     color: string;
     length: number;
     entry: { name: string; value: number; color: string };
   }[];
   label: string;
 }) => {
   if (active && payload && payload.length) {
     return (
       <div className="bg-card p-3 border border-border rounded-md shadow-md">
         <p className="font-medium">{label}</p>
         {payload.map(
           (
             entry: { name: string; value: number; color: string },
             index: number,
           ) => (
             <p key={index} style={{ color: entry.color }}>
               {entry.name}: {entry.value}
             </p>
           ),
         )}
       </div>
     );
   }
   return null;
 };

const Analytics = () => {
  const [range, setRange] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics(range, currentDate);
  const { suggestions, generateInsights, isGenerating } = useInsights();

   const {
     totalEvents = 0,
     completedEvents = 0,
     completionRate = 0,
     focusTime = "0.0",
     specialEventsCount = 0,
     specialEventsData = [],
     activityData = [],
     goalProgressData = [],
     averageGoalProgress = 0,
   } = analyticsData || {};

  const handlePrev = () => {
    if (range === "day") setCurrentDate(subDays(currentDate, 1));
    else if (range === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (range === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (range === "year") setCurrentDate(subYears(currentDate, 1));
  };

  const handleNext = () => {
    if (range === "day") setCurrentDate(addDays(currentDate, 1));
    else if (range === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (range === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (range === "year") setCurrentDate(addYears(currentDate, 1));
  };

  const getDateLabel = () => {
    if (range === "day") return format(currentDate, "MMMM d, yyyy");
    if (range === "week") {
      const start = analyticsData?.range?.start ? new Date(analyticsData.range.start) : new Date();
      const end = analyticsData?.range?.end ? new Date(analyticsData.range.end) : new Date();
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    if (range === "month") return format(currentDate, "MMMM yyyy");
    if (range === "year") return format(currentDate, "yyyy");
    return "All Time";
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="flex bg-secondary rounded-lg p-1">
          {["day", "week", "month", "year", "all"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                range === r
                  ? "bg-card text-accent shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg">
        <button
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"
          onClick={handlePrev}
          disabled={range === "all"}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-medium">
            {range === "all" ? "All Time Overview" : getDateLabel()}
          </h2>
        </div>

        <button
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"
          onClick={handleNext}
          disabled={range === "all"}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

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
          {isAnalyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-24 bg-secondary rounded mb-2"></div>
              <div className="h-4 w-32 bg-secondary rounded"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-foreground/70">
                {completedEvents} completed, {specialEventsCount} skipped
              </p>
            </>
          )}
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
          {isAnalyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-16 bg-secondary rounded mb-2"></div>
              <div className="h-4 w-40 bg-secondary rounded"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{specialEventsCount}</p>
              <p className="text-xs text-foreground/70">
                Activities outside your schedule
              </p>
            </>
          )}
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
          {isAnalyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-24 bg-secondary rounded mb-2"></div>
              <div className="h-4 w-36 bg-secondary rounded"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{averageGoalProgress}%</p>
              <p className="text-xs text-foreground/70">
                Average across all goals
              </p>
            </>
          )}
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
          {isAnalyticsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-secondary rounded mb-2"></div>
              <div className="h-4 w-32 bg-secondary rounded"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{focusTime}h</p>
              <p className="text-xs text-foreground/70">
                Total productive hours
              </p>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-accent" />
              Activity Overview
            </h3>
          </div>

          <div className="h-64">
            {isAnalyticsLoading ? (
              <div className="h-full w-full animate-pulse bg-secondary/30 rounded flex items-end justify-between px-4 pb-4 gap-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full bg-secondary rounded-t"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  ></div>
                ))}
              </div>
            ) : activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" stroke="currentColor" />
                  <YAxis stroke="currentColor" />
                  <Tooltip
                    content={
                      <CustomTooltip active={false} payload={[]} label="" />
                    }
                  />
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No activity data for this period</p>
              </div>
            )}
          </div>
        </motion.div>

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
            {isAnalyticsLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-48 w-48 rounded-full border-8 border-secondary animate-pulse"></div>
              </div>
            ) : specialEventsData.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No events skipped this period</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          className="bg-card p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Focus Distribution
            </h3>
          </div>

          <div className="h-64">
            {isAnalyticsLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-48 w-48 rounded-full border-8 border-secondary animate-pulse"></div>
              </div>
            ) : totalEvents > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Scheduled",
                        value: totalEvents - specialEventsCount,
                      },
                      { name: "Special", value: specialEventsCount },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#8B5CF6" />
                    <Cell fill="#F97316" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No data for this period</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

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
          {isAnalyticsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-secondary rounded"></div>
                    <div className="h-4 w-8 bg-secondary rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded"></div>
                </div>
              ))}
            </div>
          ) : goalProgressData.length > 0 ? (
            goalProgressData.map(
              (goal: { id: string; name: string; progress: number }) => (
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
              ),
            )
          ) : (
            <p className="text-sm text-muted-foreground">No goals set yet.</p>
          )}
        </div>
      </motion.div>

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
          {suggestions && suggestions.length > 0 ? (
            suggestions.map(
              (
                suggestion: { type: string; message: string },
                index: number,
              ) => (
                <div key={index} className="p-4 bg-secondary rounded-md">
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
              ),
            )
          ) : (
            <div className="p-4 bg-secondary rounded-md text-center text-muted-foreground">
              <p>No AI insights available. Click below to generate some!</p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (
              (!analyticsData?.totalEvents ||
                analyticsData.totalEvents === 0) &&
              (!analyticsData?.goalProgressData ||
                analyticsData.goalProgressData.length === 0)
            ) {
              toast.info(
                "Add some events or goals first to generate insights!",
              );
              return;
            }
            generateInsights();
          }}
          disabled={isGenerating}
          className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
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
