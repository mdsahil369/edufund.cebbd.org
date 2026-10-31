"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { StudentAvatar } from "@/components/students/student-avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemoData } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/students", label: "Student Archive" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, hydrated, logout, siteSettings, unreadDonorCount } =
    useDemoData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const dashboardHref = session?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header>
      <div className="bg-navy text-white/75">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`}
              className="hidden items-center gap-1.5 transition-colors hover:text-white sm:flex"
            >
              <Phone className="size-3" aria-hidden="true" />
              {siteSettings.contactPhone}
            </a>
            <a
              href={`mailto:${siteSettings.contactEmail}`}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Mail className="size-3" aria-hidden="true" />
              {siteSettings.contactEmail}
            </a>
          </div>
          <Link
            href={siteSettings.announcementHref}
            className="group flex items-center gap-1.5 font-medium text-white/90 transition-colors hover:text-white"
          >
            <span className="hidden size-1.5 rounded-full bg-emerald-300 sm:inline-block" />
            <span className="max-w-[62vw] truncate sm:max-w-none">
              {siteSettings.announcement}
            </span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "sticky top-0 z-50 border-b border-transparent bg-white/95 backdrop-blur-md transition-shadow duration-300",
          scrolled && "border-border shadow-[0_4px_24px_-12px_rgba(16,42,67,0.18)]",
        )}
      >
        <div className="container-page flex h-[70px] items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                      isActive(item.href)
                        ? "text-brand-dark"
                        : "text-ink/75 hover:bg-brand-soft hover:text-brand-dark",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {!hydrated ? (
              <div className="hidden h-10 w-32 animate-pulse rounded-lg bg-muted md:block" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hidden items-center gap-2 rounded-full border border-border bg-white py-1 pr-3 pl-1 text-sm font-medium text-ink transition-colors hover:border-brand/30 hover:bg-brand-soft md:flex"
                    aria-label="Open account menu"
                  >
                    <StudentAvatar name={session.name} size="xs" />
                    <span className="max-w-28 truncate">
                      {session.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="size-3.5 text-slate-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-navy">
                      {session.name}
                    </span>
                    <span className="truncate text-xs font-normal text-slate-muted">
                      {session.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref}>
                      <LayoutDashboard className="size-4" />
                      {session.role === "admin" ? "Admin dashboard" : "My dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  {session.role === "donor" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/messages">
                          <MessageSquare className="size-4" />
                          Messages
                          {unreadDonorCount > 0 && (
                            <span className="ml-auto rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                              {unreadDonorCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">
                          <User className="size-4" />
                          My profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm font-semibold text-ink transition-colors hover:text-brand md:block"
              >
                Log in
              </Link>
            )}

            <Button asChild size="lg" className="hidden sm:inline-flex">
              <Link href="/students">
                <Heart className="size-4" aria-hidden="true" />
                Support a Student
              </Link>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle asChild>
                    <Logo href="/" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-4 py-5">
                  <nav aria-label="Mobile navigation">
                    <ul className="space-y-1">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
                              isActive(item.href)
                                ? "bg-brand-light text-brand-dark"
                                : "text-ink hover:bg-muted",
                            )}
                          >
                            {item.label}
                            <ArrowRight className="size-4 opacity-40" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div className="mt-6 space-y-2 border-t border-border pt-5">
                    {session ? (
                      <>
                        <div className="mb-3 flex items-center gap-3 rounded-xl bg-brand-soft p-3">
                          <StudentAvatar name={session.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-navy">
                              {session.name}
                            </p>
                            <p className="truncate text-xs text-slate-muted">
                              {session.email}
                            </p>
                          </div>
                        </div>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link
                            href={dashboardHref}
                            onClick={() => setMobileOpen(false)}
                          >
                            <LayoutDashboard className="size-4" />
                            {session.role === "admin"
                              ? "Admin dashboard"
                              : "My dashboard"}
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            logout();
                            setMobileOpen(false);
                            router.push("/");
                          }}
                        >
                          <LogOut className="size-4" />
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login" onClick={() => setMobileOpen(false)}>
                            Log in
                          </Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/register" onClick={() => setMobileOpen(false)}>
                            Create an account
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button asChild size="lg" className="w-full">
                      <Link href="/students" onClick={() => setMobileOpen(false)}>
                        <Heart className="size-4" />
                        Support a Student
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-auto space-y-2 border-t border-border pt-5 text-xs text-slate-muted">
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5" />
                      {siteSettings.contactPhone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="size-3.5" />
                      {siteSettings.contactEmail}
                    </p>
                    <p className="flex items-center gap-2 text-brand-dark">
                      <ShieldCheck className="size-3.5" />
                      Manual payments, verified by our team
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
