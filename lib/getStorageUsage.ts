"use client";

import { supabase } from "./supabaseClient";

const STORAGE_BUCKETS = [
  "documents",
  "compliance",
  "inspections",
  "maintenance",
  "contractor-files",
  "property-images",
  "message-attachments",
] as const;

export async function getTotalStorageBytes(): Promise<number> {
  try {
    const { data: docSizes } = await supabase
      .from("documents")
      .select("file_size");

    const { data: compSizes } = await supabase
      .from("compliance_documents")
      .select("file_size");

    let total = 0;

    for (const row of docSizes || []) {
      if (row.file_size) total += row.file_size;
    }

    for (const row of compSizes || []) {
      if (row.file_size) total += row.file_size;
    }

    if (total > 0) return total;

    return await scanAllBuckets();
  } catch {
    return await scanAllBuckets();
  }
}

async function scanAllBuckets(): Promise<number> {
  let totalBytes = 0;

  for (const bucket of STORAGE_BUCKETS) {
    try {
      const files = await listAllFiles(bucket);
      for (const file of files) {
        totalBytes += file.size;
      }
    } catch {
      continue;
    }
  }

  return totalBytes;
}

async function listAllFiles(
  bucket: string,
  prefix = "",
): Promise<{ name: string; size: number }[]> {
  const results: { name: string; size: number }[] = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 200,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) return results;

  for (const item of data) {
    if (item.id === null) {
      const subResults = await listAllFiles(
        bucket,
        prefix ? `${prefix}/${item.name}` : item.name,
      );
      results.push(...subResults);
    } else {
      results.push({
        name: prefix ? `${prefix}/${item.name}` : item.name,
        size: item.metadata?.size || 0,
      });
    }
  }

  return results;
}

export function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}