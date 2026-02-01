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
    <Link href={`/post/${post.id}`} className="block transition-transform hover:-translate-y-1 active:scale-[0.99] duration-200">
      <Card className="h-full border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="font-serif text-lg leading-snug line-clamp-2 text-balance">
              {post.isClosed && <span className="text-destructive mr-2">[CLOSED]</span>}
              {post.title}
            </CardTitle>
            <Badge variant="outline" className="capitalize shrink-0">
              {getCategoryLabel(post.category)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 font-sans">
            {preview}
          </p>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center border-t border-border/30 mt-auto p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 h-5 rounded-md">
              IP: ...{post.ipOctet}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { 
                addSuffix: true,
                locale: community === "japan" ? ja : ko
              }) : (community === "japan" ? "今すぐ" : "방금 전")}
            </span>
          </div>
          
          <div className="flex items-center text-primary font-medium">
             {community === "japan" ? "詳しく読む" : "자세히 보기"}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
