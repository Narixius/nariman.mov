import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@zro/auth";
import { Unlink } from "lucide-react";
import type { FC, PropsWithChildren } from "react";
import { Outlet, useHead, type ErrorBoundaryProps } from "zro/react";

export const middlewares = [auth()] as const;

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="w-full flex flex-row justify-center min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-grow w-full p-4">{children}</div>
      </SidebarProvider>
    </div>
  );
};

export default function DashboardLayout() {
  useHead({
    titleTemplate(title) {
      return title ? `${title} - Dashboard` : "Dashboard";
    },
  });
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center min-h-full">
      <Unlink />
      {props.error?.message?.toLowerCase().includes("page not found")
        ? "Page not found"
        : "error asdf !"}
    </div>
  );
};
