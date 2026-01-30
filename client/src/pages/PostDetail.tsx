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

import { ja, ko } from "date-fns/locale";

const commentSchema = api.comments.create.input;

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const id = parseInt(params?.id || "0");
  
  const [community] = useState<string>(() => localStorage.getItem("community") || "japan");
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

  const t = {
    back: community === "japan" ? "フィードに戻る" : "피드로 돌아가기",
    notFound: community === "japan" ? "記事が見つかりません" : "게시글을 찾을 수 없습니다",
    notFoundDesc: community === "japan" ? "この記事は削除されたか、存在しません。" : "이 게시글은 삭제되었거나 존재하지 않습니다.",
    backHome: community === "japan" ? "ホームに戻る" : "홈으로 돌아가기",
    comments: community === "japan" ? "コメント" : "댓글",
    noComments: community === "japan" ? "まだコメントがありません。最初のコメントを投稿しましょう！" : "아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!",
    placeholder: community === "japan" ? "匿名で考えを共有しましょう..." : "익명으로 생각을 공유하세요...",
    postComment: community === "japan" ? "コメントを投稿" : "댓글 작성",
    posting: community === "japan" ? "投稿中..." : "게시 중...",
    signIn: community === "japan" ? "サインインして会話に参加" : "로그인하여 대화에 참여하기",
    signInDesc: community === "japan" ? "コメントは匿名ですが、アカウントが必要です。" : "댓글은 익명이지만 계정이 필요합니다.",
    loginBtn: community === "japan" ? "ログインしてコメントする" : "로그인하여 댓글 작성"
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
          <h2 className="text-2xl font-bold mb-2">{t.notFound}</h2>
          <p className="text-muted-foreground mb-6">{t.notFoundDesc}</p>
          <Link href="/">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> {t.backHome}</Button>
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
          <ArrowLeft className="mr-1 h-4 w-4" /> {t.back}
        </Link>

        {/* Post Content */}
        <article className="mb-12 sticky top-0 bg-background z-10 pt-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 border-b shadow-sm">
          <header className="mb-6 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight text-balance">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border/50 pb-6">
              <Badge variant="outline" className="font-mono bg-muted/50">
                IP: ...{post.ipOctet}
              </Badge>
              <span>
                {post.createdAt && format(new Date(post.createdAt), community === "japan" ? 'yyyy年M月d日' : 'yyyy년 M월 d일', { locale: community === "japan" ? ja : ko })}
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
            {t.comments} <span className="text-muted-foreground text-sm font-sans font-normal ml-2">({comments?.length || 0})</span>
          </h3>

          {/* Comments List */}
          <div className="space-y-6 flex flex-col">
            {commentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))
            ) : comments?.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-8">{t.noComments}</p>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="group flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6 last:mb-0">
                   <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-border/50 bg-muted">
                    <AvatarFallback className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                      {comment.ipOctet}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground/80">{community === "japan" ? "ユーザー" : "사용자"} {comment.ipOctet}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true,
                          locale: community === "japan" ? ja : ko
                        })}
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

          {/* Comment Form */}
          <div className="mt-10 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/50">
            {isAuthenticated ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Textarea 
                            placeholder={t.placeholder} 
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
                      {isCreatingComment ? t.posting : (
                        <>
                          {t.postComment} <SendHorizontal className="ml-2 h-4 w-4" />
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
                  <p className="font-medium text-foreground">{t.signIn}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.signInDesc}</p>
                </div>
                <Link href="/api/login">
                  <Button variant="outline" className="rounded-full">{t.loginBtn}</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
