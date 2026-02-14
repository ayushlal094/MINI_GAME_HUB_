import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertHighScore } from "@shared/routes";

export function useScores(game: string) {
  return useQuery({
    queryKey: [api.scores.list.path, game],
    queryFn: async () => {
      const url = buildUrl(api.scores.list.path, { game });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scores");
      return api.scores.list.responses[200].parse(await res.json());
    },
    // Keep scores fresh
    staleTime: 1000 * 60, 
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHighScore) => {
      const res = await fetch(api.scores.create.path, {
        method: api.scores.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.scores.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit score");
      }
      
      return api.scores.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific game's score list
      queryClient.invalidateQueries({ 
        queryKey: [api.scores.list.path, variables.game] 
      });
    },
  });
}
