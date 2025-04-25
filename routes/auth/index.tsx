import { guest } from "@zro/auth";

export const middlewares = [guest("/tasks")] as const;

export default function LoginPage() {
  return <a href="/auth/github"> sign in with github</a>;
}
