import NavBar from "@/components/layout/navbar";
import { OnboardingGuard } from "@/components/pages/(protected)/onboarding/onboarding-guard";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      <OnboardingGuard>
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
      </OnboardingGuard>
    </div>
  );
}
