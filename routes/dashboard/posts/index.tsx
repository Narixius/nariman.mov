import { DashboardHeader } from "@/components/DashbaordHeader";
import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { posts, type Post } from "@/configs/db.schema";
import { formatDate } from "@/lib/date";
import { PopoverClose } from "@radix-ui/react-popover";
import type { ColumnDef } from "@tanstack/react-table";
import { getUser } from "@zro/auth";
import { getOrm } from "@zro/db";
import { eq } from "drizzle-orm";
import { Edit, PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAction, useLoaderData } from "zro/react";
import { Action } from "zro/router";

export const loader = async () => {
  return {
    posts: await getOrm().select().from(posts).all(),
  };
};

export const actions = {
  createPost: new Action({
    input: z.object({
      id: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
      title: z.string().min(1),
      content: z.string().min(1),
      publish: z.stringbool().optional().default(false),
    }),
    async handler({ id, content, title, publish }) {
      const user = getUser()!;
      await getOrm()
        .insert(posts)
        .values({
          id,
          content,
          title,
          userId: user.id,
          status: publish ? "published" : "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [posts.id],
          set: {
            content,
            title,
            status: publish ? "published" : "draft",
            updatedAt: new Date(),
          },
        });
      return { ok: true };
    },
  }),
  deletePost: new Action({
    input: z.object({
      id: z.coerce.number() as z.ZodNumber,
    }),
    async handler({ id }) {
      await await getOrm().delete(posts).where(eq(posts.id, id)).run();
      return { ok: true };
    },
  }),
};

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "title",
    header: "Title",
    maxSize: 200,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell({ row }) {
      const status = row.getValue("status") as string;
      const variant = { published: "success", draft: "inactive" }[status];
      return (
        <Badge variant={variant as "success" | "inactive"}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell({ row }) {
      return formatDate(row.original.createdAt);
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Modified At",
    cell({ row }) {
      return formatDate(row.original.updatedAt);
    },
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell({ table, row }) {
      const deletePostAction = (table.options.meta as any).deletePostAction;
      const setEditingPost = (table.options.meta as any).setEditingPost;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingPost(row.original)}
          >
            <Edit />
          </Button>
          <Popover key={row.original.id}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end">
              <span>Are you sure you want to delete this post?</span>
              <form
                {...deletePostAction.formProps}
                className="flex gap-2 mt-2 w-full"
              >
                <input type="hidden" name="id" value={row.original.id} />
                <PopoverClose asChild>
                  <Button
                    type="button"
                    className="flex-grow"
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </PopoverClose>
                <Button
                  type="submit"
                  className="flex-grow"
                  variant="destructive"
                  size="sm"
                  disabled={deletePostAction.isPending}
                >
                  {deletePostAction.isPending ? "Deleting..." : "Delete"}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
];

export default function PostsPage() {
  const { posts } = useLoaderData<Routes["/dashboard/posts/"]>();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const createOrUpdatePostAction = useAction("/dashboard/posts/", "createPost");

  useEffect(() => {
    if (!!createOrUpdatePostAction.data?.ok) {
      toast("Post created successfully");
      document.getElementById("drawer-close")?.click();
    }
  }, [createOrUpdatePostAction.data?.ok]);
  const deletePostAction = useAction("/dashboard/posts/", "deletePost");
  useEffect(() => {
    if (!!deletePostAction.data?.ok) {
      toast("Post deleted successfully");
    }
  }, [deletePostAction.data?.ok]);
  useEffect(() => {
    if (editingPost) {
      document.getElementById("open-drawer")?.click();
    }
  }, [editingPost]);

  const clearToasts = () => {
    toast.dismiss();
  };
  return (
    <div className="flex flex-col gap-2">
      <Drawer direction="right" onClose={() => setEditingPost(null)}>
        <DashboardHeader>
          <h1 className="text-zinc-100 font-14-bold text-xl">Posts</h1>
          <DrawerTrigger asChild>
            <Button size="sm" id="open-drawer" onClick={clearToasts}>
              <PlusIcon />
              Add Post
            </Button>
          </DrawerTrigger>
        </DashboardHeader>
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={posts}
            meta={{ deletePostAction, setEditingPost }}
          />
        </div>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingPost ? "Edit" : "New"} Post</DrawerTitle>
            <DrawerDescription>Create and share a new post.</DrawerDescription>
          </DrawerHeader>
          <form
            {...createOrUpdatePostAction.formProps}
            key={editingPost?.id}
            className="contents"
          >
            <div className="px-4 flex flex-col gap-4">
              {editingPost && (
                <input type="hidden" name="id" value={editingPost.id} />
              )}
              <div className="flex flex-col gap-1">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  aria-invalid={!!createOrUpdatePostAction.errors.title}
                  name="title"
                  id="title"
                  defaultValue={editingPost?.title}
                />
                {createOrUpdatePostAction.errors.title && (
                  <span className="text-red-500 text-sm">
                    {createOrUpdatePostAction.errors.title}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  aria-invalid={!!createOrUpdatePostAction.errors.content}
                  name="content"
                  id="content"
                  defaultValue={editingPost?.content}
                />
                {createOrUpdatePostAction.errors.content && (
                  <span className="text-red-500 text-sm">
                    {createOrUpdatePostAction.errors.content}
                  </span>
                )}
              </div>
              <div className="flex flex-row justify-between gap-1">
                <label htmlFor="publish" className="text-sm font-medium">
                  Save as published
                </label>
                <Switch
                  name="publish"
                  defaultChecked={
                    editingPost ? editingPost?.status === "published" : true
                  }
                />
              </div>
              {createOrUpdatePostAction.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createOrUpdatePostAction.errors.root}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DrawerFooter className="flex flex-row w-full">
              <Button
                type="submit"
                className="flex-grow"
                disabled={createOrUpdatePostAction.isPending}
              >
                {createOrUpdatePostAction.isPending ? "Saving..." : "Save"}
              </Button>
              <DrawerClose asChild id="drawer-close">
                <Button type="button" variant="outline" className="flex-grow">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
