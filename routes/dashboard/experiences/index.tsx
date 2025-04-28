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
import { experiences, type Experience } from "@/configs/db.schema";
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
    experiences: await getOrm().select().from(experiences).all(),
  };
};

export const actions = {
  createExperience: new Action({
    input: z.object({
      id: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
      title: z.string().min(1),
      company: z.string().min(1),
      companyUrl: z.string(),
      startDate: z.coerce.date() as z.ZodDate,
      endDate: z.preprocess(
        (val) => (!val ? null : val),
        z.coerce.date().nullable()
      ) as unknown as z.ZodNullable<z.ZodDate>,
      description: z.string().min(1),
    }),
    async handler({
      id,
      company,
      companyUrl,
      description,
      endDate,
      startDate,
      title,
    }) {
      const user = getUser()!;
      await getOrm()
        .insert(experiences)
        .values({
          id,
          title,
          company,
          companyUrl,
          startDate,
          endDate,
          description,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [experiences.id],
          set: {
            title,
            company,
            companyUrl,
            startDate,
            endDate,
            description,
            userId: user.id,
            updatedAt: new Date(),
          },
        });
      return { ok: true };
    },
  }),
  deleteExperience: new Action({
    input: z.object({
      id: z.coerce.number() as z.ZodNumber,
    }),
    async handler({ id }) {
      await await getOrm()
        .delete(experiences)
        .where(eq(experiences.id, id))
        .run();
      return { ok: true };
    },
  }),
};

export const columns: ColumnDef<Experience>[] = [
  {
    accessorKey: "title",
    header: "Title",
    maxSize: 200,
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "description",
    header: "Description",
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
      const deleteExperienceAction = (table.options.meta as any)
        .deleteExperienceAction;
      const setEditingExperience = (table.options.meta as any)
        .setEditingExperience;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingExperience(row.original)}
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
              <span>Are you sure you want to delete this experience?</span>
              <form
                {...deleteExperienceAction.formProps}
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
                  disabled={deleteExperienceAction.isPending}
                >
                  {deleteExperienceAction.isPending ? "Deleting..." : "Delete"}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
];

export default function ExperiencesPage() {
  const { experiences } = useLoaderData<Routes["/dashboard/experiences/"]>();
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null
  );
  const createOrUpdateExperienceAction = useAction(
    "/dashboard/experiences/",
    "createExperience"
  );
  const errors = createOrUpdateExperienceAction.errors;
  useEffect(() => {
    if (!!createOrUpdateExperienceAction.data?.ok) {
      toast("Experience added");
      document.getElementById("drawer-close")?.click();
    }
  }, [createOrUpdateExperienceAction.data?.ok]);
  const deleteExperienceAction = useAction(
    "/dashboard/experiences/",
    "deleteExperience"
  );
  useEffect(() => {
    if (!!deleteExperienceAction.data?.ok) {
      toast("Experience deleted");
    }
  }, [deleteExperienceAction.data?.ok]);
  useEffect(() => {
    if (editingExperience) {
      document.getElementById("open-drawer")?.click();
    }
  }, [editingExperience]);

  const clearToasts = () => {
    toast.dismiss();
  };
  return (
    <div className="flex flex-col gap-2">
      <Drawer direction="right" onClose={() => setEditingExperience(null)}>
        <DashboardHeader>
          <h1 className="text-zinc-100 font-14-bold text-xl">Experiences</h1>
          <DrawerTrigger asChild>
            <Button size="sm" id="open-drawer" onClick={clearToasts}>
              <PlusIcon />
              Add Experience
            </Button>
          </DrawerTrigger>
        </DashboardHeader>
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={experiences}
            meta={{ deleteExperienceAction, setEditingExperience }}
          />
        </div>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingExperience ? "Edit" : "New"} Experience
            </DrawerTitle>
            <DrawerDescription>
              Create and share a new experience.
            </DrawerDescription>
          </DrawerHeader>
          <form
            {...createOrUpdateExperienceAction.formProps}
            key={editingExperience?.id}
            className="contents"
          >
            <div className="px-4 flex flex-col gap-4">
              {editingExperience && (
                <input type="hidden" name="id" value={editingExperience.id} />
              )}
              <div className="flex flex-col gap-1">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  aria-invalid={!!errors.title}
                  name="title"
                  id="title"
                  defaultValue={editingExperience?.title}
                />
                {errors.title && (
                  <span className="text-red-500 text-sm">{errors.title}</span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-grow w-full">
                  <label htmlFor="company" className="text-sm font-medium">
                    Company
                  </label>
                  <Input
                    aria-invalid={!!errors.company}
                    name="company"
                    id="company"
                    defaultValue={editingExperience?.company}
                  />
                  {errors.company && (
                    <span className="text-red-500 text-sm">
                      {errors.company}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-grow w-full">
                  <label htmlFor="companyUrl" className="text-sm font-medium">
                    Company URL
                  </label>
                  <Input
                    aria-invalid={!!errors.companyUrl}
                    name="companyUrl"
                    id="companyUrl"
                    defaultValue={editingExperience?.companyUrl || ""}
                  />
                  {errors.companyUrl && (
                    <span className="text-red-500 text-sm">
                      {errors.companyUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-grow w-full">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start date
                  </label>
                  <Input
                    aria-invalid={!!errors.startDate}
                    name="startDate"
                    id="startDate"
                    type="date"
                    defaultValue={
                      editingExperience?.startDate
                        ? format(
                            (editingExperience?.startDate as unknown as number) *
                              1000,
                            "yyyy-MM-dd"
                          )
                        : ""
                    }
                  />
                  {errors.startDate && (
                    <span className="text-red-500 text-sm">
                      {errors.startDate}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-grow w-full">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End date
                  </label>
                  <Input
                    aria-invalid={!!errors.endDate}
                    name="endDate"
                    id="endDate"
                    type="date"
                    defaultValue={
                      editingExperience?.endDate
                        ? new Date(
                            (editingExperience?.endDate as unknown as number) *
                              1000
                          ).toString()
                        : ""
                    }
                  />
                  {errors.endDate && (
                    <span className="text-red-500 text-sm">
                      {errors.endDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  aria-invalid={!!errors.description}
                  name="description"
                  id="description"
                  defaultValue={editingExperience?.description}
                />
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    {errors.description}
                  </span>
                )}
              </div>

              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root}</AlertDescription>
                </Alert>
              )}
            </div>
            <DrawerFooter className="flex flex-row w-full">
              <Button
                type="submit"
                className="flex-grow"
                disabled={createOrUpdateExperienceAction.isPending}
              >
                {createOrUpdateExperienceAction.isPending
                  ? "Saving..."
                  : "Save"}
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
