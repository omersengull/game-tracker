import { pgTable, uuid, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  rawgId: integer("rawg_id").notNull().unique(),
  name: text("name").notNull(),
  coverUrl: text("cover_url"),
  releaseDate: text("release_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userGames = pgTable("user_games", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  gameId: uuid("game_id").notNull().references(() => games.id),
  status: text("status").notNull(), // "played" | "playing" | "backlog" | "dropped"
  rating: integer("rating"),        // 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserGame: unique().on(table.userId, table.gameId),
}));

export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: uuid("follower_id").notNull().references(() => users.id),
  followingId: uuid("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueFollow: unique().on(table.followerId, table.followingId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userGames: many(userGames),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  userGames: many(userGames),
}));

export const userGamesRelations = relations(userGames, ({ one }) => ({
  user: one(users, { fields: [userGames.userId], references: [users.id] }),
  game: one(games, { fields: [userGames.gameId], references: [games.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { relationName: "follower", fields: [follows.followerId], references: [users.id] }),
  following: one(users, { relationName: "following", fields: [follows.followingId], references: [users.id] }),
}));