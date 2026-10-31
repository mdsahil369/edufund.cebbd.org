"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/shared/social-icons";
import { useDemoData } from "@/lib/store/demo-store";

const exploreLinks = [
  { href: "/about", label: "About CEBBD" },
  { href: "/students", label: "Student Archive" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact Us" },
];

const involvementLinks = [
  { href: "/students", label: "Sponsor a Student" },
  { href: "/register", label: "Become a Donor" },
  { href: "/about#transparency", label: "How Donations Work" },
  { href: "/about#partnerships", label: "Partner With Us" },
];

export function SiteFooter() {
  const { siteSettings } = useDemoData();
  const socialLinks = [
    { href: siteSettings.socials.facebook, label: "Facebook", icon: FacebookIcon },
    { href: siteSettings.socials.instagram, label: "Instagram", icon: InstagramIcon },
    { href: siteSettings.socials.linkedin, label: "LinkedIn", icon: LinkedinIcon },
    { href: siteSettings.socials.youtube, label: "YouTube", icon: YoutubeIcon },
  ];

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="pattern-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative">
        <div className="container-page grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              {siteSettings.description}
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-brand/40 hover:bg-brand/20 hover:text-white"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              Get Involved
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {involvementLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              Contact
            </h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/70">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-light/70" />
                <span>{siteSettings.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Phone className="size-4 shrink-0 text-brand-light/70" />
                  {siteSettings.contactPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-brand-light/70" />
                  {siteSettings.contactEmail}
                </a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-light/90 transition-colors hover:text-white"
            >
              Talk to our team
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 Community Empowerment Bangladesh. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <span className="hidden items-center gap-1.5 sm:flex">
                <ShieldCheck className="size-3.5" />
                Verified manual donations
              </span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                Frontend demo
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
