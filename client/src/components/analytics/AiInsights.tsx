import React from "react";
import { Target, TrendingUp, Calendar, Activity, InfoIcon, Loader2 } from "lucide-react";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import { AiSuggestion } from "../../types";

interface AiInsightsProps {
  suggestions: AiSuggestion[];
  aiCredits: number;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

const AiInsights: React.FC<AiInsightsProps> = ({
  suggestions,
  aiCredits,
  isGenerating,
  onGenerate,
  canGenerate,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "schedule": return <Calendar className="h-5 w-5 text-accent shrink-0" />;
      case "goal": return <Target className="h-5 w-5 text-accent shrink-0" />;
      case "focus": return <Activity className="h-5 w-5 text-accent shrink-0" />;
      default: return <InfoIcon className="h-5 w-5 text-accent shrink-0" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <TrendingUp className="h-5 w-5 text-accent" />
          AI Insights
        </CardTitle>
        <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-1 rounded-full">
          {aiCredits}/3 Credits
        </span>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((suggestion: AiSuggestion, index: number) => (
              <div key={index} className="p-4 bg-secondary rounded-md">
                <h4 className="font-medium mb-2">{getIcon(suggestion.type)}</h4>
                <p className="text-sm">{suggestion.message}</p>
              </div>
            ))
          ) : (
            <div className="p-4 bg-secondary rounded-md text-center text-muted-foreground">
              <p>No AI insights available. Click below to generate some!</p>
            </div>
          )}
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : !canGenerate ? (
            "Daily Limit Reached"
          ) : (
            "Generate New Insights"
          )}
        </button>
      </CardContent>
    </Card>
  );
};

export default AiInsights;
