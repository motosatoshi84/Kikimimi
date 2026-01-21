import { usePosts } from "@/hooks/use-posts";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PenSquare } from "lucide-react";

export default function Home() {
  const { data: posts, isLoading, isError } = usePosts();

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-10">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-8 max-w-3xl">
        <div className="flex flex-col gap-2 mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
            Community Feed
          </h1>
          <p className="text-muted-foreground text-lg">
            Share your thoughts anonymously with fellow Japanese residents.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl border border-border/50 bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <h3 className="text-lg font-semibold mb-2">Failed to load posts</h3>
            <p className="text-muted-foreground mb-6">Something went wrong while fetching the community feed.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto mb-4">
              <PenSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share something with the community.</p>
            <Link href="/new">
              <Button>Create Post</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
