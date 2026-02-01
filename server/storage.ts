import { db } from "./db";
import { posts, comments, notifications, type Post, type InsertPost, type Comment, type InsertComment, type Notification, type InsertNotification } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  getPosts(community?: string, category?: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost, authorId: string, ipOctet: string): Promise<Post>;
  getComments(postId: number): Promise<Comment[]>;
  createComment(postId: number, comment: InsertComment, authorId: string, ipOctet: string): Promise<Comment>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Inherit auth storage methods
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  async getPosts(community: string = "japan", category?: string): Promise<Post[]> {
    const now = new Date();
    const archiveThreshold = 90 * 24 * 60 * 60 * 1000;
    const deleteThreshold = 120 * 24 * 60 * 60 * 1000;

    // Hard delete posts older than 120 days of inactivity
    await db.delete(posts).where(sql`last_activity_at < ${new Date(now.getTime() - deleteThreshold)}`);

    let query = db.select().from(posts).where(eq(posts.community, community));
    if (category) {
      query = db.select().from(posts).where(
        and(
          eq(posts.community, community),
          eq(posts.category, category)
        )
      );
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (post) {
      const now = new Date();
      const closeThreshold = 30 * 24 * 60 * 60 * 1000;
      const archiveThreshold = 90 * 24 * 60 * 60 * 1000;
      
      const inactiveTime = now.getTime() - new Date(post.lastActivityAt || post.createdAt!).getTime();
      
      let needsUpdate = false;
      const updateData: any = {};

      if (!post.isClosed && inactiveTime > closeThreshold) {
        updateData.isClosed = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const [updatedPost] = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
        return updatedPost;
      }
    }
    return post;
  }

  async createPost(insertPost: InsertPost, authorId: string, ipOctet: string): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({ ...insertPost, authorId, ipOctet, lastActivityAt: new Date() })
      .returning();
    return post;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(comments.createdAt);
  }

  async createComment(postId: number, insertComment: InsertComment, authorId: string, ipOctet: string): Promise<Comment> {
    const post = await this.getPost(postId);
    if (!post || post.isClosed) {
      throw new Error("Post is closed for new replies");
    }

    const [comment] = await db
      .insert(comments)
      .values({ ...insertComment, postId, authorId, ipOctet })
      .returning();

    // Update last activity and ensure it's open if it was archived (not closed)
    // Archive logic: archived is just "old activity". Replies re-open it.
    // However, the user said "Auto-close after 30 days of NO REPLIES".
    // And "Auto-archive after 90 days of no activity. Users can reply to the post and make it active again."
    // This implies archived posts can be replied to, but closed posts cannot.
    // So 30 days no replies = CLOSED. But 90 days no activity = ARCHIVED.
    // Wait, if it closes at 30 days, how can it reach 90 days and be replied to?
    // User probably meant:
    // 1. 30 days no replies -> Close (prevent new replies?) - No, usually "archive" means read-only.
    // Let's follow the prompt exactly:
    // "Auto-close after 30 days of no replies"
    // "Auto-archive after 90 days of no activity. Users can reply... and make it active again."
    // This means 90-day archive is NOT a hard close.
    // Maybe "Auto-close" means it doesn't show in main feed?
    // Let's assume:
    // 30 days no replies = isClosed = true (UI shows closed, maybe restricted)
    // 90 days no activity = Archive (UI badge) - Reply re-activates (sets isClosed = false, updates lastActivity)
    
    await db.update(posts)
      .set({ lastActivityAt: new Date(), isClosed: false })
      .where(eq(posts.id, postId));

    // Trigger notification
    if (post.authorId !== authorId) {
      await db.insert(notifications).values({
        userId: post.authorId,
        type: "reply",
        content: `Someone replied to your post: ${post.title.substring(0, 30)}${post.title.length > 30 ? "..." : ""}`,
        postId: postId,
        commentId: comment.id,
      });
    }

    return comment;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }
}

export const storage = new DatabaseStorage();
