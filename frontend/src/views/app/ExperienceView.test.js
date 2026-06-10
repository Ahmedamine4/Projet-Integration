import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ExperienceView from './ExperienceView.vue';
import api from '@/services/api';

const routerBackMock = vi.fn();
const routerPushMock = vi.fn();

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      experienceId: '123',
    },
  }),
  useRouter: () => ({
    back: routerBackMock,
    push: routerPushMock,
  }),
}));

function createDeferredPromise() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

const projectExperience = {
  experience_id: 7,
  type: 'projet',
  titre: 'Smart Study Room',
  description: 'A smart platform for students.',
  photo: 'https://example.com/project-image.png',
  visibilite: true,
  date_experience: '2026-03-10',
  technologies: [
    { nom: 'Vue.js' },
    { nom: 'Express.js' },
  ],
  domaines: [
    { nom: 'Web Development' },
    { nom: 'DevOps' },
  ],
  details: {
    lien_github: 'https://github.com/example/smart-study-room',
    lien_youtube: 'https://youtube.com/watch?v=demo',
    resultat_obtenu: 'The project was successfully deployed.',
  },
};

const stageExperience = {
  experience_id: 12,
  type: 'stage',
  titre: 'Backend Internship',
  description: 'Internship focused on backend APIs.',
  photo: null,
  visibilite: false,
  date_experience: '2026-01-01',
  technologies: [],
  domaines: [],
  details: {
    date_fin: '2026-03-01',
    rapport_stage: 'https://example.com/report.pdf',
    missions_realisees: 'Developed REST APIs and database services.',
    duree: '2 months',
    validation: {
      professeur: {
        utilisateur: {
          prenom: 'Aya',
          nom: 'Nouri',
        },
      },
    },
  },
};

describe('ExperienceView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading state while the experience is being fetched', async () => {
    const deferred = createDeferredPromise();

    api.get.mockReturnValueOnce(deferred.promise);

    const wrapper = mount(ExperienceView);

    expect(wrapper.text()).toContain('Loading experience...');

    deferred.resolve({
      data: {
        data: projectExperience,
      },
    });

    await flushPromises();

    expect(wrapper.text()).not.toContain('Loading experience...');
  });

  it('fetches and displays a project experience with links, tags, image and result', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: projectExperience,
      },
    });

    const wrapper = mount(ExperienceView);

    await flushPromises();

    expect(api.get).toHaveBeenCalledWith('/users/portfolio/experience/123');

    expect(wrapper.text()).toContain('Smart Study Room');
    expect(wrapper.text()).toContain('Project');
    expect(wrapper.text()).toContain('March 2026');
    expect(wrapper.text()).toContain('Project summary');
    expect(wrapper.text()).toContain('A smart platform for students.');
    expect(wrapper.text()).toContain('Result obtained');
    expect(wrapper.text()).toContain('The project was successfully deployed.');

    const image = wrapper.find('img');

    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/project-image.png');
    expect(image.attributes('alt')).toBe('Smart Study Room image');

    const githubLink = wrapper
      .findAll('a')
      .find((link) => link.text().includes('GitHub repository'));

    expect(githubLink.exists()).toBe(true);
    expect(githubLink.attributes('href')).toBe(
      'https://github.com/example/smart-study-room'
    );

    const youtubeLink = wrapper
      .findAll('a')
      .find((link) => link.text().includes('YouTube demo'));

    expect(youtubeLink.exists()).toBe(true);
    expect(youtubeLink.attributes('href')).toBe(
      'https://youtube.com/watch?v=demo'
    );

    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Express.js');
    expect(wrapper.text()).toContain('Web Development');
    expect(wrapper.text()).toContain('DevOps');
  });

  it('uses router navigation when clicking back and edit buttons', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: projectExperience,
      },
    });

    const wrapper = mount(ExperienceView);

    await flushPromises();

    const backButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Back'));

    await backButton.trigger('click');

    expect(routerBackMock).toHaveBeenCalledTimes(1);

    const editButton = wrapper.find('button[aria-label="Edit experience"]');

    expect(editButton.exists()).toBe(true);

    await editButton.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith(
      '/dashboard/experiences/7/edit'
    );
  });

  it('shows an error message when the API request fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    api.get.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = mount(ExperienceView);

    await flushPromises();

    expect(wrapper.text()).toContain('Failed to load experience.');
    expect(wrapper.find('.experience-page__case-study').exists()).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('displays internship-specific information and report link for a stage experience', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: stageExperience,
      },
    });

    const wrapper = mount(ExperienceView);

    await flushPromises();

    expect(wrapper.text()).toContain('Backend Internship');
    expect(wrapper.text()).toContain('Internship');
    expect(wrapper.text()).toContain('January 2026 – March 2026');
    expect(wrapper.text()).toContain('Internship summary');
    expect(wrapper.text()).toContain('Internship focused on backend APIs.');
    expect(wrapper.text()).toContain('Developed REST APIs and database services.');
    expect(wrapper.text()).toContain('Duration');
    expect(wrapper.text()).toContain('2 months');
    expect(wrapper.text()).toContain('Validated by');
    expect(wrapper.text()).toContain('Aya Nouri');

    const reportLink = wrapper
      .findAll('a')
      .find((link) => link.text().includes('View report'));

    expect(reportLink.exists()).toBe(true);
    expect(reportLink.attributes('href')).toBe('https://example.com/report.pdf');
  });
});