import { SocialMediaIcon } from "@/components/SocialMediaIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateCompact, formatDateWithoutDay } from "@/lib/date";
import { calculateReadTime } from "@/lib/string";
import { getOrm } from "@zro/db";
import {
  bio,
  experiences,
  posts,
  projects,
  socialMedias,
} from "configs/db.schema";
import { desc } from "drizzle-orm";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { Link, useHead, useLoaderData } from "zro/react";

export const loader = async () => {
  return {
    bio: await getOrm().select().from(bio).get(),
    posts: await getOrm().select().from(posts).all(),
    experiences: await getOrm().select().from(experiences).all(),
    projects: await getOrm().select().from(projects).all(),
    socialMedias: await getOrm()
      .select()
      .from(socialMedias)
      .orderBy(desc(socialMedias.id))
      .all(),
  };
};

export default function Homepage() {
  const loaderData = useLoaderData<Routes["/"]>();
  useHead({
    title: loaderData.bio?.name,
    link: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
    ],
  });
  return (
    <div className="bg-zinc-900 w-full flex justify-center">
      <Card className="bg-transparent border-0 px-4 w-[510px] max-w-[510px] pt-8 pb-4 min-h-full">
        <CardContent className="p-0 flex flex-col justify-between min-h-full gap-12">
          {/* Profile Section */}
          <div className="flex flex-col gap-12">
            <section className="flex flex-col w-full gap-4">
              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col items-start gap-2.5">
                  <Avatar className="w-14 h-14">
                    <AvatarImage
                      src={loaderData.bio?.avatar || ""}
                      alt={loaderData.bio?.name}
                    />
                    <AvatarFallback>NM</AvatarFallback>
                  </Avatar>
                  <h1 className="text-zinc-100 font-14-bold text-[length:var(--14-bold-font-size)] tracking-[var(--14-bold-letter-spacing)] leading-[var(--14-bold-line-height)]">
                    {loaderData.bio?.name}
                  </h1>
                </div>

                <div className="flex items-center gap-3 text-zinc-100 [&_svg]:w-4 [&_svg]:h-4">
                  {loaderData.socialMedias.map((socialMedia, index) => {
                    return (
                      <a
                        key={index}
                        href={socialMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SocialMediaIcon platform={socialMedia.platform} />
                      </a>
                    );
                  })}
                </div>
              </div>

              <p className="w-full text-zinc-400 text-sm text-justify  ">
                {loaderData.bio?.description}
              </p>
            </section>

            {/* Experiences Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[#f7f8fa] text-sm">Experiences</h2>
              <div className="flex flex-col gap-2">
                {loaderData.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="text-xs text-justify space-x-1 flex items-center gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-zinc-600 min-w-18 inline-block`}>
                        {formatDateWithoutDay(
                          new Date((exp.startDate as unknown as number) * 1000)
                        )}{" "}
                        -{" "}
                        {exp.endDate
                          ? formatDateWithoutDay(
                              new Date(
                                (exp.endDate as unknown as number) * 1000
                              )
                            )
                          : "Now"}
                      </span>
                      <span className="text-zinc-400 leading-4">
                        {" "}
                        {exp.title}
                      </span>
                    </div>
                    {exp.companyUrl ? (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        className="text-zinc-400 underline underline-offset-2"
                      >
                        <span className="leading-4">{exp.company}</span>
                      </a>
                    ) : (
                      <span className="text-zinc-400 leading-4">
                        {exp.company}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Projects Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[#f7f8fa] text-sm">Projects</h2>
              <div className="flex flex-col gap-2">
                {loaderData.projects.map((project, index) => (
                  <div
                    className="text-xs flex items-center gap-2 justify-between"
                    key={index}
                  >
                    <div className="flex gap-1 items-center ">
                      <span className={`text-zinc-600 min-w-18 inline-block`}>
                        {formatDateCompact(
                          new Date((project.date as unknown as number) * 1000)
                        )}
                      </span>
                      <span className={`text-zinc-400`}>{project.title}</span>
                    </div>
                    <a
                      href={project.url}
                      rel="noopener noreferrer"
                      className="text-justify space-x-1"
                      target="_blank"
                    >
                      <SquareArrowOutUpRightIcon className="w-3 h-3 text-zinc-500" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Posts Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[#f7f8fa] text-sm">Posts</h2>
              <div className="flex flex-col gap-2">
                {loaderData.posts.map((post, index) => (
                  <Link
                    href={`/posts/${post.id}`}
                    key={index}
                    className="text-xs text-justify space-x-1 flex justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-zinc-600 min-w-18 inline-block`}>
                        {formatDateCompact(post.createdAt)}
                      </span>
                      <span className={`text-zinc-400`}>{post.title}</span>
                    </div>
                    <div className="text-zinc-500 text-xs whitespace-nowrap">
                      {calculateReadTime(post.content)} min
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Newsletter Section */}
            {/* <section className="flex flex-col gap-2 w-full">
            <h2 className="text-[#f7f8fa] font-14-semibold text-sm">
              Newsletter
            </h2>
            <p className="text-zinc-400 text-sm  ">
              Join my newsletter to subscribe to my posts
            </p>
            <div className="flex gap-1">
              <Input
                className="rounded-none w-[183px] h-7 px-2.5 py-1.5 bg-zinc-900 border-[#a1a5ae59] text-zinc-500 text-sm  "
                placeholder="name@email.com"
              />
              <Button className="font-normal text-xs w-[82px] h-7 px-[39px] py-1.5 bg-zinc-900 border border-solid border-[#a1a5ae59] text-zinc-500 rounded-none">
                Subsribe
              </Button>
            </div>
          </section> */}
          </div>
          {/* Footer */}
          <footer className="text-xs text-justify">
            <span className="text-zinc-500 leading-4">Powered by </span>
            <Button
              variant="link"
              asChild
              size="sm"
              className="px-0 text-xs h-auto"
            >
              <Link href="https://github.com/zrojs/zro">
                <span className="text-zinc-400">Z•RO</span>
              </Link>
            </Button>
            <span className="text-zinc-500 leading-4">, served on </span>
            <span className="text-zinc-400">
              <Button
                variant="link"
                asChild
                size="sm"
                className="px-0 text-xs h-auto"
              >
                <Link href="https://cloudflare.com">
                  <span className="text-zinc-400">Cloudflare</span>
                </Link>
              </Button>
            </span>
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
