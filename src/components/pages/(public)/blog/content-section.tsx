/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypePrism from "rehype-prism-plus";
import { defaultSchema } from "hast-util-sanitize";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/site";

interface BlogContentProps {
  content: BlogPost["content"];
  coverImage?: string;
}

export const ContentSection = ({
  content = [],
  coverImage,
}: BlogContentProps) => {
  const isExternal = coverImage ? /^https?:\/\//.test(coverImage) : false;
  const markdown = Array.isArray(content) ? content.join("\n\n") : "";

  const normalizeMarkdown = (md: string) => {
    const lines = (md ?? "").split(/\r?\n/);

    while (lines.length > 0 && (lines[0] ?? "").trim() === "") lines.shift();
    while (lines.length > 0 && (lines[lines.length - 1] ?? "").trim() === "")
      lines.pop();

    const indents = lines
      .filter((l) => l.trim())
      .map((l) => {
        const m = /^[ ]*/.exec(l);
        return (m ?? [""])[0].length;
      });
    const minIndent = indents.length ? Math.min(...indents) : 0;
    if (minIndent > 0)
      return lines
        .map((l) =>
          l.startsWith(" ".repeat(minIndent)) ? l.slice(minIndent) : l,
        )
        .join("\n");
    return lines.join("\n");
  };

  const normalizedMarkdown = normalizeMarkdown(markdown);
  const fixIndentedImages = (md: string) => {
    const lines = md.split(/\r?\n/);
    let inFence = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      if (line.startsWith("```")) {
        inFence = !inFence;
        continue;
      }
      if (inFence) continue;
      if (/^[ ]{4,}!\[.*\]\(.*\)\s*$/.test(line)) {
        lines[i] = line.replace(/^[ ]{1,4}/, "");
      }
    }
    return lines.join("\n");
  };

  const finalMarkdown = fixIndentedImages(normalizedMarkdown);

  const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
      ...(defaultSchema.attributes ?? {}),
      iframe: [
        "src",
        "width",
        "height",
        "frameborder",
        "allow",
        "allowfullscreen",
      ],
      "*": [
        ...(defaultSchema.attributes?.["*"] ?? []),
        "className",
        /^(data-).*$/,
      ],
    },
  } as unknown as Record<string, unknown>;

  const CodeBlock: React.FC<{
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }> = ({ inline, className, children, ...rest }) => {
    const [copied, setCopied] = useState(false);

    const extractText = (node: unknown): string => {
      if (node == null) return "";
      if (typeof node === "string" || typeof node === "number")
        return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (React.isValidElement(node)) {
        const elem = node as React.ReactElement<{ children?: React.ReactNode }>;
        return extractText(elem.props.children ?? "");
      }
      return "";
    };

    let code = extractText(children).replace(/\r?\n$/, "");

    code = code.replace(/^[\r\n]+/, "");
    const codeLines = code.split(/\r?\n/);
    const nonEmpty = codeLines.filter((l) => l.trim().length > 0);
    const indents = nonEmpty.map((l) => {
      const m = /^[ ]*/.exec(l);
      return (m ?? [""])[0].length;
    });
    const minIndent = indents.length ? Math.min(...indents) : 0;
    if (minIndent > 0) {
      code = codeLines
        .map((l) =>
          l.startsWith(" ".repeat(minIndent)) ? l.slice(minIndent) : l,
        )
        .join("\n");
    }
    const match = /language-(\w+)/.exec(className ?? "");
    const lang = match ? match[1] : undefined;

    useEffect(() => {
      if (!copied) return;
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }, [copied]);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
      } catch {
        toast.error("Unable to copy");
      }
    };

    if (inline) {
      return (
        <code
          className="bg-muted/4 rounded px-1 py-0.5"
          {...(rest as Record<string, unknown>)}
        >
          {children}
        </code>
      );
    }

    return (
      <>
        <div className="relative my-1">
          <button
            className="code-copy-btn"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
            title={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          <div className="overflow-auto rounded-md bg-transparent">
            <div className="w-full overflow-auto rounded-lg bg-transparent">
              <pre
                className={`language-${lang ?? ""} w-full overflow-auto rounded-lg p-2`}
              >
                <code
                  className={`${className ?? ""}`}
                  {...(rest as Record<string, unknown>)}
                >
                  {children}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <article className="space-y-8">
      {coverImage && (
        <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={coverImage}
            alt="Blog cover"
            fill
            className="object-cover"
            unoptimized={isExternal}
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, sanitizeSchema],
            rehypePrism,
          ]}
          components={{
            h1: (props) => <h1 className="text-2xl font-bold" {...props} />,
            h2: (props) => (
              <h2 className="mt-4 text-xl font-semibold" {...props} />
            ),
            h3: (props) => (
              <h3 className="mt-3 text-lg font-medium" {...props} />
            ),
            p: (props) => (
              <p
                className="text-blog-content mb-6 leading-relaxed"
                {...props}
              />
            ),
            ul: (props) => (
              <ul className="ml-6 list-disc space-y-2" {...props} />
            ),
            ol: (props) => (
              <ol className="ml-6 list-decimal space-y-2" {...props} />
            ),
            table: (props: React.TableHTMLAttributes<HTMLTableElement>) => {
              const { children, className, ...rest } = props;
              return (
                <div className="border-border overflow-auto rounded-md border">
                  <table
                    className={`w-full min-w-[560px] table-auto text-sm ${className ?? ""}`}
                    {...rest}
                  >
                    {children}
                  </table>
                </div>
              );
            },
            thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
              <thead className="bg-muted/6 sticky top-0" {...props} />
            ),
            tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
              <tr className="odd:bg-muted/4" {...props} />
            ),
            th: (props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => {
              const { children, className, ...rest } = props;
              return (
                <th
                  className={`bg-muted/8 border-border border-b px-4 py-2 text-left text-sm font-medium ${className ?? ""}`}
                  {...rest}
                >
                  {children}
                </th>
              );
            },
            td: (props: React.TdHTMLAttributes<HTMLTableDataCellElement>) => {
              const { children, className, ...rest } = props;
              return (
                <td
                  className={`border-border border-b px-4 py-2 align-top text-sm ${className ?? ""}`}
                  {...rest}
                >
                  {children}
                </td>
              );
            },
            input: (props) => (
              <input className="mr-2 align-middle" type="checkbox" {...props} />
            ),
            a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
              const { href, children, ...rest } = props;
              const hrefStr: string | undefined =
                typeof href === "string" ? href : undefined;
              const isInternal = hrefStr?.startsWith("/");
              if (isInternal) {
                return (
                  <Link href={hrefStr!}>
                    <a
                      className="text-primary underline"
                      {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                    >
                      {children}
                    </a>
                  </Link>
                );
              }
              return (
                <a
                  href={hrefStr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                  {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                  {children}
                </a>
              );
            },
            img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
              const { src, alt, ...rest } = props;
              const isExternal =
                typeof src === "string" && /^https?:\/\//.test(src);

              if (isExternal) {
                return (
                  <span className="my-4 block w-full overflow-hidden rounded">
                    <img
                      src={src}
                      alt={alt ?? ""}
                      className="h-48 w-full rounded-md object-cover"
                      {...(rest as unknown as Record<string, unknown>)}
                    />
                  </span>
                );
              }

              return (
                <span className="relative my-4 block w-full overflow-hidden rounded">
                  <Image
                    src={src as string}
                    alt={alt ?? ""}
                    fill
                    className="object-cover"
                    unoptimized={false}
                    {...(rest as unknown as Record<string, unknown>)}
                  />
                </span>
              );
            },
            code: CodeBlock,
          }}
        >
          {finalMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  );
};
