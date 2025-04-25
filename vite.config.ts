import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsConfigPath from "vite-tsconfig-paths";
import zro from "zro/unplugin";

export default defineConfig({
  plugins: [
    zro.vite({
      plugins: ["@zro/logger", "@zro/db", "@zro/auth"],
    }),
    tailwindcss(),
    tsConfigPath(),
  ],
});
