import { defineConfig } from "drizzle-kit";
import { env } from "std-env";

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: env.TURSO_DB_URL!,
    authToken: env.TURSO_DB_AUTH_TOKEN!,
  },
  schema: "./configs/db.schema.ts",
  out: "./migrations",
});
