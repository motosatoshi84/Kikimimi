import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PenSquare, LogIn, LogOut, MessageSquareText, Globe2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jpLogo from "@assets/kikimimi_1769271006291.png";
import krLogo from "@assets/kikimimi_Korean_1769271043542.png";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [community, setCommunity] = useState<string>(() => localStorage.getItem("community") || "japan");

  const toggleCommunity = () => {
    const newComm = community === "japan" ? "korea" : "japan";
    setCommunity(newComm);
    localStorage.setItem("community", newComm);
    window.location.reload(); 
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <img 
            src={community === "japan" ? jpLogo : krLogo} 
            alt="Kikimimi" 
            className="h-14 w-auto object-contain"
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
            <span className="hidden sm:inline">Switch to {community === "japan" ? "Korean" : "Japanese"}</span>
          </Button>

          {isAuthenticated ? (
            <>
              {location !== "/new" && (
                <Link href="/new">
                  <Button variant="default" size="sm" className="hidden sm:flex rounded-full shadow-md shadow-primary/20">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Write Post
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
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/api/login">
              <Button variant="secondary" className="font-medium rounded-full">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
