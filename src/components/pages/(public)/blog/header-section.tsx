import { Facebook, Twitter, Linkedin } from "lucide-react";
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
      <Badge variant="outline">{category}</Badge>

      <h1 className="text-foreground text-4xl leading-15 font-bold tracking-tight md:text-4xl lg:text-5xl">
        {title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={author.avatar}
              alt={author.name}
              className="object-cover"
            />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">by {author.name}</p>
            <p className="text-muted-foreground text-sm">{publishedDate}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            Share this
          </span>
          <Link
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-blog-hover h-9 w-9 rounded-full"
            >
              <Twitter />
            </Button>
          </Link>
          <Link
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-blog-hover h-9 w-9 rounded-full"
            >
              <Facebook />
            </Button>
          </Link>
          <Link
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-blog-hover h-9 w-9 rounded-full"
            >
              <Linkedin />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
