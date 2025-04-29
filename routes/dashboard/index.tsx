import { DashboardHeader } from "@/components/DashbaordHeader";
import { SocialMediaIcon } from "@/components/SocialMediaIcon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bio, socialMedias } from "@/configs/db.schema";
import { getUser } from "@zro/auth";
import { getOrm } from "@zro/db";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAction, useLoaderData } from "zro/react";
import { Action } from "zro/router";

export const loader = async () => {
  const user = getUser()!;
  return {
    bio: await getOrm().select().from(bio).where(eq(bio.userId, user.id)).get(),
    socialMedia: await getOrm()
      .select()
      .from(socialMedias)
      .where(eq(socialMedias.userId, user.id))
      .all(),
  };
};

export const actions = {
  updateBio: new Action({
    input: z.object({
      id: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
      name: z.string().min(1),
      avatar: z.string(),
      description: z.string().min(1),
    }),
    async handler({ id, name, avatar, description }) {
      const user = getUser()!;
      await getOrm()
        .insert(bio)
        .values({
          id,
          name,
          avatar,
          description,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [bio.id],
          set: {
            name,
            description,
            avatar,
            updatedAt: new Date(),
          },
        });
      return { ok: true };
    },
  }),
  updateSocialMedia: new Action({
    input: z.object({
      id: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
      platform: z.enum(["x", "bluesky", "github", "instagram"]),
      url: z.string().url(),
    }),
    async handler({ id, platform, url }) {
      const user = getUser()!;
      await getOrm()
        .insert(socialMedias)
        .values({
          id,
          platform,
          url,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [socialMedias.id],
          set: {
            platform,
            url,
            updatedAt: new Date(),
          },
        });
      return { ok: true };
    },
  }),
  deleteSocialMedia: new Action({
    input: z.object({
      id: z.coerce.number() as z.ZodNumber,
    }),
    async handler({ id }) {
      await getOrm().delete(socialMedias).where(eq(socialMedias.id, id)).run();
      return { ok: true };
    },
  }),
};

export default function Dashboard() {
  const { bio, socialMedia } = useLoaderData<Routes["/dashboard/"]>();
  const updateBioAction = useAction("/dashboard/", "updateBio");
  const updateSocialMediaAction = useAction("/dashboard/", "updateSocialMedia");
  const deleteSocialMediaAction = useAction("/dashboard/", "deleteSocialMedia");
  const errors = updateBioAction.errors;
  const socialMediaErrors = updateSocialMediaAction.errors;

  useEffect(() => {
    if (!!updateBioAction.data?.ok) {
      toast("Bio updated successfully");
    }
  }, [updateBioAction.data?.ok]);

  useEffect(() => {
    if (!!updateSocialMediaAction.data?.ok) {
      toast("Social media updated successfully");
    }
  }, [updateSocialMediaAction.data?.ok]);

  useEffect(() => {
    if (!!deleteSocialMediaAction.data?.ok) {
      toast("Social media deleted successfully");
    }
  }, [deleteSocialMediaAction.data?.ok]);

  return (
    <div className="flex flex-col gap-2">
      <DashboardHeader>
        <h1 className="text-zinc-100 font-14-bold text-xl">Dashboard</h1>
      </DashboardHeader>
      <div className="mt-4">
        {/* Bio Form */}
        <form
          {...updateBioAction.formProps}
          className="flex flex-col gap-4 max-w-xl"
        >
          {bio && <input type="hidden" name="id" value={bio.id} />}

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-white">
              Name
            </label>
            <Input
              aria-invalid={!!errors.name}
              name="name"
              id="name"
              defaultValue={bio?.name}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="avatar" className="text-sm font-medium text-white">
              Avatar URL
            </label>
            <Input
              aria-invalid={!!errors.avatar}
              name="avatar"
              id="avatar"
              defaultValue={bio?.avatar || ""}
            />
            {errors.avatar && (
              <span className="text-red-500 text-sm">{errors.avatar}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="description"
              className="text-sm font-medium text-white"
            >
              Description
            </label>
            <Textarea
              aria-invalid={!!errors.description}
              name="description"
              id="description"
              defaultValue={bio?.description}
              className="min-h-[100px]"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description}</span>
            )}
          </div>

          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={updateBioAction.isPending}
          >
            {updateBioAction.isPending ? "Saving..." : "Save Bio"}
          </Button>
        </form>

        {/* Social Media Section */}
        <div className="mt-8">
          <h2 className="text-zinc-100 font-14-bold text-lg mb-4">
            Social Media
          </h2>
          <div className="flex flex-col gap-4">
            <form
              {...updateSocialMediaAction.formProps}
              className="flex gap-4 max-w-xl"
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="platform"
                  className="text-sm font-medium text-white"
                >
                  Platform
                </label>
                <Select name="platform" defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x">X (Twitter)</SelectItem>
                    <SelectItem value="bluesky">Bluesky</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
                {socialMediaErrors.platform && (
                  <span className="text-red-500 text-sm">
                    {socialMediaErrors.platform}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="url" className="text-sm font-medium text-white">
                  URL
                </label>
                <Input
                  aria-invalid={!!socialMediaErrors.url}
                  name="url"
                  id="url"
                  placeholder="https://"
                />
                {socialMediaErrors.url && (
                  <span className="text-red-500 text-sm">
                    {socialMediaErrors.url}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                className="flex-grow mt-6"
                disabled={updateSocialMediaAction.isPending}
              >
                {updateSocialMediaAction.isPending ? "Saving..." : "Add"}
              </Button>
            </form>

            {socialMediaErrors.root && (
              <Alert variant="destructive" className="max-w-xl">
                <AlertDescription>{socialMediaErrors.root}</AlertDescription>
              </Alert>
            )}

            {/* List of existing social media */}
            {socialMedia.length > 0 && (
              <div className="mt-4 max-w-xl">
                {socialMedia.map((social) => (
                  <div
                    key={social.id}
                    className="flex items-center justify-between bg-zinc-900 rounded-lg"
                  >
                    <div className="[&>svg]:w-4 [&>svg]:h-4 flex items-center gap-2">
                      <SocialMediaIcon platform={social.platform} />
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-400 hover:text-zinc-300"
                      >
                        {social.url}
                      </a>
                    </div>
                    <form {...deleteSocialMediaAction.formProps}>
                      <input type="hidden" name="id" value={social.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400"
                        disabled={deleteSocialMediaAction.isPending}
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
