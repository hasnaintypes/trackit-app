"use client";
import { useState } from "react";
import { Button } from "@ui/button";
import { Textarea } from "@ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import {
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { BlogComment } from "@/types/site";

interface CommentSectionProps {
  comments: BlogComment[];
}

export const CommentSection = ({ comments }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<BlogComment[]>(comments);
  const [showAll, setShowAll] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const placeholder: BlogComment = {
        id: `local-${Date.now()}`,
        author: { name: "You", avatar: "/images/avatars/avatar-1.jpeg" },
        content: newComment,
        timestamp: "Just now",
        likes: 0,
      };
      setLocalComments((s) => [placeholder, ...s]);
      setNewComment("");
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    }
  };

  const visibleComments = showAll ? localComments : localComments.slice(0, 3);

  return (
    <section>
      {/* Section header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
          <MessageCircle className="text-muted-foreground h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-foreground text-xl font-bold">Comments</h2>
          <p className="text-muted-foreground text-sm">
            {comments.length} {comments.length === 1 ? "response" : "responses"}
          </p>
        </div>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="flex gap-3">
          <Avatar className="mt-1 h-9 w-9 shrink-0">
            <AvatarImage src="/images/avatars/avatar-1.jpeg" alt="You" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              Y
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border-border bg-card focus:border-primary min-h-[100px] resize-none rounded-xl"
            />
            <div className="flex items-center justify-end gap-3">
              {justAdded && (
                <span className="text-muted-foreground animate-in fade-in text-sm">
                  Comment added
                </span>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim()}
                className="gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-1">
        {visibleComments.map((comment) => (
          <div
            key={comment.id}
            className="hover:bg-muted/50 rounded-xl px-1 py-5 transition-colors"
          >
            <div className="flex gap-3">
              <Avatar className="mt-0.5 h-9 w-9 shrink-0">
                <AvatarImage
                  src={comment.author.avatar}
                  alt={comment.author.name}
                />
                <AvatarFallback className="bg-muted text-xs font-medium">
                  {comment.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-foreground text-sm font-semibold">
                    {comment.author.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {comment.timestamp}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {comment.content}
                </p>

                <div className="mt-2 -ml-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary h-8 gap-1.5 px-2 text-xs"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {comment.likes > 0 && comment.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary h-8 px-2 text-xs"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less */}
      {localComments.length > 3 && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll((s) => !s)}
            className="text-muted-foreground gap-1.5"
          >
            {showAll ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show {localComments.length - 3} more{" "}
                {localComments.length - 3 === 1 ? "comment" : "comments"}
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
};
