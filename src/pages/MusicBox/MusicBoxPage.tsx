import React, { useState, useEffect, useCallback } from "react";
import { musicBoxService } from "@/services/musicbox.service";
import { Music2, ThumbsUp, Send, Loader } from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: {
    id: string;
    username: string;
  };
  votes: number;
  hasVoted: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const MusicBoxPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState({ title: "", artist: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      const { items } = await musicBoxService.getSuggestions();
      setSuggestions(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.title || !newSuggestion.artist) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const suggestion = await musicBoxService.createSuggestion({
        title: newSuggestion.title,
        artist: newSuggestion.artist,
      });
      setSuggestions((prev) => [suggestion, ...prev]);
      setNewSuggestion({ title: "", artist: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add suggestion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      const updatedSuggestion = await musicBoxService.voteSuggestion(
        suggestionId
      );
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? updatedSuggestion : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Music2 className="h-8 w-8 text-blue-500" />
              Music Box
            </h1>
            <p className="mt-2 text-gray-600">
              Suggest songs and vote for your favorites to be added to the radio
              queue.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Song Title
              </label>
              <input
                type="text"
                id="title"
                value={newSuggestion.title}
                onChange={(e) =>
                  setNewSuggestion((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter song title"
              />
            </div>
            <div>
              <label
                htmlFor="artist"
                className="block text-sm font-medium text-gray-700"
              >
                Artist
              </label>
              <input
                type="text"
                id="artist"
                value={newSuggestion.artist}
                onChange={(e) =>
                  setNewSuggestion((prev) => ({
                    ...prev,
                    artist: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter artist name"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="-ml-1 mr-2 h-4 w-4" />
                  Suggest Song
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border divide-y">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {suggestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No suggestions found. Be the first to suggest a song!
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {suggestion.title}
                    </h3>
                    <p className="text-gray-600">{suggestion.artist}</p>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Suggested by {suggestion.suggestedBy.username}
                      </span>
                      <span>
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(suggestion.id)}
                      disabled={suggestion.hasVoted}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                        suggestion.hasVoted
                          ? "bg-blue-100 text-blue-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-500"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{suggestion.votes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
