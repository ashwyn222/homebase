interface RedirectSettings {
  redirectEnabled: boolean;
  redirectFromUrls: string[];
}

const INITIAL_DEFAULTS: RedirectSettings = {
  redirectEnabled: false,
  redirectFromUrls: [],
};

const STORAGE_KEY = 'redirect';
const LEGACY_SETTINGS_KEY = 'settings';

function wrap(settings: RedirectSettings): string {
  return JSON.stringify({ state: settings, version: 1 });
}

async function readCurrent(): Promise<RedirectSettings | null> {
  const data = await chrome.storage.sync.get(STORAGE_KEY);
  const stored = data[STORAGE_KEY] as string | undefined;
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { state?: Partial<RedirectSettings> };
    return {
      redirectEnabled: parsed.state?.redirectEnabled ?? false,
      redirectFromUrls: parsed.state?.redirectFromUrls ?? [],
    };
  } catch {
    return null;
  }
}

async function readLegacy(): Promise<RedirectSettings | null> {
  const data = await chrome.storage.sync.get(LEGACY_SETTINGS_KEY);
  const legacy = data[LEGACY_SETTINGS_KEY] as
    | { redirectEnabled?: boolean; redirectFromUrls?: string[] }
    | string
    | undefined;
  if (!legacy) return null;
  const parsed =
    typeof legacy === 'string'
      ? (JSON.parse(legacy) as {
          redirectEnabled?: boolean;
          redirectFromUrls?: string[];
        })
      : legacy;
  if (
    typeof parsed.redirectEnabled !== 'boolean' &&
    !Array.isArray(parsed.redirectFromUrls)
  ) {
    return null;
  }
  return {
    redirectEnabled: parsed.redirectEnabled ?? false,
    redirectFromUrls: parsed.redirectFromUrls ?? [],
  };
}

async function ensureRedirectSettings(): Promise<RedirectSettings> {
  const current = await readCurrent();
  if (current) return current;

  const legacy = await readLegacy();
  if (legacy) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: wrap(legacy) });
    return legacy;
  }

  await chrome.storage.sync.set({ [STORAGE_KEY]: wrap(INITIAL_DEFAULTS) });
  return INITIAL_DEFAULTS;
}

async function getSettings(): Promise<RedirectSettings> {
  const current = await readCurrent();
  if (current) return current;
  return ensureRedirectSettings();
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureRedirectSettings();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureRedirectSettings();
});

async function shouldRedirect(url: string): Promise<boolean> {
  if (!url) return false;
  const settings = await getSettings();
  if (!settings.redirectEnabled) return false;
  const prefixes = (settings.redirectFromUrls ?? []).filter(Boolean);
  return prefixes.some((p) => url.startsWith(p));
}

async function doRedirect(tabId: number): Promise<void> {
  const target = chrome.runtime.getURL('newtab.html');
  try {
    await chrome.tabs.update(tabId, { url: target });
  } catch {
    /* tab may have closed */
  }
}

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const url = changeInfo.url;
  if (!url) return;
  if (await shouldRedirect(url)) {
    await doRedirect(tabId);
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (await shouldRedirect(details.url)) {
    await doRedirect(details.tabId);
  }
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (await shouldRedirect(details.url)) {
    await doRedirect(details.tabId);
  }
});
