import React from "react";
import { ThumbsUp } from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  hasVoted: boolean;
  timestamp: string;
}

interface SuggestionItemProps {
  suggestion: Suggestion;
  onVote: (id: string) => void;
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  onVote,
}) => {
  const formattedTime = new Date(suggestion.timestamp).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="bg-white rounded-lg border p-4 mb-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{suggestion.title}</h3>
          <p className="text-gray-600">{suggestion.artist}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span>Suggested by {suggestion.suggestedBy}</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="flex flex-col items-center ml-4">
          <button
            onClick={() => onVote(suggestion.id)}
            disabled={suggestion.hasVoted}
            className={`p-2 rounded-full transition-colors ${
              suggestion.hasVoted
                ? "text-blue-500 cursor-not-allowed"
                : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium mt-1">{suggestion.votes}</span>
        </div>
      </div>
    </div>
  );
};
