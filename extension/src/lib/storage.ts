export interface GatewaySettings {
  apiUrl: string;
  authToken: string;
}

const DEFAULTS: GatewaySettings = {
  apiUrl: "",
  authToken: "",
};

export async function getLocalSettings(): Promise<GatewaySettings> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(DEFAULTS, (result) => {
        resolve(result as GatewaySettings);
      });
    } else {
      // Fallback for dev mode without Chrome APIs
      const stored = localStorage.getItem("gateway_settings");
      resolve(stored ? JSON.parse(stored) : DEFAULTS);
    }
  });
}

export async function saveLocalSettings(
  settings: Partial<GatewaySettings>,
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set(settings, resolve);
    } else {
      const current = localStorage.getItem("gateway_settings");
      const merged = { ...(current ? JSON.parse(current) : DEFAULTS), ...settings };
      localStorage.setItem("gateway_settings", JSON.stringify(merged));
      resolve();
    }
  });
}
