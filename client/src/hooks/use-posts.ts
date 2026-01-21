import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// ============================================
// POSTS HOOKS
// ============================================

export function usePosts(category?: string) {
  return useQuery({
    queryKey: [api.posts.list.path, category],
    queryFn: async () => {
      const url = category ? `${api.posts.list.path}?category=${category}` : api.posts.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      return api.posts.list.responses[200].parse(data);
    },
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: [api.posts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.posts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      const data = await res.json();
      return api.posts.get.responses[200].parse(data);
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.posts.create.input>) => {
      const validated = api.posts.create.input.parse(data);
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        if (res.status === 400) {
           const error = api.posts.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create post");
      }
      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      toast({
        title: "Success",
        description: "Your post has been published.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// COMMENTS HOOKS
// ============================================

export function useComments(postId: number) {
  return useQuery({
    queryKey: [api.comments.list.path, postId],
    queryFn: async () => {
      const url = buildUrl(api.comments.list.path, { postId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      return api.comments.list.responses[200].parse(data);
    },
    enabled: !!postId,
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.comments.create.input>) => {
      const validated = api.comments.create.input.parse(data);
      const url = buildUrl(api.comments.create.path, { postId });
      
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        if (res.status === 400) {
           const error = api.comments.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to post comment");
      }
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.comments.list.path, postId] });
      // Also invalidate the post detail to update comment counts if we had them
      queryClient.invalidateQueries({ queryKey: [api.posts.get.path, postId] });
      toast({
        title: "Posted",
        description: "Your comment has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
