import { useRoute } from "wouter";
import { usePost, useComments, useCreateComment } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, SendHorizontal, Lock, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { api } from "@shared/routes";

const commentSchema = api.comments.create.input;

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: post, isLoading: postLoading, error: postError } = usePost(id);
  const { data: comments, isLoading: commentsLoading } = useComments(id);
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment(id);
  const { isAuthenticated } = useAuth();

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (data: z.infer<typeof commentSchema>) => {
    createComment(data, {
      onSuccess: () => form.reset()
    });
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-8 max-w-3xl space-y-8">
           <Skeleton className="h-8 w-1/3" />
           <div className="space-y-4">
             <Skeleton className="h-10 w-3/4" />
             <Skeleton className="h-64 w-full rounded-xl" />
           </div>
        </main>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-6">This post may have been deleted or doesn't exist.</p>
          <Link href="/">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-12">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-6 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to feed
        </Link>

        {/* Post Content */}
        <article className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-6 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight text-balance">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border/50 pb-6">
              <Badge variant="outline" className="font-mono bg-muted/50">
                IP: ...{post.ipOctet}
              </Badge>
              <span>
                {post.createdAt && format(new Date(post.createdAt), 'MMMM d, yyyy')}
              </span>
              <span className="text-xs">•</span>
              <span>
                {post.createdAt && format(new Date(post.createdAt), 'h:mm a')}
              </span>
            </div>
          </header>

          <div className="prose prose-stone dark:prose-invert max-w-none text-lg leading-relaxed text-foreground/90 font-sans whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        {/* Comments Section */}
        <section className="border-t pt-8">
          <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments <span className="text-muted-foreground text-sm font-sans font-normal ml-2">({comments?.length || 0})</span>
          </h3>

          {/* Comment Form */}
          <div className="mb-10 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/50">
            {isAuthenticated ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your thoughts anonymously..." 
                            className="min-h-[100px] resize-none bg-background border-border/60 focus:border-primary/50 text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isCreatingComment || !form.formState.isDirty}
                      className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    >
                      {isCreatingComment ? "Posting..." : (
                        <>
                          Post Comment <SendHorizontal className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <Lock className="h-8 w-8 text-muted-foreground/50" />
                <div>
                  <p className="font-medium text-foreground">Sign in to join the conversation</p>
                  <p className="text-sm text-muted-foreground mt-1">Comments are anonymous but require an account.</p>
                </div>
                <Link href="/api/login">
                  <Button variant="outline" className="rounded-full">Log In to Comment</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {commentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))
            ) : comments?.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-8">No comments yet. Be the first to say something!</p>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="group flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-border/50 bg-muted">
                    <AvatarFallback className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                      {comment.ipOctet}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground/80">User {comment.ipOctet}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-muted/20 p-3 sm:p-4 rounded-xl rounded-tl-none border border-border/30 text-sm sm:text-base leading-relaxed text-foreground/90">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
