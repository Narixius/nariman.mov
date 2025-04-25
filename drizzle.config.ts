import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_AUTH_TOKEN!,
  },
  schema: "./configs/db.schema.ts",
  out: "./migrations",
});
