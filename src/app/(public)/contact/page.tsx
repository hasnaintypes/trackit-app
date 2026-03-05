"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Earth from "@/components/ui/globe";
import { SparklesCore } from "@/components/ui/sparkles";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

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
    try {
      const root = getComputedStyle(document.documentElement);
      const primary = root.getPropertyValue("--primary").trim() || "#e60a64";

      const el = document.createElement("div");
      el.style.color = "var(--primary)";
      document.body.appendChild(el);
      const resolved = getComputedStyle(el).color;
      document.body.removeChild(el);

      const reRgb =
        /rgba?\(\s*(\d+(?:\.\d+)?)(?:%?)[,\s]+(\d+(?:\.\d+)?)(?:%?)[,\s]+(\d+(?:\.\d+)?)(?:%?)(?:\s*\/\s*(\d+(?:\.\d+)?))?\s*\)/i;
      const m = reRgb.exec(resolved);
      if (m) {
        const parseComponent = (v: string) => {
          const num = Number(v);
          if (num > 1) return Math.round(num);
          return Math.round(num * 255);
        };

        const r = parseComponent(m[1]!);
        const g = parseComponent(m[2]!);
        const b = parseComponent(m[3]!);
        const toHex = (v: number) => v.toString(16).padStart(2, "0");
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        setThemeHex(hex);
        setThemeRgb([r / 255, g / 255, b / 255]);
        console.debug("theme resolved rgb", { primary, resolved, hex });
      } else {
        const maybeHex = primary.trim();
        if (/^#([0-9a-f]{3,8})$/i.test(maybeHex)) {
          const expand = (h: string) =>
            h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
          const hex = expand(maybeHex);

          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          setThemeHex(hex);
          setThemeRgb([r / 255, g / 255, b / 255]);
          console.debug("theme resolved hex fallback", {
            primary: maybeHex,
            hex,
          });
        } else {
          setThemeHex("#7c3aed");
          setThemeRgb([124 / 255, 58 / 255, 237 / 255]);
          console.debug("theme resolved fallback used", { primary, resolved });
        }
      }
    } catch (e) {
      setThemeHex("#7c3aed");
      setThemeRgb([124 / 255, 58 / 255, 237 / 255]);
      console.debug("theme resolution error", e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Form submitted:", { name, email, message });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background relative w-full overflow-hidden py-16 md:py-24">
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

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="border-border/40 bg-secondary/20 mx-auto max-w-5xl overflow-hidden rounded-[28px] border shadow-xl backdrop-blur-sm">
          <div className="grid md:grid-cols-2">
            <div className="relative p-6 md:p-10" ref={formRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative flex w-full items-center gap-2"
              >
                <h2 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                  Contact
                </h2>
                <span className="text-primary relative z-10 w-full text-4xl font-bold tracking-tight italic md:text-5xl">
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

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    placeholder="Enter your message"
                    required
                    className="h-40 resize-none"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative my-8 flex items-center justify-center overflow-hidden pr-8"
            >
              <div className="flex flex-col items-center justify-center overflow-hidden">
                <article className="relative mx-auto h-[350px] min-h-60 max-w-[450px] overflow-hidden rounded-3xl border bg-gradient-to-b from-[var(--primary)] to-[var(--primary)/5] p-6 text-3xl tracking-tight text-white md:h-[450px] md:min-h-80 md:p-8 md:text-4xl md:leading-[1.05] lg:text-5xl">
                  Presenting you with the best UI possible.
                  <div className="absolute -right-20 -bottom-20 z-10 mx-auto flex h-full w-full max-w-[300px] items-center justify-center transition-all duration-700 hover:scale-105 md:-right-28 md:-bottom-28 md:max-w-[550px]">
                    <Earth
                      key={themeHex ?? "theme-default"}
                      scale={1.1}
                      baseColor={themeRgb ?? [1, 0, 0.3]}
                      markerColor={[0, 0, 0]}
                      glowColor={themeRgb ?? [1, 0.3, 0.4]}
                    />
                  </div>
                </article>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <b className="text-muted-foreground text-sm font-semibold uppercase">
            Contact Us
          </b>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
            Get In Touch
          </h2>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            Our friendly team is always here to chat.
          </p>
          <div className="mx-auto grid max-w-(--breakpoint-xl) gap-16 px-6 py-24 md:grid-cols-2 md:gap-10 md:px-0 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/5 dark:bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <MailIcon />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Email</h3>
              <p className="text-muted-foreground mt-2">
                Our friendly team is here to help.
              </p>
              <Link
                className="text-primary mt-4 font-medium"
                href="mailto:akashmoradiya3444@gmail.com"
              >
                akashmoradiya3444@gmail.com
              </Link>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/5 dark:bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <MapPinIcon />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Office</h3>
              <p className="text-muted-foreground mt-2">
                Come say hello at our office HQ.
              </p>
              <Link
                className="text-primary mt-4 font-medium"
                href="https://map.google.com"
                target="_blank"
              >
                100 Smith Street Collingwood <br /> VIC 3066 AU
              </Link>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/5 dark:bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <PhoneIcon />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Phone</h3>
              <p className="text-muted-foreground mt-2">
                Mon-Fri from 8am to 5pm.
              </p>
              <Link
                className="text-primary mt-4 font-medium"
                href="tel:+15550000000"
              >
                +1 (555) 000-0000
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
