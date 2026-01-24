import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations, and } from "drizzle-orm";

// Re-export auth models
export * from "./models/auth";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("others"),
  community: text("community").notNull().default("japan"),
  authorId: varchar("author_id").notNull(), // Links to auth users
  ipOctet: varchar("ip_octet").notNull(), // Last 2 octets of IP
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull(),
  authorId: varchar("author_id").notNull(), // Links to auth users
  ipOctet: varchar("ip_octet").notNull(), // Last 2 octets of IP
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Schemas
export const insertPostSchema = createInsertSchema(posts).extend({
  category: z.enum(["travel", "health", "food", "others"]),
  community: z.enum(["japan", "korea"]),
}).omit({ 
  id: true, 
  createdAt: true, 
  authorId: true, // Set by backend
  ipOctet: true   // Set by backend
});

export const insertCommentSchema = createInsertSchema(comments).omit({ 
  id: true, 
  createdAt: true, 
  authorId: true, // Set by backend
  ipOctet: true,  // Set by backend
  postId: true    // Passed in URL
});

// Types
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
