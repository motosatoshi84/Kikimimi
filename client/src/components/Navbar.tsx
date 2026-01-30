import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PenSquare, LogIn, LogOut, MessageSquareText, Globe2, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jpLogo from "@assets/kikimimi_1769648273469.png";
import krLogo from "@assets/kikimimi_Korean_1769648273468.png";
import { formatDistanceToNow } from "date-fns";
import { ja, ko } from "date-fns/locale";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [community, setCommunity] = useState<string>(() => localStorage.getItem("community") || "japan");

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const toggleCommunity = () => {
    const newComm = community === "japan" ? "korea" : "japan";
    setCommunity(newComm);
    localStorage.setItem("community", newComm);
    window.location.reload(); 
  };

  const t = {
    switchTo: community === "japan" ? "Korean" : "Japanese",
    notifications: community === "japan" ? "通知" : "알림",
    noNotifications: community === "japan" ? "通知はありません" : "알림이 없습니다",
    writePost: community === "japan" ? "投稿する" : "글쓰기",
    logout: community === "japan" ? "ログアウト" : "로그아웃",
    login: community === "japan" ? "ログイン" : "로그인"
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <img 
            src={community === "japan" ? jpLogo : krLogo} 
            alt="Kikimimi" 
            className="h-20 w-auto object-contain"
          />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleCommunity}
            className="rounded-full px-4 border border-border/50 hover:bg-muted"
          >
            <span className="mr-2">{community === "japan" ? "🇯🇵" : "🇰🇷"}</span>
            <span className="hidden sm:inline">{community === "japan" ? "Korean" : "Japanese"}へ</span>
          </Button>

          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>{t.notifications}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {t.noNotifications}
                      </div>
                    ) : (
                      notifications?.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? "bg-muted/50" : ""}`}
                          onClick={() => {
                            if (!notification.isRead) markReadMutation.mutate(notification.id);
                            setLocation(`/post/${notification.postId}`);
                          }}
                        >
                          <p className="text-sm font-medium leading-none">{notification.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true,
                              locale: community === "japan" ? ja : ko
                            })}
                          </p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {location !== "/new" && (
                <Link href="/new">
                  <Button variant="default" size="sm" className="hidden sm:flex rounded-full shadow-md shadow-primary/20">
                    <PenSquare className="mr-2 h-4 w-4" />
                    {t.writePost}
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                      <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <a href="/login">
              <Button variant="secondary" className="font-medium rounded-full">
                <LogIn className="mr-2 h-4 w-4" />
                {t.login}
              </Button>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
