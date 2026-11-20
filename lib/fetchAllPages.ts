import type { PostgrestError } from "@supabase/supabase-js";

// Supabase's API returns at most 1,000 rows per request by default, so a plain
// select silently truncates large result sets (and any totals built from
// them). This reads a query page by page. The query must have a stable order
// (for example .order("id")) so pages don't overlap or skip rows.

const PAGE_SIZE = 1000;
const MAX_ROWS = 50000;

export async function fetchAllPages<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
): Promise<{ data: T[]; error: PostgrestError | null }> {
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { data: rows, error: null };
}
