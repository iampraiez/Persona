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
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAnalytics } from "../hooks/useAnalytics";
import { useInsights } from "../hooks/useInsights";
import { useUser } from "../hooks/useUser";
import { useGoals } from "../hooks/useGoals";

import StatCard from "../components/analytics/StatCard";
import ActivityChart from "../components/charts/ActivityChart";
import DistributionPieChart from "../components/charts/DistributionPieChart";
import GoalAnalysisItem from "../components/analytics/GoalAnalysisItem";
import AiInsights from "../components/analytics/AiInsights";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

const Analytics = () => {
  const [range, setRange] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics(
    range,
    currentDate,
  );
  const {
    suggestions,
    generateInsights,
    isGenerating,
    isError: insightsError,
  } = useInsights();
  const { data: user } = useUser();
  const { goals } = useGoals();

  const {
    totalEvents = 0,
    completedEvents = 0,
    completionRate = 0,
    focusTime = "0.0",
    specialEventsCount = 0,
    specialEventsData = [],
    activityData = [],
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
      const start = analyticsData?.range?.start
        ? new Date(analyticsData.range.start)
        : new Date();
      const end = analyticsData?.range?.end
        ? new Date(analyticsData.range.end)
        : new Date();
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    if (range === "month") return format(currentDate, "MMMM yyyy");
    if (range === "year") return format(currentDate, "yyyy");
    return "All Time";
  };

  const handleGenerateInsights = () => {
    if (
      (!analyticsData?.totalEvents || analyticsData.totalEvents === 0) &&
      (!analyticsData?.goalProgressData ||
        analyticsData.goalProgressData.length === 0)
    ) {
      toast.info("Add some events or goals first to generate insights!");
      return;
    }

    if ((user?.aiCredits || 0) <= 0) {
      toast.error("You have reached your daily limit of 3 AI credits.");
      return;
    }

    if (insightsError) {
      toast.error("Failed to generate insights. Please try again later.");
      return;
    }

    generateInsights();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border/50">
        <button
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"
          onClick={handlePrev}
          disabled={range === "all"}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-medium">
          {range === "all" ? "All Time Overview" : getDateLabel()}
        </h2>
        <button
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"
          onClick={handleNext}
          disabled={range === "all"}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completion Rate"
          icon={CheckCircle}
          value={`${completionRate}%`}
          description={`${completedEvents} completed, ${specialEventsCount} skipped`}
          isLoading={isAnalyticsLoading}
          iconColor="text-success"
          delay={0}
        />
        <StatCard
          title="Special Events"
          icon={AlertCircle}
          value={specialEventsCount}
          description="Activities outside your schedule"
          isLoading={isAnalyticsLoading}
          iconColor="text-warning"
          delay={0.1}
        />
        <StatCard
          title="Goal Progress"
          icon={Target}
          value={`${averageGoalProgress}%`}
          description="Average across all goals"
          isLoading={isAnalyticsLoading}
          delay={0.2}
        />
        <StatCard
          title="Focus Time"
          icon={Clock}
          value={`${focusTime}h`}
          description="Total productive hours"
          isLoading={isAnalyticsLoading}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart
          data={activityData.map(
            (d: { date: string; completed: number; skipped: number }) => ({
              name: d.date,
              completed: d.completed,
              skipped: d.skipped,
            }),
          )}
          isLoading={isAnalyticsLoading}
        />

        <DistributionPieChart
          title="Reasons for skipping"
          icon={AlertCircle}
          data={specialEventsData}
          dataKey="value"
          nameKey="name"
          isLoading={isAnalyticsLoading}
          iconColor="text-warning"
          emptyMessage="No events skipped this period"
        />

        <DistributionPieChart
          title="Focus Distribution"
          icon={TrendingUp}
          data={
            totalEvents > 0
              ? [
                  {
                    name: "Scheduled",
                    value: totalEvents - specialEventsCount,
                  },
                  { name: "Special", value: specialEventsCount },
                ]
              : []
          }
          dataKey="value"
          nameKey="name"
          isLoading={isAnalyticsLoading}
          showLegend
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Target className="h-5 w-5 text-accent" />
            Detailed Goal Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isAnalyticsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-32 bg-secondary rounded"></div>
                    <div className="h-2 w-full bg-secondary rounded"></div>
                  </div>
                ))}
              </div>
            ) : goals && goals.length > 0 ? (
              goals.map((goal) => (
                <GoalAnalysisItem key={goal.id} goal={goal} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>
                  No goals set yet. Create a goal to see detailed analytics.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AiInsights
        suggestions={suggestions || []}
        aiCredits={user?.aiCredits ?? 0}
        isGenerating={isGenerating}
        onGenerate={handleGenerateInsights}
        canGenerate={(user?.aiCredits || 0) > 0}
      />
    </div>
  );
};

export default Analytics;
