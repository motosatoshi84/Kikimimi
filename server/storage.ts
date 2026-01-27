import { db } from "./db";
import { posts, comments, notifications, type Post, type InsertPost, type Comment, type InsertComment, type Notification, type InsertNotification } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
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
    if (category) {
      return await db.select().from(posts).where(
        and(
          eq(posts.community, community),
          eq(posts.category, category)
        )
      ).orderBy(desc(posts.createdAt));
    }
    return await db.select().from(posts).where(eq(posts.community, community)).orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(insertPost: InsertPost, authorId: string, ipOctet: string): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({ ...insertPost, authorId, ipOctet })
      .returning();
    return post;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(comments.createdAt);
  }

  async createComment(postId: number, insertComment: InsertComment, authorId: string, ipOctet: string): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ...insertComment, postId, authorId, ipOctet })
      .returning();

    // Trigger notification
    const post = await this.getPost(postId);
    if (post && post.authorId !== authorId) {
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
