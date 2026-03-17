import { Footer, Header, WaitlistSection } from "@common/index";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <Header />
      <div className="min-h-screen antialiased">{children}</div>
      <WaitlistSection />
      <Footer />
    </div>
  );
}
