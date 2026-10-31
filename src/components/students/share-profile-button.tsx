"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareProfileButton({ name }: { name: string }) {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${name} — EduFund CEBBD`,
          text: `Support ${name}'s education through EduFund CEBBD.`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to your clipboard.");
    } catch {
      toast.error("Could not share the profile. Please copy the URL manually.");
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleShare} className="w-full">
      <Share2 className="size-4" />
      Share this profile
    </Button>
  );
}
