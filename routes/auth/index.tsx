import { guest } from "@zro/auth";
import { useGithubButtonState } from "@zro/auth/providers/github/react";
import { useHead } from "zro/react";
export const middlewares = [guest("/tasks")] as const;

export default function LoginPage() {
  useHead({
    title: "Login to dashboard",
  });
  const githubState = useGithubButtonState();
  if (githubState.isPending) return "Logging in...";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <a href="/auth/github">
        <span>Login with github</span>
      </a>
      {githubState.errors.root && (
        <div className="text-red-500">{githubState.errors.root}</div>
      )}
    </div>
  );
}
