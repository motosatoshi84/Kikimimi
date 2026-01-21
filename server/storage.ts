import { db } from "./db";
import { posts, comments, type Post, type InsertPost, type Comment, type InsertComment } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  getPosts(category?: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost, authorId: string, ipOctet: string): Promise<Post>;
  getComments(postId: number): Promise<Comment[]>;
  createComment(postId: number, comment: InsertComment, authorId: string, ipOctet: string): Promise<Comment>;
}

export class DatabaseStorage implements IStorage {
  // Inherit auth storage methods
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  async getPosts(category?: string): Promise<Post[]> {
    let query = db.select().from(posts);
    if (category) {
      query = query.where(eq(posts.category, category)) as any;
    }
    return await query.orderBy(desc(posts.createdAt));
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
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async createComment(postId: number, insertComment: InsertComment, authorId: string, ipOctet: string): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ...insertComment, postId, authorId, ipOctet })
      .returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
