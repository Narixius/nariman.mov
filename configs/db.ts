import { defineConfig } from "@zro/db";
import libsql from "@zro/db/connectors/libsql/http";
import { env } from "std-env";

export default defineConfig({
  connector: libsql({
    url: env.TURSO_DB_URL!,
    authToken: env.TURSO_DB_AUTH_TOKEN!,
  }),
  orm: "drizzle",
});
