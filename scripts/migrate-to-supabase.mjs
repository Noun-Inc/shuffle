/**
 * One-time migration: uploads all signals + images from local data to Supabase.
 * Run with: node scripts/migrate-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");

const SUPABASE_URL = "https://eowgaerqzwxvyyqzqgvo.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvd2dhZXJxend4dnl5cXpxZ3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAxOTM5OSwiZXhwIjoyMDkwNTk1Mzk5fQ.UWtOrHp-0kWfrJu-YKXSRl9uWeSISilp--SNZiwuUD0";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Dynamically import signals data
async function loadSignals() {
  // Read the signals.ts file and extract the data
  // Since it's TypeScript with interfaces, we'll parse it manually
  const content = fs.readFileSync(
    path.join(__dirname, "../src/data/signals.ts"),
    "utf-8"
  );

  // Strip TypeScript types and extract the signals array as JS
  let js = content
    // Remove export interface blocks
    .replace(/export\s+interface\s+\w+\s*\{[^}]*\}/g, "")
    // Remove type annotations: `: Signal[]`, `: string`, etc.
    .replace(/:\s*Signal\[\]/g, "")
    .replace(/:\s*SignalImage\[\]/g, "")
    // Remove `export const categories...` line and everything after signals
    .replace(/export\s+const\s+categories[\s\S]*$/, "")
    // Change `export const signals =` to just `const signals =`
    .replace(/export\s+const\s+signals\s*=/, "const signals =");

  // Wrap in a function that returns the signals array
  const fn = new Function(`${js}; return signals;`);
  return fn();
}

async function uploadImage(localPath, storagePath) {
  const fullPath = path.join(PUBLIC_DIR, localPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ File not found: ${localPath}`);
    return null;
  }

  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const contentType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
      ? "image/webp"
      : "image/jpeg";

  const { error } = await supabase.storage
    .from("signal-images")
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) {
    console.log(`  ⚠ Upload error for ${storagePath}: ${error.message}`);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("signal-images").getPublicUrl(storagePath);

  return publicUrl;
}

async function migrate() {
  console.log("Loading signals from signals.ts...");
  const signals = await loadSignals();
  console.log(`Found ${signals.length} signals`);

  // 1. Create deck
  console.log("\nCreating 2026 Signals deck...");
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .insert({
      slug: "2026-signals",
      title: "2026 Signals",
      year: 2026,
      description: "Signals of the world — 2026 edition",
    })
    .select()
    .single();

  if (deckError) {
    if (deckError.code === "23505") {
      // Already exists
      console.log("Deck already exists, fetching...");
      const { data } = await supabase
        .from("decks")
        .select()
        .eq("slug", "2026-signals")
        .single();
      if (!data) throw new Error("Could not find or create deck");
      return migrateSignals(data, signals);
    }
    throw deckError;
  }

  console.log(`Deck created: ${deck.id}`);
  await migrateSignals(deck, signals);
}

async function migrateSignals(deck, signals) {
  let success = 0;
  let skipped = 0;

  for (const signal of signals) {
    process.stdout.write(`\r  Signal #${signal.number} of ${signals.length}...`);

    // Insert signal
    const { data: dbSignal, error: sigError } = await supabase
      .from("signals")
      .insert({
        deck_id: deck.id,
        number: signal.number,
        title: signal.title,
        body: signal.body,
        category: signal.category || null,
        tags: signal.tags || [],
        year: signal.year,
        reference: signal.reference || null,
        focal_hint: signal.focalHint || null,
        status: "published",
        sort_order: signal.number,
      })
      .select()
      .single();

    if (sigError) {
      if (sigError.code === "23505") {
        skipped++;
        continue;
      }
      console.log(`\n  ⚠ Error inserting signal #${signal.number}: ${sigError.message}`);
      continue;
    }

    // Upload images
    for (let i = 0; i < signal.images.length; i++) {
      const img = signal.images[i];
      const localImagePath = img.url; // e.g. "/images/image42.png"
      const filename = path.basename(localImagePath);
      const filenameNoExt = filename.replace(/\.[^.]+$/, "");

      // Upload full-res image
      const fullUrl = await uploadImage(
        localImagePath.replace(/^\//, ""),
        `full/${filename}`
      );

      // Upload thumbnail
      const thumbFilename = `${filenameNoExt}.jpg`;
      const thumbUrl = await uploadImage(
        `thumbs/${thumbFilename}`,
        `thumbs/${thumbFilename}`
      );

      // Insert image record
      if (fullUrl) {
        await supabase.from("signal_images").insert({
          signal_id: dbSignal.id,
          url: fullUrl,
          thumb_url: thumbUrl || fullUrl,
          alt: img.alt || null,
          source: img.source || null,
          source_label: img.sourceLabel || null,
          sort_order: i,
        });
      }
    }

    success++;
  }

  console.log(`\n\nDone! ${success} signals migrated, ${skipped} skipped (already existed).`);
  console.log(`Total images in storage: check Supabase dashboard → Storage → signal-images`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
