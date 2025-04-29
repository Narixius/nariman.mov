import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { guest } from "@zro/auth";
import { useGithubButtonState } from "@zro/auth/providers/github/react";
import { Github } from "lucide-react";
import { useHead, useNavigate } from "zro/react";

export const middlewares = [guest("/dashboard")] as const;

export default function LoginPage() {
  const { url } = useNavigate();
  useHead({
    title: `Login to ${new URL(url).host}`,
  });
  const githubState = useGithubButtonState();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-transparent min-w-xs">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            className="w-full max-w-xs gap-2"
            variant="outline"
            size="lg"
            asChild
            disabled={githubState.isPending}
          >
            <a href="/auth/github">
              <Github className="h-5 w-5" />
              {githubState.isPending ? "Logging in..." : "Login with GitHub"}
            </a>
          </Button>
          {githubState.errors.root && (
            <div className="text-red-500">{githubState.errors.root}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
