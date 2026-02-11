import { usePosts } from "@/hooks/use-posts";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { PenSquare, Filter } from "lucide-react";
import { useState } from "react";
import jpLogo from "@assets/kikimimi_1769648273469.png";
import krLogo from "@assets/kikimimi_Korean_1769648273468.png";

const CATEGORIES = (community: string) => [
  { value: "all", label: community === "japan" ? "全カテゴリー" : "전체 카테고리" },
  { value: "travel", label: community === "japan" ? "旅行" : "여행" },
  { value: "health", label: community === "japan" ? "健康" : "건강" },
  { value: "food", label: community === "japan" ? "グルメ" : "맛집" },
  { value: "lifestyle", label: community === "japan" ? "ライフスタイル" : "라이프스타일" },
  { value: "tech", label: community === "japan" ? "IT・テック" : "테크" },
  { value: "others", label: community === "japan" ? "その他" : "기타" },
];

export default function Home() {
  const [community] = useState<string>(() => localStorage.getItem("community") || "japan");
  const [category, setCategory] = useState<string>("all");
  const { data: posts, isLoading, isError } = usePosts(community, category === "all" ? undefined : category);

  const categories = CATEGORIES(community);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-10">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
                  {community === "japan" ? "コミュニティフィード" : "커뮤니티 피드"}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {community === "japan" 
                    ? "匿名でアメリカに滞在している日本人が情報を共有できるところ。"
                    : "미국에 거주하는 한국인들이 익명으로 정보를 공유할 수 있는 공간입니다."}
                </p>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-end">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px] bg-background/95 backdrop-blur-md border-border/50 rounded-xl">
                    <SelectValue placeholder={community === "japan" ? "カテゴリー" : "카테고리"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-md border shadow-xl opacity-100">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <h3 className="text-lg font-semibold mb-2">{community === "japan" ? "読み込みに失敗しました" : "로딩에 실패했습니다"}</h3>
                <p className="text-muted-foreground mb-6">{community === "japan" ? "コミュニティフィードの取得中にエラーが発生しました。" : "커뮤니티 피드를 불러오는 중에 오류가 발생했습니다."}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  {community === "japan" ? "再試行" : "다시 시도"}
                </Button>
              </div>
            ) : posts?.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto mb-4">
                  <PenSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{community === "japan" ? "投稿がありません" : "작성된 게시글이 없습니다"}</h3>
                <p className="text-muted-foreground mb-6">{community === "japan" ? "最初の投稿をしてみましょう。" : "첫 번째 게시글을 작성해 보세요."}</p>
                <Link href="/new">
                  <Button>{community === "japan" ? "投稿を作成" : "게시글 작성"}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {posts?.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Rules */}
          <aside className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-28 space-y-6">
              <div className="bg-muted/30 rounded-2xl border border-border/50 p-6 animate-in fade-in slide-in-from-right-4 duration-700">
                <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
                  {community === "japan" ? (
                    <>
                      <div className="space-y-3">
                        <h2 className="text-xl font-serif font-bold text-foreground">このサイトについて</h2>
                        <p>
                          このサイトは、アメリカ在住の日本人が匿名で投稿できる安全な場所です。
                        </p>
                        <p className="text-xs text-muted-foreground">
                          利用はご自身の判断と責任において行ってください。
                        </p>
                      </div>

                      <div className="border-t border-border/30 pt-6 space-y-4">
                        <h2 className="text-lg font-serif font-bold text-foreground italic tracking-tight">Rules</h2>
                        <ol className="list-decimal list-inside space-y-2 pl-1 text-xs sm:text-sm">
                          <li>
                            <span className="font-bold text-foreground">敬意を持って</span>
                          </li>
                          <li>
                            <span className="font-bold text-foreground">ライフサイクル</span>
                            <p className="pl-5 text-[10px] text-muted-foreground leading-tight">30日終了、90日アーカイブ、120日削除。</p>
                          </li>
                          <li>
                            <span className="font-bold text-foreground">個人情報NG</span>
                          </li>
                          <li>
                            <span className="font-bold text-foreground">匿名性の尊重</span>
                          </li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h2 className="text-xl font-serif font-bold text-foreground">이 사이트에 대하여</h2>
                        <p>
                          이 사이트는 미국에 거주하는 한국인이 익명으로 게시할 수 있는 안전한 공간입니다.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          사이트 이용은 본인의 책임 하에 이루어집니다.
                        </p>
                      </div>

                      <div className="border-t border-border/30 pt-6 space-y-4">
                        <h2 className="text-lg font-serif font-bold text-foreground italic tracking-tight">Rules</h2>
                        <ol className="list-decimal list-inside space-y-2 pl-1 text-xs sm:text-sm">
                          <li>
                            <span className="font-bold text-foreground">상호 존중</span>
                          </li>
                          <li>
                            <span className="font-bold text-foreground">관리 정책</span>
                            <p className="pl-5 text-[10px] text-muted-foreground leading-tight">30일 종료, 90일 보관, 120일 삭제.</p>
                          </li>
                          <li>
                            <span className="font-bold text-foreground">개인정보 금지</span>
                          </li>
                          <li>
                            <span className="font-bold text-foreground">익명성 보호</span>
                          </li>
                        </ol>
                      </div>
                    </>
                  )}
                </section>
              </div>
              
              <Link href="/new" className="block lg:hidden">
                <Button className="w-full rounded-full py-6 text-lg shadow-lg shadow-primary/20">
                  <PenSquare className="mr-2 h-5 w-5" />
                  {community === "japan" ? "投稿を作成" : "게시글 작성"}
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
