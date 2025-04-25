import { defineConfig } from "@zro/db";
import libsql from "@zro/db/connectors/libsql/http";

export default defineConfig({
  connector: libsql({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_AUTH_TOKEN!,
  }),
  orm: "drizzle",
});
