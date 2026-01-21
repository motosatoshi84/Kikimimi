import { Link, useLocation } from "wouter";
import { Home, PenSquare, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // Only show on mobile
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t sm:hidden pb-safe">
      <nav className="flex justify-around items-center h-16">
        <Link href="/">
          <div className={cn(
            "flex flex-col items-center justify-center w-full h-full px-4 space-y-1",
            location === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium">Home</span>
          </div>
        </Link>
        
        <Link href={isAuthenticated ? "/new" : "/api/login"}>
          <div className={cn(
            "flex flex-col items-center justify-center w-full h-full px-4 space-y-1",
            location === "/new" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <div className="bg-primary/10 p-2 rounded-xl">
              <PenSquare className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Link>
        
        <Link href={isAuthenticated ? "/api/logout" : "/api/login"}>
          <div className={cn(
            "flex flex-col items-center justify-center w-full h-full px-4 space-y-1",
             "text-muted-foreground hover:text-foreground"
          )}>
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium">{isAuthenticated ? "Logout" : "Login"}</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
