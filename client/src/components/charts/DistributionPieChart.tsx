import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { LucideIcon } from "lucide-react";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";

interface DistributionDataPoint {
  [key: string]: string | number;
}

interface DistributionPieChartProps {
  title: string;
  icon: LucideIcon;
  data: DistributionDataPoint[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  isLoading?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  emptyMessage?: string;
  iconColor?: string;
}

const COLORS = ["#8B5CF6", "#3B82F6", "#14B8A6", "#F97316"];

const DistributionPieChart: React.FC<DistributionPieChartProps> = ({
  title,
  icon: Icon,
  data,
  dataKey,
  nameKey,
  colors = COLORS,
  isLoading = false,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = false,
  emptyMessage = "No data for this period",
  iconColor = "text-accent",
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-48 w-48 rounded-full border-8 border-secondary animate-pulse"></div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={5}
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistributionPieChart;
