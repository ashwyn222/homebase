import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../newtab/store/dashboard';
import { ThemeProvider } from '../newtab/theme/ThemeProvider';

interface RedirectSettings {
  redirectEnabled: boolean;
  redirectFromUrls: string[];
}

const REDIRECT_KEY = 'redirect';

async function loadRedirect(): Promise<RedirectSettings> {
  const data = await chrome.storage.sync.get(REDIRECT_KEY);
  const stored = data[REDIRECT_KEY] as string | undefined;
  if (!stored) return { redirectEnabled: false, redirectFromUrls: [] };
  try {
    const parsed = JSON.parse(stored) as {
      state?: Partial<RedirectSettings>;
    };
    return {
      redirectEnabled: parsed.state?.redirectEnabled ?? false,
      redirectFromUrls: parsed.state?.redirectFromUrls ?? [],
    };
  } catch {
    return { redirectEnabled: false, redirectFromUrls: [] };
  }
}

async function saveRedirect(settings: RedirectSettings) {
  await chrome.storage.sync.set({
    [REDIRECT_KEY]: JSON.stringify({ state: settings, version: 1 }),
  });
}

export function OptionsApp() {
  const userName = useDashboard((s) => s.userName);
  const setUserName = useDashboard((s) => s.setUserName);
  const resetAll = useDashboard((s) => s.resetAll);
  const importState = useDashboard((s) => s.importState);
  const hydrated = useDashboard((s) => s.hydrated);

  const [redirect, setRedirect] = useState<RedirectSettings>({
    redirectEnabled: false,
    redirectFromUrls: [],
  });
  const [redirectLoaded, setRedirectLoaded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRedirect().then((r) => {
      setRedirect(r);
      setRedirectLoaded(true);
    });
  }, []);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 2000);
  };

  const saveRedirectAndFlash = async (next: RedirectSettings) => {
    setRedirect(next);
    await saveRedirect(next);
    flash('Saved.');
  };

  const doExport = async () => {
    const all = await chrome.storage.sync.get(null);
    const blob = new Blob([JSON.stringify(all, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newtab-dashboard-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      await chrome.storage.sync.set(data);
      const dashboardRaw = data['dashboard'] as string | undefined;
      if (dashboardRaw) {
        const parsed = JSON.parse(dashboardRaw) as { state?: unknown };
        if (parsed.state) importState(parsed.state as Parameters<typeof importState>[0]);
      }
      const r = await loadRedirect();
      setRedirect(r);
      flash('Imported.');
    } catch (err) {
      flash('Import failed: ' + (err instanceof Error ? err.message : 'invalid file'));
    } finally {
      e.target.value = '';
    }
  };

  if (!hydrated || !redirectLoaded) {
    return (
      <ThemeProvider>
        <div className="opt-shell">
          <p>Loading…</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="opt-shell">
        <header className="opt-header">
          <h1>Dashboard Settings</h1>
          <p>
            Fine-grained settings. For theme, widgets, and layout, open a new
            tab and use the settings pill or <code>⌘K</code> command palette.
          </p>
        </header>

        <section className="opt-card">
          <h2>Profile</h2>
          <label className="opt-row">
            <span>Your name (used in greeting)</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ashwin"
            />
          </label>
        </section>

        <section className="opt-card">
          <div className="opt-card-head">
            <h2>Managed Homepage Redirect</h2>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={redirect.redirectEnabled}
                onChange={(e) =>
                  saveRedirectAndFlash({
                    ...redirect,
                    redirectEnabled: e.target.checked,
                  })
                }
              />
              <span>Enable</span>
            </label>
          </div>
          <p className="hint">
            If your organization forces a homepage on every new tab (via a
            Chrome Enterprise policy), list those URL prefixes below. New tabs
            that land on any of these will be auto-redirected to this
            dashboard. Manual visits to the same URLs are not touched.
          </p>
          <label className="opt-row">
            <span>URL prefixes (one per line)</span>
            <textarea
              rows={3}
              value={redirect.redirectFromUrls.join('\n')}
              onChange={(e) =>
                setRedirect({
                  ...redirect,
                  redirectFromUrls: e.target.value
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              onBlur={() => saveRedirectAndFlash(redirect)}
              placeholder="https://company.example.com/homepage"
            />
          </label>
        </section>

        <section className="opt-card">
          <h2>Backup</h2>
          <div className="opt-actions">
            <button type="button" className="secondary-btn" onClick={doExport}>
              Export settings
            </button>
            <button type="button" className="secondary-btn" onClick={doImport}>
              Import settings
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={handleFile}
            />
          </div>
        </section>

        <section className="opt-card danger">
          <h2>Danger zone</h2>
          <button
            type="button"
            className="danger-btn"
            onClick={() => {
              if (
                confirm(
                  'Reset the entire dashboard (widgets, layout, theme, preferences) to defaults?',
                )
              ) {
                resetAll();
                flash('Reset complete.');
              }
            }}
          >
            Reset dashboard to defaults
          </button>
        </section>

        {status && <div className="opt-status">{status}</div>}
      </div>
    </ThemeProvider>
  );
}
