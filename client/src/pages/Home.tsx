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

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "travel", label: "Travel" },
  { value: "health", label: "Health" },
  { value: "food", label: "Food" },
  { value: "others", label: "Others" },
];

export default function Home() {
  const [community] = useState<string>(() => localStorage.getItem("community") || "japan");
  const [category, setCategory] = useState<string>("all");
  const { data: posts, isLoading, isError } = usePosts(community, category === "all" ? undefined : category);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-10">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-8 max-w-3xl">
        {/* Rules Section */}
        <div className="mb-12 bg-muted/30 rounded-2xl border border-border/50 p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <section className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground/80">
            <div className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-foreground">このサイトについて</h2>
              <p>
                このサイトは、アメリカ在住の日本人が匿名で投稿できる安全な場所です。<br />
                相談やおすすめを聞きたいとき、または考えや気持ちを共有したいときに、自由に投稿し、他の利用者からの意見や回答を受け取ることができます。
              </p>
              <p>
                ユーザー名は表示されず、個人が特定されることはありません。投稿は他のユーザーからは匿名で表示されます。
              </p>
              <p className="text-xs text-muted-foreground">
                本サイトを利用することにより、すべての内容はユーザーが投稿したものであり、一般的な情報提供を目的としたものであることをご理解ください。<br />
                本サイトの利用は、ご自身の判断と責任において行ってください。
              </p>
            </div>

            <div className="border-t border-border/30 pt-6 space-y-4">
              <h2 className="text-xl font-serif font-bold text-foreground font-mono italic tracking-tight">⸻ ルール ⸻</h2>
              <p>このコミュニティを安全で心地よい場所に保つため、以下のルールを守ってください。</p>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>
                  <span className="font-bold text-foreground">敬意をもって接してください</span>
                  <p className="pl-5 text-sm">誹謗中傷、嫌がらせ、ヘイトスピーチ、個人攻撃は禁止です。</p>
                </li>
                <li>
                  <span className="font-bold text-foreground">個人情報を投稿しないでください</span>
                  <p className="pl-5 text-sm">本名、住所、電話番号、勤務先など、自分や他人を特定できる情報は投稿しないでください。</p>
                </li>
                <li>
                  <span className="font-bold text-foreground">差別的または有害な内容の禁止</span>
                  <p className="pl-5 text-sm">人種差別、性差別、暴力、違法行為を助長する投稿は削除されます。</p>
                </li>
                <li>
                  <span className="font-bold text-foreground">なりすましの禁止</span>
                  <p className="pl-5 text-sm">他人になりすましたり、虚偽の肩書きや権威を主張する行為は禁止です。</p>
                </li>
                <li>
                  <span className="font-bold text-foreground">アドバイスは個人の経験に基づくものです</span>
                  <p className="pl-5 text-sm">すべての回答は個人の体験や意見に基づくものであり、医療・法律・金融などの専門的な助言を提供するものではありません。</p>
                </li>
                <li>
                  <span className="font-bold text-foreground">匿名性を尊重してください</span>
                  <p className="pl-5 text-sm">他のユーザーの身元を特定・追跡・暴露しようとする行為は禁止です。</p>
                </li>
                <li>
                  <span className="font-bold text-foreground">モデレーションについて</span>
                  <p className="pl-5 text-sm">ルールに違反する投稿やコメントは、予告なく削除される場合があります。繰り返し違反があった場合、利用が制限されることがあります。</p>
                </li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground border-t border-border/30 pt-4 text-center">
              ⸻ 本サイトは、ユーザーが投稿した内容の正確性、結果、またはそれに伴う影響について一切の責任を負いません。 ⸻
            </p>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              {community === "japan" ? "コミュニティフィード" : "Community Feed"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {community === "japan" 
                ? "匿名で現地の日本人と情報を共有しましょう。"
                : "Share your thoughts anonymously with fellow Korean residents."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-center sm:self-end">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] bg-card border-border/50 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
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
