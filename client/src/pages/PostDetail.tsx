import { useRoute } from "wouter";
import { usePost, useComments, useCreateComment, useUpdatePost, useDeletePost, useUpdateComment, useDeleteComment } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, SendHorizontal, Lock, MessageSquare, Edit2, Trash2, X, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { api } from "@shared/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ja, ko } from "date-fns/locale";

const commentSchema = api.comments.create.input;

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const id = parseInt(params?.id || "0");
  
  const [, setLocation] = useLocation();
  const [community] = useState<string>(() => localStorage.getItem("community") || "japan");
  const { data: post, isLoading: postLoading, error: postError } = usePost(id);
  const { data: comments, isLoading: commentsLoading } = useComments(id);
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment(id);
  const { mutate: updatePost } = useUpdatePost();
  const { mutate: deletePost } = useDeletePost();
  const { mutate: updateComment } = useUpdateComment(id);
  const { mutate: deleteComment } = useDeleteComment(id);
  const { user, isAuthenticated } = useAuth();

  const [editingPost, setEditingPost] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

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
    loginBtn: community === "japan" ? "ログインしてコメントする" : "로그인하여 댓글 작성",
    closed: community === "japan" ? "この投稿は30日間返信がないため終了しました。" : "이 게시물은 30일 동안 답글이 없어 종료되었습니다.",
    archived: community === "japan" ? "アーカイブ済み（返信で再開）" : "보관됨 (답글 작성 시 재활성화)",
    edit: community === "japan" ? "編集" : "수정",
    delete: community === "japan" ? "削除" : "삭제",
    deleteConfirm: community === "japan" ? "本当に削除しますか？" : "정말 삭제하시겠습니까?",
    deletePostDesc: community === "japan" ? "この投稿とすべてのコメントが完全に削除されます。" : "이 게시글과 모든 댓글이 영구적으로 삭제됩니다.",
    save: community === "japan" ? "保存" : "저장",
    cancel: community === "japan" ? "キャンセル" : "취소"
  };

  const isArchived = post && post.lastActivityAt && (new Date().getTime() - new Date(post.lastActivityAt).getTime() > 90 * 24 * 60 * 60 * 1000);

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
      
      <main className="container mx-auto px-4 pt-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" /> {t.back}
            </Link>

            {/* Post Content */}
            <article className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight text-balance flex-1">
                    {post.title}
                  </h1>
                  
                  {isAuthenticated && user?.id === post.authorId && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          setEditingPost(true);
                          setEditValue(post.content);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background/95 backdrop-blur-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
                            <AlertDialogDescription>{t.deletePostDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction 
                              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deletePost(post.id, { onSuccess: () => setLocation("/") })}
                            >
                              {t.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground border-b border-border/50 pb-6">
                  {post.isClosed && (
                    <Badge variant="destructive" className="font-sans">
                      {t.closed}
                    </Badge>
                  )}
                  {isArchived && !post.isClosed && (
                    <Badge variant="secondary" className="font-sans">
                      {t.archived}
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-mono bg-muted/50">
                    IP: ...{post.ipOctet}
                  </Badge>
                  <span className="whitespace-nowrap">
                    {post.createdAt && format(new Date(post.createdAt), community === "japan" ? 'yyyy年M月d日' : 'yyyy년 M월 d일', { locale: community === "japan" ? ja : ko })}
                  </span>
                  <span className="text-xs hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">
                    {post.createdAt && format(new Date(post.createdAt), 'h:mm a')}
                  </span>
                </div>
              </header>

              <div className="prose prose-stone dark:prose-invert max-w-none text-lg leading-relaxed text-foreground/90 font-sans whitespace-pre-wrap">
                {editingPost ? (
                  <div className="space-y-4">
                    <Textarea 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[200px] bg-background rounded-xl border-border/60"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" className="rounded-xl" onClick={() => setEditingPost(false)}>
                        <X className="mr-2 h-4 w-4" /> {t.cancel}
                      </Button>
                      <Button className="rounded-xl" onClick={() => {
                        updatePost({ id: post.id, data: { content: editValue } }, {
                          onSuccess: () => setEditingPost(false)
                        });
                      }}>
                        <Check className="mr-2 h-4 w-4" /> {t.save}
                      </Button>
                    </div>
                  </div>
                ) : (
                  post.content
                )}
              </div>
            </article>

            {/* Comments Section */}
            <section className="border-t pt-8">
              <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t.comments} <span className="text-muted-foreground text-sm font-sans font-normal ml-2">({comments?.length || 0})</span>
              </h3>

              {/* Comments List */}
              <div className="space-y-6 flex flex-col mb-12">
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
                    <div key={comment.id} className="group flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Comment Form in Sidebar for Desktop */}
              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-sm">
                <h4 className="font-bold mb-4">{t.postComment}</h4>
                {post.isClosed ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <Lock className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-foreground">{t.closed}</p>
                  </div>
                ) : isAuthenticated ? (
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
                                className="min-h-[120px] resize-none bg-background border-border/60 focus:border-primary/50 text-base rounded-xl"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={isCreatingComment || !form.formState.isDirty}
                        className="w-full rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                      >
                        {isCreatingComment ? t.posting : (
                          <>
                            {t.postComment} <SendHorizontal className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <Lock className="h-6 w-6 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.signIn}</p>
                    </div>
                    <Link href="/api/login">
                      <Button variant="outline" className="w-full rounded-full text-xs">{t.loginBtn}</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Safety/Info Card */}
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h4 className="text-sm font-bold text-primary mb-2">
                  {community === "japan" ? "匿名性と安全性" : "익명성과 안전"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {community === "japan" 
                    ? "すべての投稿とコメントは匿名です。IPアドレスの一部が表示され、コミュニティの信頼性を維持します。"
                    : "모든 게시글과 댓글은 익명입니다. IP 주소의 일부가 표시되어 커뮤니티의 신뢰성을 유지합니다."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
