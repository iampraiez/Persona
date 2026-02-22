import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart as BarChartIcon } from "lucide-react";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";

interface ActivityDataPoint {
  name: string;
  completed: number;
  skipped: number;
}

interface ActivityChartProps {
  data: ActivityDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; fill: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border border-border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ActivityChart: React.FC<ActivityChartProps> = ({ data, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <BarChartIcon className="h-5 w-5 text-accent" />
          Activity Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-secondary/30 rounded flex items-end justify-between px-4 pb-4 gap-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-secondary rounded-t"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              ></div>
            ))}
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="currentColor" />
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
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No activity data for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
