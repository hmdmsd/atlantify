import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { SuggestionItem } from "./SuggestionItem";

interface Suggestion {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  hasVoted: boolean;
  timestamp: string;
}

export const MusicBox: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState({ title: "", artist: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("/api/musicbox");
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.title || !newSuggestion.artist) return;

    try {
      const response = await fetch("/api/musicbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSuggestion),
      });

      if (!response.ok) throw new Error("Failed to add suggestion");

      const addedSuggestion = await response.json();
      setSuggestions((prev) => [addedSuggestion, ...prev]);
      setNewSuggestion({ title: "", artist: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/musicbox/${suggestionId}/vote`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to vote");

      const updatedSuggestion = await response.json();
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? updatedSuggestion : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Music Box</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Song title"
              value={newSuggestion.title}
              onChange={(e) =>
                setNewSuggestion((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Suggest Song
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No suggestions yet. Be the first to suggest a song!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions
            .sort((a, b) => b.votes - a.votes)
            .map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                onVote={handleVote}
              />
            ))}
        </div>
      )}
    </div>
  );
};
