import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateCompact, formatDateWithoutDay } from "@/lib/date";
import { calculateReadTime } from "@/lib/string";
import { getOrm } from "@zro/db";
import { experiences as Experiences, posts as Posts } from "configs/db.schema";
import { useHead, useLoaderData } from "zro/react";
import { bio, projects } from "../data.json";

export const loader = async () => {
  return {
    posts: await getOrm().select().from(Posts).all(),
    experiences: await getOrm().select().from(Experiences).all(),
  };
};

export default function Homepage() {
  const loaderData = useLoaderData<Routes["/"]>();
  useHead({
    title: bio.name,
  });
  return (
    <div className="bg-zinc-900 w-full max-w-[1512px] min-h-[844px] flex justify-center">
      <Card className="bg-transparent border-0 w-[481px] mt-8">
        <CardContent className="p-0 flex flex-col gap-[42px]">
          {/* Profile Section */}
          <section className="flex flex-col w-full gap-4">
            <div className="flex w-full items-end justify-between">
              <div className="flex flex-col items-start gap-2.5">
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src="https://github.com/narixius.png"
                    alt={bio.name}
                  />
                  <AvatarFallback>NM</AvatarFallback>
                </Avatar>
                <h1 className="text-zinc-100 font-14-bold text-[length:var(--14-bold-font-size)] tracking-[var(--14-bold-letter-spacing)] leading-[var(--14-bold-line-height)]">
                  {bio.name}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-zinc-100 [&_svg]:w-4 [&_svg]:h-4">
                <a>
                  <svg
                    fill="currentColor"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Bluesky</title>
                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
                  </svg>
                </a>
                <a>
                  <svg
                    fill="currentColor"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>X</title>
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                <a>
                  <svg
                    fill="currentColor"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>GitHub</title>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </div>
            </div>

            <p className="w-full text-zinc-400 text-sm text-justify  ">
              Hi, I&apos;m a theme for Astro, a simple starter that you can use
              to create your website or blog. If you want to know more about how
              you can customize me, add more posts, and make it your own, click
              on the GitHub icon link below and it will take you to my repo.
            </p>
          </section>

          {/* Experiences Section */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[#f7f8fa] font-14-semibold text-[length:var(--14-semibold-font-size)] tracking-[var(--14-semibold-letter-spacing)] leading-[var(--14-semibold-line-height)]">
              Experiences
            </h2>
            <div className="flex flex-col gap-2">
              {loaderData.experiences.map((exp, index) => (
                <div key={index} className="text-xs text-justify space-x-1">
                  <span className={`text-zinc-600 min-w-18 inline-block`}>
                    {formatDateWithoutDay(
                      new Date((exp.startDate as unknown as number) * 1000)
                    )}{" "}
                    -{" "}
                    {exp.endDate
                      ? formatDateWithoutDay(
                          new Date((exp.endDate as unknown as number) * 1000)
                        )
                      : "Now"}
                  </span>
                  <span className={`text-zinc-400`}>{exp.company}</span>
                  <span className="text-zinc-400 leading-4">
                    {" "}
                    {exp.description}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[#f7f8fa] font-14-semibold text-[length:var(--14-semibold-font-size)] tracking-[var(--14-semibold-letter-spacing)] leading-[var(--14-semibold-line-height)]">
              Projects
            </h2>
            <div className="flex flex-col gap-2">
              {projects.map((project, index) => (
                <a
                  href="https://google.com"
                  key={index}
                  className="text-xs text-justify space-x-1"
                >
                  <span className={`text-zinc-600 min-w-18 inline-block`}>
                    {project.date}
                  </span>
                  <span className={`text-zinc-400`}>{project.title}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Posts Section */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[#f7f8fa] font-14-semibold text-[length:var(--14-semibold-font-size)] tracking-[var(--14-semibold-letter-spacing)] leading-[var(--14-semibold-line-height)]">
              Posts
            </h2>
            <div className="flex flex-col gap-2">
              {loaderData.posts.map((post, index) => (
                <a
                  href="https://google.com"
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
                </a>
              ))}
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="flex flex-col gap-2 w-full">
            <h2 className="text-[#f7f8fa] font-14-semibold text-[length:var(--14-semibold-font-size)] tracking-[var(--14-semibold-letter-spacing)] leading-[var(--14-semibold-line-height)]">
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
          </section>

          {/* Footer */}
          <footer className="text-xs text-justify">
            <span className="text-zinc-500 leading-4">Powered by </span>
            <span className="text-zinc-400">Z•RO</span>
            <span className="text-zinc-500 leading-4">, served on </span>
            <span className="text-zinc-400">Cloudflare</span>
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
