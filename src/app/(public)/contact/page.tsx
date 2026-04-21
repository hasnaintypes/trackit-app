"use client";

import { useState, useRef, useEffect } from "react";

import { motion, useInView } from "framer-motion";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Button } from "@ui/button";
import Earth from "@ui/globe";
import { SparklesCore } from "@ui/sparkles";
import { Label } from "@ui/label";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });

  const [themeHex, setThemeHex] = useState<string | null>(null);
  const [themeRgb, setThemeRgb] = useState<[number, number, number] | null>(
    null,
  );

  useEffect(() => {
    function resolveThemeColor() {
      try {
        const el = document.createElement("div");
        el.style.color = "var(--primary)";
        document.body.appendChild(el);
        const resolved = getComputedStyle(el).color;
        document.body.removeChild(el);

        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = resolved;
          ctx.fillRect(0, 0, 1, 1);
          const pixel = ctx.getImageData(0, 0, 1, 1).data;
          const r = pixel[0] ?? 0;
          const g = pixel[1] ?? 0;
          const b = pixel[2] ?? 0;
          const toHex = (v: number) => v.toString(16).padStart(2, "0");
          const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
          setThemeHex(hex);
          setThemeRgb([r / 255, g / 255, b / 255]);
          return;
        }
      } catch {
        // fall through to fallback
      }
      setThemeHex("#7c3aed");
      setThemeRgb([124 / 255, 58 / 255, 237 / 255]);
    }

    resolveThemeColor();

    const observer = new MutationObserver(() => resolveThemeColor());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success(data.message ?? "Message sent!");
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden">
      <div
        className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: `radial-gradient(circle at center, var(--primary), transparent 70%)`,
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full opacity-10 blur-[100px]"
        style={{
          background: `radial-gradient(circle at center, var(--primary), transparent 70%)`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-16 md:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left: Form */}
          <div ref={formRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex w-full items-center gap-2"
            >
              <h2 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                Contact
              </h2>
              <span className="text-primary relative z-10 text-4xl font-bold tracking-tight italic md:text-5xl">
                Us
              </span>
              <SparklesCore
                id="tsparticles"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={40}
                className="pointer-events-none absolute inset-0 top-0 z-30 h-24 w-full"
                particleColor={themeHex ?? "#e60a64"}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground mt-2 max-w-md text-base"
            >
              Have a question or feedback? We&apos;d love to hear from you. Fill
              out the form and we&apos;ll get back to you shortly.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </motion.div>
              </div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  required
                  className="h-44 resize-none"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-b from-[var(--primary)] to-[var(--primary)/70] text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.2)_inset]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : isSubmitted ? (
                    <span className="flex items-center justify-center">
                      <Check className="mr-2 h-4 w-4" />
                      Message Sent!
                    </span>
                  ) : (
                    <span>Send Message</span>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </div>

          {/* Right: Globe */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="hidden items-center justify-center md:flex"
          >
            <article className="relative mx-auto h-[480px] w-full max-w-[480px] overflow-hidden rounded-3xl border bg-gradient-to-b from-[var(--primary)] to-[var(--primary)/5] p-8 text-3xl tracking-tight text-white md:text-4xl md:leading-[1.05] lg:text-5xl">
              Presenting you with the best UI possible.
              <div className="absolute -right-24 -bottom-24 z-10 mx-auto flex h-full w-full max-w-[550px] items-center justify-center transition-all duration-700 hover:scale-105">
                <Earth
                  key={themeHex ?? "theme-default"}
                  scale={1.1}
                  baseColor={themeRgb ?? [1, 0, 0.3]}
                  markerColor={[0, 0, 0]}
                  glowColor={themeRgb ?? [1, 0.3, 0.4]}
                />
              </div>
            </article>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
