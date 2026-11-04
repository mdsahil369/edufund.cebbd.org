import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/home/home-hero";
import { ImpactStatsSection } from "@/components/home/impact-stats";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { WaysToSupportSection } from "@/components/home/ways-to-support";
import { AchievementsGallery } from "@/components/home/achievements-gallery";
import { TrustSection } from "@/components/home/trust-section";
import { HomeCtaSection } from "@/components/home/home-cta";
import { StudentCard } from "@/components/students/student-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getFeaturedStudents } from "@/lib/services/students";
import { impactStats } from "@/lib/mock-data/stats";
import { achievements } from "@/lib/mock-data/achievements";
import { donations } from "@/lib/mock-data/donations";
import { getFunding } from "@/lib/utils";
import { toPublicStudent } from "@/lib/students";

// Featured students are read from Supabase on each request so admin changes
// appear without a rebuild.
export const instant = false;

export const metadata: Metadata = {
  title: "EduFund CEBBD — Every student deserves a chance to dream",
  description:
    "Support financially disadvantaged students across Bangladesh. Browse verified student profiles, choose your support, and track every verified donation through EduFund CEBBD.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featured = (await getFeaturedStudents(6)).map(toPublicStudent);
  const heroStudent = featured[0];
  const heroFunding = heroStudent
    ? getFunding(heroStudent, donations)
    : {
        required: 0,
        raised: 0,
        remaining: 0,
        percent: 0,
        approvedDonationCount: 0,
        supporterCount: 0,
      };

  return (
    <>
      {heroStudent && (
        <HomeHero featuredStudent={heroStudent} funding={heroFunding} />
      )}
      <ImpactStatsSection stats={impactStats} />

      <section className="section-pad bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Featured students"
            title="Meet students waiting for a chance to continue"
            description="Each profile is verified by CEBBD. Every contribution is recorded, reviewed, and paid directly toward education costs."
            action={
              <Button asChild variant="outline">
                <Link href="/students">
                  View All Students
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                funding={getFunding(student, donations)}
              />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="soft">
              <Link href="/students">
                Explore all student profiles
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <WaysToSupportSection />

      <section className="section-pad bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="CEBBD achievements"
            title="Progress we have made together"
            description="Milestones from the Community Empowerment Bangladesh education programme. These stories are maintained by our team and updated as the programme grows."
          />
          <AchievementsGallery achievements={achievements} className="mt-10" />
        </div>
      </section>

      <TrustSection />
      <HomeCtaSection />
    </>
  );
}
