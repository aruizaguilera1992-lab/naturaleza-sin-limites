import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getActivityProfile,
  isSellable,
  type ActivityProfile,
} from "@/data/activityProfiles";

export interface ActivityEventRow {
  id: string;
  category: string;
  slug: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  meeting_point_public: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity_total: number;
  seats_reserved: number;
  price_cents: number | null;
  status: string;
}

export interface ActivityEvent extends ActivityEventRow {
  startDate: Date;
  freeSeats: number;
  isFull: boolean;
  profile?: ActivityProfile;
  pricePerPerson?: number;
  zone: string;
}

const EVENT_FIELDS =
  "id, category, slug, title, starts_at, ends_at, meeting_point_public, latitude, longitude, capacity_total, seats_reserved, price_cents, status";

/** Only events whose activity exists in the commercial catalogue with a real price. */
const decorate = (row: ActivityEventRow): ActivityEvent | null => {
  const profile = getActivityProfile(row.category, row.slug);
  if (!profile || !isSellable(profile)) return null;
  const freeSeats = Math.max(row.capacity_total - row.seats_reserved, 0);
  return {
    ...row,
    profile,
    startDate: new Date(row.starts_at),
    freeSeats,
    isFull: freeSeats <= 0 || row.status === "completa",
    pricePerPerson: row.price_cents ? row.price_cents / 100 : profile.priceValue,
    zone: row.meeting_point_public?.trim() || profile.zone,
  };
};

interface Options {
  category?: string;
  slug?: string;
  fromDate?: Date;
}

export function useActivityEvents({ category, slug, fromDate }: Options = {}) {
  const [rows, setRows] = useState<ActivityEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = useMemo(() => fromDate?.toISOString() ?? new Date().toISOString(), [fromDate]);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("activity_events")
      .select(EVENT_FIELDS)
      .in("status", ["publicada", "completa"])
      .gte("starts_at", from)
      .order("starts_at", { ascending: true })
      .limit(300);

    if (category) query = query.eq("category", category);
    if (slug) query = query.eq("slug", slug);

    const { data, error: queryError } = await query;
    if (queryError) {
      setError("No hemos podido cargar las salidas programadas.");
      setRows([]);
    } else {
      setError(null);
      setRows((data ?? []) as ActivityEventRow[]);
    }
    setLoading(false);
  }, [category, slug, from]);

  useEffect(() => {
    void load();
  }, [load]);

  const events = useMemo(
    () => rows.map(decorate).filter((e): e is ActivityEvent => e !== null),
    [rows],
  );

  return { events, loading, error, reload: load };
}
