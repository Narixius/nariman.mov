import { Button } from "@/components/ui/button";
import { posts } from "@/configs/db.schema";
import { getOrm } from "@zro/db";
import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { Suspense, use } from "react";
import Markdown from "react-markdown";
import {
  Link,
  useHead,
  useLoaderData,
  type ErrorBoundaryProps,
} from "zro/react";
import { abort, getRequest } from "zro/router";

export const loader = async () => {
  const { params } = getRequest();
  const id = parseInt(params.id);
  if (isNaN(id) || !id) {
    throw abort(404, "Post not found");
  }

  return {
    post: getOrm().select().from(posts).where(eq(posts.id, id)).get(),
  };
};
export default function PostPage() {
  return (
    <div className="px-4 w-[510px] max-w-[510px] mx-auto py-8 flex flex-col gap-4">
      <Suspense fallback={<PostLoader />}>
        <PostContent />
      </Suspense>
      <div className="flex items-start mt-2">
        <Button variant="link" className="px-0!" asChild>
          <Link href="/">
            <ChevronLeft />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}

function PostContent() {
  const loaderData = useLoaderData<Routes["/posts/:id/"]>();
  const post = use(loaderData.post);

  if (!post) throw abort(404, "Post not found");

  useHead({
    title: post.title,
    titleTemplate: (title) => `${title} - nariman.mov`,
  });
  return (
    <>
      <h1 className="text-3xl font-semibold">{post.title}</h1>
      {post.banner && (
        <img
          src={post.banner}
          alt={post.title}
          className="w-full object-cover mt-4 rounded-md aspect-[510/256]"
        />
      )}
      <div className="flex flex-col gap-4">
        <Markdown>{post.content}</Markdown>
      </div>
    </>
  );
}

function PostLoader() {
  return (
    <>
      <div className="h-9 animate-pulse bg-zinc-700 w-1/2 rounded-md"></div>
      <div className="w-full object-cover mt-4 rounded-md aspect-[510/256] animate-pulse bg-zinc-700" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 mt-1">
          <div className="h-4 animate-pulse bg-zinc-700 w-full rounded-md"></div>
          <div className="h-4 animate-pulse bg-zinc-700 w-full rounded-md"></div>
          <div className="h-4 animate-pulse bg-zinc-700 w-full rounded-md"></div>
          <div className="h-4 animate-pulse bg-zinc-700 w-full rounded-md"></div>
          <div className="h-4 animate-pulse bg-zinc-700 w-1/3 rounded-md"></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-4 animate-pulse bg-zinc-700 w-full rounded-md"></div>
          <div className="h-4 animate-pulse bg-zinc-700 w-1/2 rounded-md"></div>
        </div>
      </div>
    </>
  );
}

export const ErrorBoundary = ({ error }: ErrorBoundaryProps) => {
  console.log(error.message);
  return "error!";
};
