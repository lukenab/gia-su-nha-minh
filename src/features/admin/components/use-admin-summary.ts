"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { AdminNotification } from "@/features/admin/types";

export type NavCounts = { requests: number; overdue: number; tutors: number };
export type AdminSummary = {
  items: AdminNotification[] | null;
  counts: NavCounts | null;
  failed: boolean;
  reload: () => void;
};

type Payload = { items: AdminNotification[]; counts: NavCounts };

async function fetchSummary(): Promise<Payload | null> {
  try {
    const response = await fetch("/api/admin/notifications", {
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as Payload) : null;
  } catch {
    return null;
  }
}

/**
 * Header notifications and sidebar badges from one request, refreshed on
 * every navigation (after a status change the counts are current again).
 */
export function useAdminSummary(): AdminSummary {
  const pathname = usePathname();
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(() => {
    void fetchSummary().then((loaded) => {
      if (loaded) setData(loaded);
      setFailed(!loaded);
    });
  }, []);

  useEffect(reload, [reload, pathname]);

  return {
    items: data?.items ?? null,
    counts: data?.counts ?? null,
    failed,
    reload,
  };
}
