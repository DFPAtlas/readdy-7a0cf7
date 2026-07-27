"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onChange: () => void;
  channelName?: string;
  debounceMs?: number;
}

export function useRealtimeSubscription({
  table,
  event = "*",
  filter,
  onChange,
  channelName,
  debounceMs = 300,
}: UseRealtimeSubscriptionOptions) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedOnChange = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChangeRef.current();
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    const chName = channelName || `rt:${table}:${Math.random().toString(36).slice(2, 8)}`;

    const channel = supabase.channel(chName);

    const subConfig: any = {
      event,
      schema: "public",
      table,
    };

    if (filter) {
      subConfig.filter = filter;
    }

    channel
      .on("postgres_changes" as any, subConfig, () => {
        debouncedOnChange();
      })
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(`[Realtime] Subscription error on table "${table}"`);
        }
      });

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [table, event, filter, channelName, debouncedOnChange]);
}