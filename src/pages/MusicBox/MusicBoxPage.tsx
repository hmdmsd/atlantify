import React, { useState, useEffect, useCallback } from "react";
import { Send, Music2, Search, Loader, ChevronDown } from "lucide-react";

import { musicBoxService } from "@/services/musicbox.service";
import { Suggestion, SuggestionFilters } from "@/types/suggestion.types";
import { useAuth } from "@/hooks/useAuth";
import { SuggestionItem } from "@/components/MusicBox/SuggestionItem";

interface NewSuggestion {
  title: string;
  artist: string;
}

export const MusicBoxPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [duplicateSuggestion, setDuplicateSuggestion] = useState<Suggestion | null>(null);
  const [newSuggestion, setNewSuggestion] = useState<NewSuggestion>({
    title: "",
    artist: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SuggestionFilters>({
    sort: "popular",
    page: 1,
    limit: 10,
  });
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);

  const fetchSuggestions = useCallback(
    async (resetPage = false) => {
      try {
        setIsLoading(true);
        const pageToFetch = resetPage ? 1 : filters.page;
        const response = await musicBoxService.getSuggestions({
          ...filters,
          page: pageToFetch,
        });

        const fetchedSuggestions = response.suggestions || [];

        setSuggestions((prev) =>
          resetPage ? fetchedSuggestions : [...prev, ...fetchedSuggestions]
        );

        setHasMore(fetchedSuggestions.length === filters.limit);

        // Only update the page if we're not already on page 1
        if (resetPage && filters.page !== 1) {
          setFilters((prev) => ({ ...prev, page: 1 }));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch suggestions"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters.page, filters.limit, filters.sort, filters.search] // Only depend on specific filter properties you use
);

// Change the useEffect to run only when specific filters change
useEffect(() => {
    fetchSuggestions(true);
}, [filters.sort, filters.search]); // Only re-fetch when sort or search changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please log in to suggest songs");
      return;
    }

    if (!newSuggestion.title || !newSuggestion.artist) return;

    try {
      const response = await musicBoxService.createSuggestion(newSuggestion);
      
      if (!response.success) {
        if (response.existingSuggestion) {
          setDuplicateSuggestion(response.existingSuggestion);
          setError("This song has already been suggested.");
          // Optionally scroll to the existing suggestion
          const element = document.getElementById(`suggestion-${response.existingSuggestion.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.classList.add('highlight-suggestion');
            setTimeout(() => element.classList.remove('highlight-suggestion'), 2000);
          }
        } else {
          setError(response.message || "Failed to add suggestion");
        }
        return;
      }

      setSuggestions((prev: any) => [response.suggestion, ...prev]);
      setNewSuggestion({ title: "", artist: "" });
      setDuplicateSuggestion(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add suggestion");
    }
  };

  const handleDelete = async (suggestionId: string) => {
    if (!isAuthenticated) {
      setError("Please log in to delete suggestions");
      return;
    }

    try {
      const response = await musicBoxService.removeSuggestion(suggestionId);
      if (response.success) {
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
        setUserVotes((prev) => {
          const newVotes = new Set(prev);
          newVotes.delete(suggestionId);
          return newVotes;
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete suggestion"
      );
    }
  };

  const handleVote = async (suggestionId: string) => {
    if (!isAuthenticated) {
      setError("Please log in to vote");
      return;
    }

    try {
      const response = await musicBoxService.toggleVote(suggestionId);
      if (response.success) {
        setUserVotes((prev) => {
          const newVotes = new Set(prev);
          if (response.hasVoted) {
            newVotes.add(suggestionId);
          } else {
            newVotes.delete(suggestionId);
          }
          return newVotes;
        });
        fetchSuggestions(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  const handleLoadMore = () => {
    setFilters((prev: any) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Music2 className="h-8 w-8 text-blue-500" />
            Music Box
          </h1>
          <p className="mt-2 text-neutral-400">
            Suggest songs and vote for your favorites to be added to the radio
            queue.
          </p>
        </div>
      </div>

      {/* Suggestion Form */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-neutral-300"
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
                className="block w-full pl-3 pr-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
                placeholder="Enter song title"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="artist"
                className="block text-sm font-medium text-neutral-300"
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
                className="block w-full pl-3 pr-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
                placeholder="Enter artist name"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!isAuthenticated}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5 mr-2" />
            Suggest Song
          </button>
        </form>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search suggestions..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 pl-10 pr-4 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500 text-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-300 mb-6">
          {error}
        </div>
      )}

      {/* Error Handling with Duplicate Suggestion Info */}
      {error && (
        <div className={`rounded-lg p-4 mb-6 ${
          duplicateSuggestion 
            ? "bg-yellow-900/20 border border-yellow-500/30 text-yellow-300"
            : "bg-red-900/20 border border-red-500/30 text-red-300"
        }`}>
          <p>{error}</p>
          {duplicateSuggestion && (
            <div className="mt-2 text-sm">
              <p>Original suggestion by User #{duplicateSuggestion.suggestedBy.slice(0, 8)}</p>
              <p>Suggested on: {new Date(duplicateSuggestion.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions List */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-lg">
        {isLoading && suggestions.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            <p>No suggestions yet. Be the first to suggest a song!</p>
          </div>
        ) : (
          <>
            <div className="max-h-[calc(100vh-570px)] overflow-y-auto custom-scrollbar">
              <div className="space-y-4 p-4">
                {suggestions.map((suggestion) => (
                  <SuggestionItem
                    key={suggestion.id}
                    suggestion={suggestion}
                    onVote={handleVote}
                    onDelete={handleDelete}
                    hasVoted={userVotes.has(suggestion.id)}
                    canDelete={user?.role === "admin"}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-4 border-t border-neutral-800">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 mr-2" />
                  )}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
