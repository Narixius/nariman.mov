import { Toaster } from "@/components/ui/sonner";
import { Outlet, useHead } from "zro/react";
import styles from "./styles.css?url";

export default function RootLayout() {
  useHead({
    link: [
      {
        rel: "stylesheet",
        href: styles,
      },
    ],
  });
  return (
    <div className="bg-zinc-900 text-zinc-300 flex flex-row justify-center w-full min-h-screen">
      <Outlet />
      <Toaster closeButton />
    </div>
  );
}

export const ErrorBoundary = () => {
  return "error!";
};
