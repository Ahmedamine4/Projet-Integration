import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFeedExperienceStore } from './feedExperience';

describe('feedExperience store infinite scroll mock pagination', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loads experiences 4 by 4 in mock mode', async () => {
    const store = useFeedExperienceStore();

    await store.fetchFeedExperiences({}, { reset: true });

    expect(store.items).toHaveLength(4);
    expect(store.items.map((item) => item.title)).toEqual([
      'Projet 1',
      'Projet 2',
      'Projet 3',
      'Projet 4',
    ]);
    expect(store.page).toBe(2);
    expect(store.hasMore).toBe(true);

    await store.fetchNextFeedExperiences({});

    expect(store.items).toHaveLength(8);
    expect(store.items.map((item) => item.title)).toEqual([
      'Projet 1',
      'Projet 2',
      'Projet 3',
      'Projet 4',
      'Projet 5',
      'Projet 6',
      'Projet 7',
      'Projet 8',
    ]);
    expect(store.page).toBe(3);
    expect(store.hasMore).toBe(true);

    await store.fetchNextFeedExperiences({});

    expect(store.items).toHaveLength(12);
    expect(store.items.map((item) => item.title)).toEqual([
      'Projet 1',
      'Projet 2',
      'Projet 3',
      'Projet 4',
      'Projet 5',
      'Projet 6',
      'Projet 7',
      'Projet 8',
      'Projet 9',
      'Projet 10',
      'Projet 11',
      'Projet 12',
    ]);
    expect(store.hasMore).toBe(false);

    await store.fetchNextFeedExperiences({});

    expect(store.items).toHaveLength(12);
  });

  it('resets pagination when fetchFeedExperiences is called with reset true', async () => {
    const store = useFeedExperienceStore();

    await store.fetchFeedExperiences({}, { reset: true });
    await store.fetchNextFeedExperiences({});

    expect(store.items).toHaveLength(8);

    await store.fetchFeedExperiences({}, { reset: true });

    expect(store.items).toHaveLength(4);
    expect(store.items.map((item) => item.title)).toEqual([
      'Projet 1',
      'Projet 2',
      'Projet 3',
      'Projet 4',
    ]);
    expect(store.page).toBe(2);
    expect(store.hasMore).toBe(true);
  });

  it('does not create duplicates when loading next pages', async () => {
    const store = useFeedExperienceStore();

    await store.fetchFeedExperiences({}, { reset: true });
    await store.fetchNextFeedExperiences({});
    await store.fetchNextFeedExperiences({});

    const keys = store.items.map((item) => item.feedKey || item.id);
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(keys.length);
  });
});
