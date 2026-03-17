import NavBar from "@/components/layout/navbar";
import DashboardHeader from "@/components/layout/dashboard-header";
import { OnboardingGuard } from "@/components/pages/(protected)/onboarding/onboarding-guard";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* Fixed navbar */}
      <div className="bg-primary fixed top-0 right-0 left-0 z-50">
        <NavBar />
      </div>

      {/* Primary hero zone — push down by navbar height (h-16 = 4rem) */}
      <div className="bg-primary pt-16 pb-24 md:pb-28">
        <DashboardHeader />
      </div>

      {/* Main content pulls up into the hero zone via negative margin */}
      <OnboardingGuard>
        <main className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 pb-8 md:-mt-24 md:px-6">
          {children}
        </main>
      </OnboardingGuard>
    </div>
  );
}
