import { Footer, Header, WaitlistSection } from "@component/common";

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
