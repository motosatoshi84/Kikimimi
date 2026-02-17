import { usePosts } from "@/hooks/use-posts";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-border/40">
              <div className="flex flex-col gap-3 text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl font-serif font-black text-foreground tracking-tight">
                  {community === "japan" ? "コミュニティフィード" : "커뮤니티 피드"}
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl leading-relaxed">
                  {community === "japan" 
                    ? "匿名でアメリカに滞在している日本人が情報を共有できる安全な場所です。"
                    : "미국에 거주하는 한국인들이 익명으로 정보를 공유할 수 있는 안전한 공간입니다."}
                </p>
              </div>

              <div className="flex items-center gap-3 self-center sm:self-end bg-muted/20 p-1.5 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 px-3 text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{community === "japan" ? "絞り込み" : "필터"}</span>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px] bg-background border-none shadow-none rounded-xl focus:ring-1 focus:ring-primary/20">
                    <SelectValue placeholder={community === "japan" ? "カテゴリー" : "카테고리"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="rounded-lg m-1">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between px-2 hover:bg-transparent group">
                              <h2 className="text-xl font-serif font-bold text-foreground italic tracking-tight">⸻ ルール ⸻</h2>
                              <Filter className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-80 bg-background/95 backdrop-blur-md border shadow-xl p-4 max-h-[70vh] overflow-y-auto">
                            <ol className="list-decimal list-inside space-y-3 pl-2">
                              <li>
                                <span className="font-bold text-foreground">敬意をもって接してください</span>
                                <p className="pl-5 text-sm">誹謗中傷、嫌がらせ、ヘイトスピーチ、個人攻撃は禁止です。</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">コンテンツのライフサイクル</span>
                                <p className="pl-5 text-sm">30日間返信がない投稿は自動的に「終了」となり、返信ができなくなります。90日間活動がない投稿はアーカイブされますが、返信することで再開できます。120日間活動がない投稿は自動的に削除されます。</p>
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
                            <p className="text-xs text-muted-foreground border-t border-border/30 pt-4 text-center mt-4">
                              ⸻ 本サイトは、ユーザーが投稿した内容の正確性、結果、またはそれに伴う影響について一切の責任を負いません。 ⸻
                            </p>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h2 className="text-xl font-serif font-bold text-foreground">이 사이트에 대하여</h2>
                        <p>
                          이 사이트는 미국에 거주하는 한국인이 익명으로 게시할 수 있는 안전한 공간입니다.<br />
                          조언이나 추천을 구하거나, 자신의 생각이나 마음을 나누고 싶을 때 자유롭게 글을 작성하고 다른 이용자들의 의견과 답변을 받을 수 있습니다.
                        </p>
                        <p>
                          사용자 이름은 표시되지 않으며, 개인의 신원은 보호됩니다. 게시글은 다른 사용자에게 익명으로 공개됩니다.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          본 사이트를 이용함으로써, 모든 콘텐츠는 이용자가 직접 작성한 것이며 일반적인 정보 제공을 목적으로 한다는 점을 이해한 것으로 간주됩니다.<br />
                          사이트 이용은 전적으로 본인의 판단과 책임 하에 이루어집니다.
                        </p>
                      </div>

                      <div className="border-t border-border/30 pt-6 space-y-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between px-2 hover:bg-transparent group">
                              <h2 className="text-xl font-serif font-bold text-foreground italic tracking-tight">⸻ 이용 규칙 ⸻</h2>
                              <Filter className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-80 bg-background/95 backdrop-blur-md border shadow-xl p-4 max-h-[70vh] overflow-y-auto">
                            <ol className="list-decimal list-inside space-y-3 pl-2">
                              <li>
                                <span className="font-bold text-foreground">서로 존중해 주세요</span>
                                <p className="pl-5 text-sm">괴롭힘, 따돌림, 혐오 발언, 인신공격은 허용되지 않습니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">콘텐츠 관리 정책</span>
                                <p className="pl-5 text-sm">30일 동안 답글이 없는 게시물은 자동으로 '종료'되어 답글 작성이 제한됩니다. 90일 동안 활동이 없는 게시물은 보관되지만, 답글을 작성하면 다시 활성화됩니다. 120일 동안 활동이 없는 게시물은 자동으로 삭제됩니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">개인정보를 게시하지 마세요</span>
                                <p className="pl-5 text-sm">본명, 주소, 전화번호, 직장 등 본인이나 타인을 식별할 수 있는 정보는 게시하지 마시기 바랍니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">차별적이거나 유해한 콘텐츠 금지</span>
                                <p className="pl-5 text-sm">인종차별, 성차별, 폭력 또는 불법 행위를 조장하는 게시물은 삭제됩니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">사칭 금지</span>
                                <p className="pl-5 text-sm">다른 사람인 척 하거나, 허위의 자격이나 권위를 주장하는 행위는 금지됩니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">조언은 개인 경험에 기반합니다</span>
                                <p className="pl-5 text-sm">모든 답변은 개인의 경험과 의견에 기반하며, 의료·법률·금융 등 전문적인 조언을 제공하지 않습니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">익명성 보호</span>
                                <p className="pl-5 text-sm">다른 사용자의 신원을 알아내거나 추적하거나 공개하려는 시도는 엄격히 금지됩니다.</p>
                              </li>
                              <li>
                                <span className="font-bold text-foreground">운영 및 관리</span>
                                <p className="pl-5 text-sm">규칙을 위반한 게시물이나 댓글은 사전 공지 없이 삭제될 수 있으며, 반복적인 위반 시 이용이 제한될 수 있습니다.</p>
                              </li>
                            </ol>
                            <p className="text-xs text-muted-foreground border-t border-border/30 pt-4 text-center mt-4">
                              ⸻ 본 사이트는 이용자가 작성한 콘텐츠의 정확성, 결과 또는 그로 인한 어떠한 영향에 대해서도 책임을 지지 않습니다. ⸻
                            </p>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
