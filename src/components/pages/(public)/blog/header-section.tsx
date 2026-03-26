import { Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Badge } from "@ui/badge";
import type { BlogPost } from "@/types/site";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/content/nav-links";

type BlogHeaderProps = {
  category: string;
  title: string;
  author: BlogPost["author"];
  publishedDate: string;
  onBack: () => void;
};

export const HeaderSection = ({
  category,
  title,
  author,
  publishedDate,
  onBack: _onBack,
}: BlogHeaderProps) => {
  return (
    <header className="space-y-6">
      {category && (
        <Badge variant="secondary" className="text-xs font-medium">
          {category}
        </Badge>
      )}

      <h1 className="text-foreground text-3xl leading-tight font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h1>

      <div className="border-border border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar className="ring-border h-11 w-11 ring-2 ring-offset-2">
              <AvatarImage
                src={author.avatar}
                alt={author.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {author.name}
              </p>
              <p className="text-muted-foreground text-xs">{publishedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground mr-1 text-[11px] font-medium tracking-widest uppercase">
              Share
            </span>
            {[
              { href: SOCIAL_LINKS.twitter, Icon: Twitter },
              { href: SOCIAL_LINKS.instagram, Icon: Instagram },
              { href: SOCIAL_LINKS.linkedin, Icon: Linkedin },
            ].map(({ href, Icon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
