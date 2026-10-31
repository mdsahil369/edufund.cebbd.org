"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Bell,
  ExternalLink,
  LogOut,
  Menu,
} from "lucide-react";
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

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  exact?: boolean;
}

interface AppShellProps {
  variant: "donor" | "admin";
  nav: AppNavItem[];
  children: ReactNode;
}

export function AppShell({ variant, nav, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, unreadDonorCount, unreadAdminCount } =
    useDemoData();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = variant === "admin";

  const activeItem =
    nav
      .filter((item) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href),
      )
      .sort((a, b) => b.href.length - a.href.length)[0] ?? nav[0];

  const isActive = (item: AppNavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-[70px] shrink-0 items-center border-b px-5",
          isAdmin ? "border-white/10" : "border-border",
        )}
      >
        <Logo variant={isAdmin ? "light" : "dark"} />
      </div>

      <nav
        aria-label={isAdmin ? "Admin navigation" : "Dashboard navigation"}
        className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4"
      >
        <p
          className={cn(
            "mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em]",
            isAdmin ? "text-white/35" : "text-slate-muted/70",
          )}
        >
          {isAdmin ? "Administration" : "My account"}
        </p>
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                    isAdmin
                      ? active
                        ? "bg-brand text-white shadow-sm"
                        : "text-white/70 hover:bg-white/8 hover:text-white"
                      : active
                        ? "bg-brand-light text-brand-dark"
                        : "text-ink/70 hover:bg-muted hover:text-ink",
                  )}
                >
                  <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                        active && isAdmin
                          ? "bg-white/20 text-white"
                          : isAdmin
                            ? "bg-brand/30 text-white"
                            : "bg-brand text-white",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className={cn(
            "mt-6 border-t pt-4",
            isAdmin ? "border-white/10" : "border-border",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
              isAdmin
                ? "text-white/55 hover:bg-white/8 hover:text-white"
                : "text-slate-muted hover:bg-muted hover:text-ink",
            )}
          >
            <ArrowLeft className="size-4" />
            Back to website
          </Link>
        </div>
      </nav>

      <div
        className={cn(
          "shrink-0 border-t p-3",
          isAdmin ? "border-white/10" : "border-border",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2",
            isAdmin ? "bg-white/5" : "bg-muted/60",
          )}
        >
          <StudentAvatar name={session?.name ?? "User"} size="sm" />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[13px] font-semibold",
                isAdmin ? "text-white" : "text-navy",
              )}
            >
              {session?.name ?? "Demo user"}
            </p>
            <p
              className={cn(
                "truncate text-[11px]",
                isAdmin ? "text-white/45" : "text-slate-muted",
              )}
            >
              {session?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            className={cn(
              isAdmin
                ? "text-white/60 hover:bg-white/10 hover:text-white"
                : "text-slate-muted hover:bg-white hover:text-red-600",
            )}
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:block",
          isAdmin ? "border-navy bg-navy" : "border-border bg-white",
        )}
      >
        {sidebarContent}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[84vw] max-w-xs p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div
                className={cn(
                  "h-full",
                  isAdmin ? "bg-navy" : "bg-white",
                )}
              >
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold text-navy">
              {activeItem?.label ?? "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
            >
              <Link href="/" aria-label="View public website">
                <ExternalLink className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Messages"
            >
              <Link
                href={
                  isAdmin ? "/admin/messages" : "/dashboard/messages"
                }
              >
                <Bell className="size-4" />
                {(isAdmin ? unreadAdminCount : unreadDonorCount) > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 rounded-full focus-visible:ring-3 focus-visible:ring-brand/30"
                  aria-label="Account menu"
                >
                  <StudentAvatar name={session?.name ?? "User"} size="sm" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold text-navy">
                    {session?.name}
                  </p>
                  <p className="truncate text-xs font-normal text-slate-muted">
                    {session?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ExternalLink className="size-4" />
                    Public website
                  </Link>
                </DropdownMenuItem>
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
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
