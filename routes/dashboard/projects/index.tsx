import { DashboardHeader } from "@/components/DashbaordHeader";
import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { projects, type Project } from "@/configs/db.schema";
import { formatDate } from "@/lib/date";
import { PopoverClose } from "@radix-ui/react-popover";
import type { ColumnDef } from "@tanstack/react-table";
import { getUser } from "@zro/auth";
import { getOrm } from "@zro/db";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { Edit, PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAction, useLoaderData } from "zro/react";
import { Action } from "zro/router";

export const loader = async () => {
  return {
    projects: await getOrm().select().from(projects).all(),
  };
};

export const actions = {
  createProject: new Action({
    input: z.object({
      id: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
      title: z.string().min(1),
      date: z.coerce.date() as z.ZodDate,
      url: z.string().min(1),
    }),
    async handler({ id, url, date, title }) {
      const user = getUser()!;
      await getOrm()
        .insert(projects)
        .values({
          id,
          url,
          title,
          date,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [projects.id],
          set: {
            url,
            title,
            date,
            updatedAt: new Date(),
          },
        });
      return { ok: true };
    },
  }),
  deleteProject: new Action({
    input: z.object({
      id: z.coerce.number() as z.ZodNumber,
    }),
    async handler({ id }) {
      await await getOrm().delete(projects).where(eq(projects.id, id)).run();
      return { ok: true };
    },
  }),
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "title",
    header: "Title",
    maxSize: 200,
  },
  {
    accessorKey: "url",
    header: "URL",
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
      const deleteProjectAction = (table.options.meta as any)
        .deleteProjectAction;
      const setEditingProject = (table.options.meta as any).setEditingProject;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingProject(row.original)}
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
              <span>Are you sure you want to delete this project?</span>
              <form
                {...deleteProjectAction.formProps}
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
                  disabled={deleteProjectAction.isPending}
                >
                  {deleteProjectAction.isPending ? "Deleting..." : "Delete"}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
];

export default function ProjectsPage() {
  const { projects } = useLoaderData<Routes["/dashboard/projects/"]>();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const createOrUpdateProjectAction = useAction(
    "/dashboard/projects/",
    "createProject"
  );

  useEffect(() => {
    if (!!createOrUpdateProjectAction.data?.ok) {
      toast("Project created successfully");
      document.getElementById("drawer-close")?.click();
    }
  }, [createOrUpdateProjectAction.data?.ok]);
  const deleteProjectAction = useAction(
    "/dashboard/projects/",
    "deleteProject"
  );
  useEffect(() => {
    if (!!deleteProjectAction.data?.ok) {
      toast("Project deleted successfully");
    }
  }, [deleteProjectAction.data?.ok]);
  useEffect(() => {
    if (editingProject) {
      document.getElementById("open-drawer")?.click();
    }
  }, [editingProject]);

  const clearToasts = () => {
    toast.dismiss();
  };
  return (
    <div className="flex flex-col gap-2">
      <Drawer direction="right" onClose={() => setEditingProject(null)}>
        <DashboardHeader>
          <h1 className="text-zinc-100 font-14-bold text-xl">Projects</h1>
          <DrawerTrigger asChild>
            <Button size="sm" id="open-drawer" onClick={clearToasts}>
              <PlusIcon />
              Add Project
            </Button>
          </DrawerTrigger>
        </DashboardHeader>
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={projects}
            meta={{ deleteProjectAction, setEditingProject }}
          />
        </div>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingProject ? "Edit" : "New"} Project</DrawerTitle>
            <DrawerDescription>
              Create and share a new project.
            </DrawerDescription>
          </DrawerHeader>
          <form
            {...createOrUpdateProjectAction.formProps}
            key={editingProject?.id}
            className="contents"
          >
            <div className="px-4 flex flex-col gap-4">
              {editingProject && (
                <input type="hidden" name="id" value={editingProject.id} />
              )}
              <div className="flex flex-col gap-1">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  aria-invalid={!!createOrUpdateProjectAction.errors.title}
                  name="title"
                  id="title"
                  defaultValue={editingProject?.title}
                />
                {createOrUpdateProjectAction.errors.title && (
                  <span className="text-red-500 text-sm">
                    {createOrUpdateProjectAction.errors.title}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="url" className="text-sm font-medium">
                  Project URL
                </label>
                <Input
                  aria-invalid={!!createOrUpdateProjectAction.errors.url}
                  name="url"
                  id="url"
                  defaultValue={editingProject?.url || ""}
                />
                {createOrUpdateProjectAction.errors.url && (
                  <span className="text-red-500 text-sm">
                    {createOrUpdateProjectAction.errors.url}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-grow w-full">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  aria-invalid={!!createOrUpdateProjectAction.errors.date}
                  name="date"
                  id="date"
                  type="date"
                  defaultValue={
                    editingProject?.date
                      ? format(
                          (editingProject?.date as unknown as number) * 1000,
                          "yyyy-MM-dd"
                        )
                      : ""
                  }
                />
                {createOrUpdateProjectAction.errors.date && (
                  <span className="text-red-500 text-sm">
                    {createOrUpdateProjectAction.errors.date}
                  </span>
                )}
              </div>

              {createOrUpdateProjectAction.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createOrUpdateProjectAction.errors.root}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DrawerFooter className="flex flex-row w-full">
              <Button
                type="submit"
                className="flex-grow"
                disabled={createOrUpdateProjectAction.isPending}
              >
                {createOrUpdateProjectAction.isPending ? "Saving..." : "Save"}
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
