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
import { useEffect } from "react";

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
      
      <main className="container mx-auto px-4 pt-6 max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-serif font-bold">New Post</h1>
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
                      <FormLabel className="text-base font-semibold">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What's on your mind?" 
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
                      <FormLabel className="text-base font-semibold">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background border-border/60 rounded-xl">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
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
                    <FormLabel className="text-base font-semibold">Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your story..." 
                        className="min-h-[250px] resize-none text-base leading-relaxed px-4 py-4 bg-background border-border/60 focus:border-primary/50 rounded-xl"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Your identity will be anonymized as <span className="font-mono">User [IP]</span>
                </p>
                <div className="flex gap-3">
                  <Link href="/">
                    <Button type="button" variant="outline" className="rounded-xl px-6">Cancel</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isPending ? "Publishing..." : (
                      <>
                        Publish <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
