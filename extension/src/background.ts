/// <reference types="chrome" />

// Open side panel when extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// Poll for pending count every 60 seconds
chrome.alarms.create("poll-stats", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "poll-stats") return;

  try {
    const { apiUrl, authToken } = await chrome.storage.local.get([
      "apiUrl",
      "authToken",
    ]);
    if (!apiUrl || !authToken) return;

    const res = await fetch(`${apiUrl}/api/emails/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) return;

    const stats = await res.json();
    const count = stats.pending || 0;

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#EAB308" });
  } catch {
    // Silently fail - will retry on next alarm
  }
});
