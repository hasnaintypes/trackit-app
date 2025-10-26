import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { changelog } from "@/content/site/changelog";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen p-4 pt-16">
      <header
        className="relative overflow-hidden rounded-xl p-8 text-center text-white shadow-lg md:p-16 lg:p-20"
        style={{
          background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
          color: `var(--primary-foreground)`,
        }}
      >
        <div className="relative z-10 mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            What&apos;s new?
          </h1>
          <p className="text-lg text-balance opacity-80 sm:text-xl">
            A rundown of the latest Phosphorus feature releases, product
            enhancements, design updates and important bug fixes.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12">
          {changelog.entries.map((entry) => (
            <section
              key={entry.version}
              className="grid gap-4 md:grid-cols-[120px_1fr] md:gap-8"
            >
              <div className="text-muted-foreground mt-1 text-sm md:text-right">
                {entry.date}
              </div>
              <div className="grid gap-4">
                <h2 className="text-2xl font-bold">Version {entry.version}</h2>

                <div className="flex flex-wrap gap-2">
                  {(entry.badges ?? []).map((b) => (
                    <Badge
                      key={b}
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--accent) 20%, transparent)",
                        color: "var(--accent-foreground)",
                      }}
                    >
                      {b}
                    </Badge>
                  ))}
                </div>

                {entry.improvements && (
                  <div className="grid gap-2">
                    <h3 className="text-lg font-semibold">Improvements</h3>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                      {entry.improvements.map((imp) => (
                        <li key={imp}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.bugfixes && (
                  <div className="grid gap-2">
                    <h3 className="text-lg font-semibold">Bugfixes</h3>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                      {entry.bugfixes.map((bfix) => (
                        <li key={bfix}>{bfix}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.newFeatures && (
                  <div className="grid gap-2">
                    <h3 className="text-lg font-semibold">New Features</h3>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                      {entry.newFeatures.map((nf) => (
                        <li key={nf}>{nf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.image && (
                  <Image
                    src={entry.image.src}
                    alt={entry.image.alt ?? ""}
                    width={entry.image.width ?? 800}
                    height={entry.image.height ?? 600}
                    className="mt-4 rounded-lg border object-cover shadow-sm"
                  />
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
