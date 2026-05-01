import type { PersistStorage, StorageValue } from 'zustand/middleware';

type Area = 'sync' | 'local';

export function chromeStorage<T>(area: Area = 'sync'): PersistStorage<T> {
  const store = (): chrome.storage.StorageArea => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new Error('chrome.storage is not available');
    }
    return chrome.storage[area];
  };

  return {
    getItem: async (name: string): Promise<StorageValue<T> | null> => {
      try {
        const result = await store().get(name);
        const raw = result[name] as string | undefined;
        if (!raw) return null;
        return JSON.parse(raw) as StorageValue<T>;
      } catch (err) {
        console.warn('[storage] getItem failed', err);
        return null;
      }
    },
    setItem: async (name, value) => {
      try {
        await store().set({ [name]: JSON.stringify(value) });
      } catch (err) {
        console.warn('[storage] setItem failed', err);
      }
    },
    removeItem: async (name) => {
      try {
        await store().remove(name);
      } catch (err) {
        console.warn('[storage] removeItem failed', err);
      }
    },
  };
}

export function subscribeStorage(
  area: Area,
  key: string,
  listener: (newValue: unknown) => void,
): () => void {
  const handler = (
    changes: { [k: string]: chrome.storage.StorageChange },
    changedArea: chrome.storage.AreaName,
  ) => {
    if (changedArea !== area) return;
    if (!changes[key]) return;
    const raw = changes[key].newValue as string | undefined;
    if (!raw) return;
    try {
      listener(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
