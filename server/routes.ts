import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Helper to extract last 2 octets of IP
function getIpOctet(req: any): string {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '0.0.0.0';
  // Handle comma separated list (x-forwarded-for can contain multiple IPs)
  const firstIp = ip.split(',')[0].trim();
  const parts = firstIp.split('.');
  if (parts.length >= 4) {
    return `${parts[2]}.${parts[3]}`;
  }
  // Fallback for IPv6 or malformed IPv4
  return 'XX.XX';
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.posts.list.path, async (req, res) => {
    const community = req.query.community as string || "japan";
    const category = req.query.category as string | undefined;
    const posts = await storage.getPosts(community, category);
    res.json(posts);
  });

  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  });

  app.post(api.posts.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const ipOctet = getIpOctet(req);
      
      const post = await storage.createPost(input, userId, ipOctet);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Comments
  app.get(api.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(Number(req.params.postId));
    res.json(comments);
  });

  app.post(api.comments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.comments.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const ipOctet = getIpOctet(req);
      const postId = Number(req.params.postId);

      // Verify post exists first
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // We need to manually set postId as it is not in the body but in the URL params for validation if using pure body
      // But here input schema omits postId, so we pass it separately to storage
      // The schema input actually validates content. 
      // Wait, insertCommentSchema omits postId. So storage.createComment needs to handle it.
      // My storage.createComment takes InsertComment which DOES have postId?
      // No, InsertComment is inferred from insertCommentSchema which OMITTED postId.
      // So storage.createComment needs to take postId as argument? 
      // Let's check shared/schema.ts
      
      // shared/schema.ts:
      // export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, authorId: true, ipOctet: true, postId: true });
      // So InsertComment does NOT have postId.
      // But storage.createComment implementation:
      // async createComment(insertComment: InsertComment, authorId: string, ipOctet: string): Promise<Comment> {
      //   const [comment] = await db.insert(comments).values({ ...insertComment, authorId, ipOctet }).returning();
      // }
      // The values(...) call will fail if postId is missing because comments table has postId notNull.
      // I need to update storage.createComment signature or pass postId in.
      
      // Let's fix storage.ts in a subsequent edit or fix it here by casting/adding.
      // Actually, I should update storage.ts to accept postId.
      
      // For now, let's assume I'll fix storage.ts.
      // Wait, I can't modify storage.ts in this call as it is already being written.
      // I will overwrite storage.ts in a second call to fix this logic error.
      
      // Actually, I will just pass it in the spread if I fix storage.ts.
      
      // Let's finish routes.ts first assuming storage.createComment will handle it.
      // I will write a fixed storage.ts in the next step.

      // But wait, I can just write the CORRECT storage.ts now if I haven't sent the response yet.
      // I am generating the response now.
      
      // I will rewrite storage.ts content in my mind before sending.
      
      // FIXED storage.ts logic:
      // async createComment(postId: number, insertComment: InsertComment, authorId: string, ipOctet: string) ...
      
      const comment = await storage.createComment(postId, input, userId, ipOctet);
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Notifications
  app.get(api.notifications.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const notifications = await storage.getNotifications(userId);
    res.json(notifications);
  });

  app.patch(api.notifications.markRead.path, isAuthenticated, async (req: any, res) => {
    const notificationId = Number(req.params.id);
    await storage.markNotificationRead(notificationId);
    res.json({ success: true });
  });

  // Seed if needed
  seedDatabase();

  return httpServer;
}

// Seed function
export async function seedDatabase() {
  const posts = await storage.getPosts();
  if (posts.length === 0) {
    console.log("Database empty. Create a post after logging in!");
  }
}
