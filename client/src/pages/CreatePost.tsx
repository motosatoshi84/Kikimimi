import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePost } from "@/hooks/use-posts";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { api } from "@shared/routes";
import { useEffect, useState } from "react";

const formSchema = api.posts.create.input;

const CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "health", label: "Health" },
  { value: "food", label: "Food" },
  { value: "others", label: "Others" },
];

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { mutate: createPost, isPending } = useCreatePost();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [community] = useState<string>(() => localStorage.getItem("community") || "japan");
  
  const t = {
    title: community === "japan" ? "新規投稿" : "새 게시글",
    labelTitle: community === "japan" ? "タイトル" : "제목",
    placeholderTitle: community === "japan" ? "何を考えていますか？" : "무슨 생각을 하고 계신가요?",
    labelCategory: community === "japan" ? "カテゴリー" : "카테고리",
    placeholderCategory: community === "japan" ? "カテゴリーを選択してください" : "카테고리를 선택하세요",
    labelContent: community === "japan" ? "内容" : "내용",
    placeholderContent: community === "japan" ? "あなたの話を共有してください..." : "이야기를 들려주세요...",
    anonymity: community === "japan" ? "あなたの身元は匿名化されます：" : "신원은 익명으로 보호됩니다:",
    user: community === "japan" ? "ユーザー" : "사용자",
    cancel: community === "japan" ? "キャンセル" : "취소",
    publish: community === "japan" ? "公開する" : "게시하기",
    publishing: community === "japan" ? "公開中..." : "게시 중..."
  };

  const categories = [
    { value: "travel", label: community === "japan" ? "旅行" : "여행" },
    { value: "health", label: community === "japan" ? "健康" : "건강" },
    { value: "food", label: community === "japan" ? "グルメ" : "맛집" },
    { value: "lifestyle", label: community === "japan" ? "ライフスタイル" : "라이프스타일" },
    { value: "tech", label: community === "japan" ? "IT・テック" : "테크" },
    { value: "jobs", label: community === "japan" ? "仕事・求人" : "구인구직" },
    { value: "marketplace", label: community === "japan" ? "売買・フリマ" : "중고장터" },
    { value: "others", label: community === "japan" ? "その他" : "기타" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "others",
      community: community as "japan" | "korea",
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/api/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createPost(data, {
      onSuccess: () => setLocation("/")
    });
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-serif font-bold">{t.title}</h1>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">{t.labelTitle}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t.placeholderTitle} 
                              className="text-lg font-medium px-4 py-6 bg-background border-border/60 focus:border-primary/50 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">{t.labelCategory}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-background border-border/60 rounded-xl">
                                <SelectValue placeholder={t.placeholderCategory} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background/95 backdrop-blur-md border shadow-xl opacity-100">
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">{t.labelContent}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t.placeholderContent} 
                            className="min-h-[300px] resize-none text-base leading-relaxed px-4 py-4 bg-background border-border/60 focus:border-primary/50 rounded-xl"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      {t.anonymity} <span className="font-mono">{t.user} [IP]</span>
                    </p>
                    <div className="flex gap-3">
                      <Link href="/">
                        <Button type="button" variant="outline" className="rounded-xl px-6">{t.cancel}</Button>
                      </Link>
                      <Button 
                        type="submit" 
                        disabled={isPending}
                        className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {isPending ? t.publishing : (
                          <>
                            {t.publish} <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h4 className="text-sm font-bold text-primary mb-4">
                  {community === "japan" ? "投稿のヒント" : "게시글 작성 팁"}
                </h4>
                <ul className="text-xs text-muted-foreground space-y-3 list-disc list-inside">
                  <li>
                    {community === "japan" 
                      ? "具体的で分かりやすいタイトルを付けましょう。" 
                      : "구체적이고 이해하기 쉬운 제목을 작성해 보세요."}
                  </li>
                  <li>
                    {community === "japan" 
                      ? "適切なカテゴリーを選択すると、回答が得やすくなります。" 
                      : "적절한 카테고리를 선택하면 더 많은 답변을 얻을 수 있습니다."}
                  </li>
                  <li>
                    {community === "japan" 
                      ? "他人のプライバシーを尊重し、礼儀正しく書きましょう。" 
                      : "타인의 사생활을 존중하고 예의 바르게 작성해 주세요."}
                  </li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <h4 className="text-sm font-bold mb-2">
                  {community === "japan" ? "匿名性について" : "익명성 안내"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {community === "japan" 
                    ? "あなたの名前やプロフィールは一切公開されません。IPアドレスの一部のみが表示されます。" 
                    : "성함이나 프로필은 공개되지 않습니다. IP 주소의 일부만 표시되어 익명이 유지됩니다."}
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
