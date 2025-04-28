import { relations, type InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const bio = sqliteTable("bio", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
});
export const bioRelations = relations(bio, ({ one }) => ({
  author: one(users, {
    fields: [bio.userId],
    references: [users.id],
  }),
}));

export const socialMedias = sqliteTable("socialMedia", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
});
export const socialMediasRelations = relations(socialMedias, ({ one }) => ({
  author: one(users, {
    fields: [socialMedias.userId],
    references: [users.id],
  }),
}));

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  status: text("status", { enum: ["published", "draft"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const experiences = sqliteTable("experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyUrl: text("companyUrl"),
  startDate: integer("startDate", { mode: "timestamp" }).notNull(),
  endDate: integer("endDate", { mode: "timestamp" }),
  description: text("description").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
});
export const experiencesRelations = relations(experiences, ({ one }) => ({
  author: one(users, {
    fields: [experiences.userId],
    references: [users.id],
  }),
}));

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  url: text("url").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
});
export const projectsRelations = relations(projects, ({ one }) => ({
  author: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export type User = InferSelectModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type Experience = InferSelectModel<typeof experiences>;
export type Project = InferSelectModel<typeof projects>;
export type Bio = InferSelectModel<typeof bio>;
export type SocialMedia = InferSelectModel<typeof socialMedias>;
