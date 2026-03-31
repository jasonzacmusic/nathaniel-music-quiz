/**
 * Google Apps Script — Auto-sync to Neon DB
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire script
 * 4. Replace SYNC_URL and SYNC_SECRET below with your values
 * 5. Click the clock icon (Triggers) in the left sidebar
 * 6. Click "+ Add Trigger"
 * 7. Set:
 *    - Function: onSheetEdit
 *    - Event source: From spreadsheet
 *    - Event type: On edit
 * 8. Click "+ Add Trigger" again for time-based backup:
 *    - Function: scheduledSync
 *    - Event source: Time-driven
 *    - Type: Minutes timer → Every 10 minutes (or your preference)
 * 9. Save and authorize when prompted
 */

// ═══ CONFIGURE THESE ═══
const SYNC_URL = "https://quiz.nathanielschool.com/api/sync-sheets";
const SYNC_SECRET = "YOUR_ADMIN_PASSWORD_HERE"; // Same as ADMIN_PASSWORD env var
// ════════════════════════

/**
 * Fires on every edit. Debounces with a 30-second cooldown
 * so rapid edits don't hammer the API.
 */
function onSheetEdit(e) {
  const sheet = e.source.getActiveSheet();
  const name = sheet.getName().toLowerCase();

  // Only sync if editing a theory quiz tab
  if (!name.includes("theory")) return;

  // Debounce: skip if synced in the last 30 seconds
  const cache = CacheService.getScriptCache();
  if (cache.get("last_sync")) return;

  // Set cooldown
  cache.put("last_sync", "true", 30);

  // Trigger sync
  triggerSync("edit");
}

/**
 * Scheduled backup sync (runs on timer trigger).
 * Ensures the DB stays in sync even if onEdit misses something.
 */
function scheduledSync() {
  triggerSync("scheduled");
}

/**
 * Manual sync — run this function directly to force a sync.
 */
function manualSync() {
  triggerSync("manual");
}

/**
 * Core sync function — calls the API endpoint.
 */
function triggerSync(source) {
  try {
    const options = {
      method: "post",
      headers: {
        "Authorization": "Bearer " + SYNC_SECRET,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify({ source: source }),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(SYNC_URL, options);
    const code = response.getResponseCode();
    const body = response.getContentText();

    if (code === 200) {
      const result = JSON.parse(body);
      Logger.log(
        "Sync OK (" + source + "): " +
        result.imported + " questions, " +
        result.sets + " sets — " +
        result.timestamp
      );
    } else {
      Logger.log("Sync FAILED (" + source + "): HTTP " + code + " — " + body);
    }
  } catch (error) {
    Logger.log("Sync ERROR (" + source + "): " + error.message);
  }
}
