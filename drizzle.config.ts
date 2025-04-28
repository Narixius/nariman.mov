import { defineConfig } from "drizzle-kit";
import { env, process } from "std-env";

console.log(env.TURSO_DB_URL);
console.log(process.env.TURSO_DB_URL);

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: env.TURSO_DB_URL!,
    authToken: env.TURSO_DB_AUTH_TOKEN!,
  },
  schema: "./configs/db.schema.ts",
  out: "./migrations",
});
