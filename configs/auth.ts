import { users } from "@/configs/db.schema";
import { defineConfig } from "@zro/auth";
import { GithubProvider } from "@zro/auth/providers/github";
import { getOrm } from "@zro/db";
import { eq, inArray } from "drizzle-orm";
import { env } from "std-env";

declare module "@zro/auth" {
  export interface User {
    id: number;
    email: string;
    avatar?: string;
    name: string;
  }
}

export default defineConfig({
  authPrefix: "/auth",
  onLoginSuccessRedirect: "/dashboard",
  loginPage: "/auth",
  session: {
    password: env.APP_KEY!,
  },
  generateToken: (user) => {
    return JSON.stringify(user);
  },
  verifyToken(token) {
    try {
      return JSON.parse(token);
    } catch (e) {
      return null;
    }
  },
  providers: [
    new GithubProvider(
      {
        clientId: env.GITHUB_CLIENT_ID!,
        clientSecret: env.GITHUB_CLIENT_SECRET!,
        scopes: ["read:user", "user:email"],
      },
      {
        async authenticate({ access_token, fetchUser }) {
          const ghUser = await fetchUser();
          const userEmails = (await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          ).then((r) => r.json())) as {
            email: string;
            primary: boolean;
            verified: boolean;
          }[];
          const verifiedEmails = userEmails.filter((email) => email.verified);
          if (!verifiedEmails.length) throw new Error("Permission Denied");
          const orm = getOrm();
          const user = await orm
            .select()
            .from(users)
            .where(
              inArray(
                users.email,
                verifiedEmails.map((e) => e.email)
              )
            )
            .get();
          if (!user) throw new Error("Unauthorized");

          await orm
            .update(users)
            .set({
              avatar: ghUser.avatar_url,
              name: ghUser.name || "",
              updatedAt: new Date(),
            })
            .where(eq(users.id, user!.id))
            .execute();

          return {
            id: user.id,
            email: user.email,
            avatar: ghUser.avatar_url || user.avatar || undefined,
            name: user.name,
          };
        },
      }
    ),
  ],
});
