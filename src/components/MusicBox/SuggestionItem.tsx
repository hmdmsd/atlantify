import React from "react";
import { ThumbsUp, Trash2, Clock, User, Check, X } from "lucide-react";
import { Suggestion } from "@/types/suggestion.types";

interface SuggestionItemProps {
  suggestion: Suggestion;
  onVote: (suggestionId: string) => void;
  onDelete?: (suggestionId: string) => void;
  onStatusUpdate?: (
    suggestionId: string,
    status: "approved" | "rejected"
  ) => void;
  hasVoted: boolean;
  canDelete?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  onVote,
  onDelete,
  onStatusUpdate,
  hasVoted,
  canDelete = false,
  isAdmin = false,
  currentUserId,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (window.confirm("Are you sure you want to delete this suggestion?")) {
        onDelete(suggestion.id);
      }
    }
  };

  const handleStatusUpdate = (
    e: React.MouseEvent,
    status: "approved" | "rejected"
  ) => {
    e.stopPropagation();
    if (onStatusUpdate) {
      if (
        window.confirm(`Are you sure you want to ${status} this suggestion?`)
      ) {
        onStatusUpdate(suggestion.id, status);
      }
    }
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 hover:border-blue-500/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            {suggestion.title}
          </h3>
          <p className="text-sm text-neutral-400 truncate">
            {suggestion.artist}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onVote(suggestion.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
              hasVoted
                ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
            }`}
          >
            <ThumbsUp
              className={`h-5 w-5 transition-transform duration-200 ${
                hasVoted ? "fill-current transform scale-110" : ""
              }`}
            />
            <span className="font-medium">{suggestion.voteCount}</span>
          </button>

          {isAdmin && suggestion.status === "pending" && (
            <>
              <button
                onClick={(e) => handleStatusUpdate(e, "approved")}
                className="p-2 text-neutral-400 hover:text-green-500 rounded-md hover:bg-green-500/10 transition-all duration-200"
                title="Approve suggestion"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => handleStatusUpdate(e, "rejected")}
                className="p-2 text-neutral-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-all duration-200"
                title="Reject suggestion"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}

          {(canDelete || suggestion.suggestedBy === currentUserId) && (
            <button
              onClick={handleDelete}
              className="p-2 text-neutral-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-all duration-200"
              title="Delete suggestion"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-sm text-neutral-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>User #{suggestion.suggestedBy.slice(0, 8)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{formatDate(suggestion.createdAt)}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            suggestion.status === "pending"
              ? "bg-yellow-500/20 text-yellow-400"
              : suggestion.status === "approved"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {suggestion.status}
        </div>
      </div>
    </div>
  );
};
