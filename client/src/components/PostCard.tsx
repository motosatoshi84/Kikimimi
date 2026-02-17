import { Link } from "wouter";
import type { Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ja, ko } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [community] = useState<string>(() => localStorage.getItem("community") || "japan");

  // Truncate content for preview
  const preview = post.content.length > 140 
    ? post.content.substring(0, 140) + "..." 
    : post.content;

  const getCategoryLabel = (cat: string) => {
    if (community === "japan") {
      switch (cat) {
        case "travel": return "旅行";
        case "health": return "健康";
        case "food": return "グルメ";
        case "lifestyle": return "ライフスタイル";
        case "tech": return "IT・テック";
        case "jobs": return "仕事・求人";
        case "marketplace": return "売買・フリマ";
        default: return "その他";
      }
    } else {
      switch (cat) {
        case "travel": return "여행";
        case "health": return "건강";
        case "food": return "맛집";
        case "lifestyle": return "라이프스타일";
        case "tech": return "테크";
        case "jobs": return "구인구직";
        case "marketplace": return "중고장터";
        default: return "기타";
      }
    }
  };

  return (
    <Link href={`/post/${post.id}`} className="block transition-all hover:scale-[1.01] active:scale-[0.99] duration-200">
      <Card className="h-full border-border/40 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden bg-card/40 backdrop-blur-sm group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="font-serif text-xl leading-tight line-clamp-2 break-words group-hover:text-primary transition-colors">
              {post.isClosed && <span className="text-destructive mr-2 font-sans text-sm font-bold whitespace-nowrap">[CLOSED]</span>}
              {post.title}
            </CardTitle>
            <Badge variant="secondary" className="capitalize shrink-0 bg-primary/10 text-primary border-none font-medium">
              {getCategoryLabel(post.category)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-muted-foreground/90 text-sm leading-relaxed line-clamp-3 font-sans">
            {preview}
          </p>
        </CardContent>
        <CardFooter className="pt-3 text-xs text-muted-foreground flex justify-between items-center border-t border-border/20 mt-auto p-4 bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <span className="font-mono text-[10px] tracking-tight">IP: ...{post.ipOctet}</span>
            </div>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { 
                addSuffix: true,
                locale: community === "japan" ? ja : ko
              }) : (community === "japan" ? "今すぐ" : "방금 전")}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
             {community === "japan" ? "詳しく読む" : "자세히 보기"}
             <span className="text-lg">→</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
