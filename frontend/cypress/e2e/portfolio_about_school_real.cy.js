const E2E_PASSWORD = 'Nour2006*';
const E2E_FIRST_NAME = 'E2E';
const E2E_LAST_NAME = 'Portfolio Student';

function apiRequest(options) {
  return cy.request({
    failOnStatusCode: false,
    ...options,
  });
}

function ensureE2EStudent(email) {
  apiRequest({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      firstName: E2E_FIRST_NAME,
      lastName: E2E_LAST_NAME,
      email,
      password: E2E_PASSWORD,
    },
  }).then((response) => {
    expect(response.status).to.be.oneOf([201, 400]);

    if (response.status === 400) {
      expect(
        String(response.body?.error || response.body?.message || '')
      ).to.match(/email|utilis/i);
    }
  });
}

function loginThroughUi(email) {
  cy.clearCookies();
  cy.clearLocalStorage();

  cy.intercept('POST', '**/api/auth/login').as('loginRequest');

  cy.visit('/login');

  cy.get('input[placeholder="name@company.com"]')
    .should('be.visible')
    .clear()
    .type(email)
    .should('have.value', email);

  cy.get('input[placeholder="Enter your password"]')
    .should('be.visible')
    .clear()
    .type(E2E_PASSWORD, { log: false })
    .should('have.value', E2E_PASSWORD);

  cy.contains('button', /sign in/i, { timeout: 10000 })
    .should('be.visible')
    .and('be.enabled')
    .click();

  cy.wait('@loginRequest').then(({ response }) => {
    expect(response, 'real login response').to.exist;
    expect(response.statusCode).to.eq(200);
    expect(response.body.user.email).to.eq(email);
    expect(response.body.user.role).to.eq('etudiant');
  });

  cy.location('pathname', { timeout: 15000 }).should('not.eq', '/login');
  cy.getCookie('accessToken').should('exist');

  return apiRequest({
    method: 'GET',
    url: '/api/auth/profile',
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.user.email).to.eq(email);
    expect(response.body.user.role).to.eq('etudiant');
  });
}

function openOwnPortfolio() {
  cy.get('body', { timeout: 15000 }).then(($body) => {
    const portfolioButton = [...$body.find('button')].find((button) => {
      return button.textContent.trim() === 'Portfolio';
    });

    if (portfolioButton) {
      cy.wrap(portfolioButton).click({ force: true });
    } else {
      cy.visit('/portfolio');
    }
  });

  cy.location('pathname', { timeout: 15000 }).should('eq', '/portfolio');
  cy.contains('h2', `${E2E_FIRST_NAME} ${E2E_LAST_NAME}`, {
    timeout: 20000,
  }).should('be.visible');
}

function aboutSection() {
  return cy.contains('h2', /^About me$/).closest('section');
}

function projectsSection() {
  return cy.contains('.portfolio-section-title', /^Projects$/).closest('section');
}

function updateAboutMe(aboutText) {
  cy.intercept('PUT', '**/api/users/*/about').as('saveAbout');

  aboutSection()
    .should('be.visible')
    .within(() => {
      cy.contains('Double-click to edit', { timeout: 15000 }).should('be.visible');
    });

  aboutSection().find('.about-me__body').dblclick({ force: true });

  cy.get('textarea[placeholder="Write a concise professional summary..."]')
    .should('be.visible')
    .clear()
    .type(aboutText);

  cy.contains('button', /save changes/i)
    .should('be.enabled')
    .click();

  cy.wait('@saveAbout')
    .its('response.statusCode')
    .should('eq', 200);

  aboutSection().should('contain.text', aboutText);
}

function fetchAcademicSchool() {
  return apiRequest({
    method: 'GET',
    url: '/api/getInstitutions/academiques',
  }).then((response) => {
    expect(response.status).to.eq(200);

    const schools = Array.isArray(response.body?.data) ? response.body.data : [];
    expect(schools, 'academic institutions from the real backend').to.have.length.greaterThan(0);

    return (
      schools.find((school) => /ensa tanger/i.test(school.nom || '')) ||
      schools[0]
    );
  });
}

function chooseDropdownOption(placeholder, value) {
  cy.get(`input[placeholder="${placeholder}"]`)
    .should('be.visible')
    .clear()
    .type(value);

  cy.contains('button.dropdown__option', value, { timeout: 10000 })
    .should('be.visible')
    .click();
}

function openSchoolModal() {
  cy.contains('h2', /^Education$/)
    .closest('.education')
    .within(() => {
      cy.contains('button', /add academic path/i)
        .should('be.visible')
        .click();
    });

  cy.contains('h3', /^Build your academic path$/, { timeout: 10000 })
    .should('be.visible');
}

function fillSchoolPath(schoolName) {
  cy.intercept('POST', '**/api/select-institutions').as('saveInstitutions');

  openSchoolModal();

  cy.contains('button, [role="button"]', /not currently studying|not studying/i)
  .should('be.visible')
  .click();

  cy.contains('button', /^Next$/).should('be.visible').and('be.enabled').click();

  cy.contains('button.option', /^Bachelor \/ Licence/)
    .should('be.visible')
    .click();

  cy.contains('button', /^Next$/).should('be.visible').and('be.enabled').click();

  chooseDropdownOption('Search Bachelor / Licence school', schoolName);

  cy.contains('label', /^Start year$/)
    .parent()
    .find('input[placeholder="YYYY"]')
    .should('be.visible')
    .clear()
    .type('2020');

  cy.contains('label', /^Completion year$/)
    .parent()
    .find('input[placeholder="YYYY"]')
    .should('be.visible')
    .clear()
    .type('2024');

  cy.contains('button', /^Complete$/)
    .should('be.visible')
    .and('be.enabled')
    .click();

  cy.wait('@saveInstitutions').then(({ request, response }) => {
    expect(response, 'real select-institutions response').to.exist;
    expect(response.statusCode).to.eq(200);
    expect(request.body).to.include({
      etudie: false,
    });
    expect(request.body.institutions).to.have.length(1);
    expect(request.body.institutions[0]).to.include({
      niveau: 'bachelor',
    });
  });

  cy.contains('h3', /^Build your academic path$/).should('not.exist');
  cy.contains('h2', /^Education$/)
    .closest('.education')
    .should('contain.text', schoolName)
    .and('contain.text', 'Bachelor / Licence')
    .and('contain.text', '2020 - 2024');
}

function openProjectModal() {
  projectsSection()
    .should('be.visible')
    .within(() => {
      cy.get('button, [role="button"]', { timeout: 10000 })
        .then(($buttons) => {
          const addButton = [...$buttons].find((button) => {
            const text = button.textContent?.trim() || '';
            const ariaLabel = button.getAttribute('aria-label') || '';
            const title = button.getAttribute('title') || '';

            return /add project|add projects|new project|add|\+/i.test(text) ||
              /add project|add projects|new project|add/i.test(ariaLabel) ||
              /add project|add projects|new project|add/i.test(title);
          });

          expect(addButton, 'project add button').to.exist;

          cy.wrap(addButton)
            .scrollIntoView()
            .should('be.visible')
            .and('not.be.disabled')
            .click({ force: true });
        });
    });

  cy.contains('h2, h3', /create a new project|add project|project/i, {
    timeout: 10000,
  }).should('be.visible');
}

function selectTodayProjectDate() {
  const today = new Date();
  const todayDay = String(today.getDate());

  cy.contains('label', /^Project date$/)
    .parent()
    .as('projectDateField');

  cy.get('@projectDateField')
    .find('button.date-picker__control, button')
    .contains(/select project date/i)
    .should('be.visible')
    .click();

  cy.get('body').then(($body) => {
    const todayButton = [...$body.find('button')].find((button) => {
      const text = button.textContent.trim();

      return (
        text === todayDay &&
        !button.disabled &&
        !button.getAttribute('aria-disabled') &&
        button.offsetParent !== null
      );
    });

    expect(todayButton, `visible date button for day ${todayDay}`).to.exist;

    cy.wrap(todayButton)
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
  });

  cy.get('@projectDateField')
    .find('button.date-picker__control')
    .should('not.contain.text', 'Select project date');
}

function uploadProjectImage() {
  cy.get('input#projectImage')
    .selectFile('cypress/fixtures/project-cover.png', { force: true });

  cy.get('.cropper-modal', { timeout: 10000 })
    .should('be.visible');

  cy.contains('.cropper-modal h3', /crop uploaded image/i, { timeout: 10000 })
    .should('be.visible');

  cy.get('.cropper-modal .image-cropper', { timeout: 15000 })
    .should('be.visible');

  cy.get('.cropper-modal')
    .contains('button, [role="button"]', /^Crop image$/i)
    .should('be.visible')
    .and('not.be.disabled')
    .click({ force: true });

  cy.get('.cropper-modal', { timeout: 20000 })
    .should('not.exist');
}
function createProjectFromModal(project) {
  cy.intercept('POST', '**/api/add-projet').as('createProject');

  openProjectModal();

  cy.get('input[placeholder="Enter your project title"]')
    .should('be.visible')
    .clear()
    .type(project.title)
    .should('have.value', project.title);

  selectTodayProjectDate();
  uploadProjectImage();

  cy.get('textarea[placeholder="Describe your project, its goal, features, and tools used..."]')
    .should('be.visible')
    .clear()
    .type(project.description)
    .should('have.value', project.description);

  cy.contains('button', /^Submit project$/)
    .should('be.visible')
    .and('be.enabled')
    .click();

  cy.wait('@createProject').then(({ request, response }) => {
    expect(response, 'real add-projet response').to.exist;
    expect(response.statusCode).to.eq(201);
    expect(request.body, 'multipart project payload').to.exist;
  });

  cy.contains('h2', /^Create a new project$/).should('not.exist');
}

describe('Portfolio about me and academic path real E2E', () => {
  it('logs in as a real student, updates about me, and saves a real academic path', () => {
    const runId = Date.now();
    const email = `e2e.portfolio.student.${runId}@test.com`;
    const aboutText = `Etudiante E2E passionnee par le developpement full-stack, la qualite logicielle et les portfolios certifies. Run ${runId}.`;

    ensureE2EStudent(email);
    fetchAcademicSchool().as('academicSchool');

    cy.intercept('GET', '**/api/users/portfolio/*').as('fetchPortfolio');

    loginThroughUi(email);
    openOwnPortfolio();

    updateAboutMe(aboutText);

    cy.reload();
    cy.wait('@fetchPortfolio')
      .its('response.statusCode')
      .should('eq', 200);
    aboutSection().should('contain.text', aboutText);

    cy.get('@academicSchool').then((school) => {
      fillSchoolPath(school.nom);

      cy.reload();
      cy.wait('@fetchPortfolio')
        .its('response.statusCode')
        .should('eq', 200);
      cy.contains('h2', /^Education$/)
        .closest('.education')
        .should('contain.text', school.nom)
        .and('contain.text', 'Bachelor / Licence')
        .and('contain.text', '2020 - 2024');
    });
  });

  it('logs in as a real student, creates a project, and keeps it after reload', () => {
    const runId = Date.now();
    const email = `e2e.portfolio.project.${runId}@test.com`;
    const project = {
      title: `Cypress Project ${runId}`,
      description: 'Project created by Cypress E2E test with real backend.',
    };

    ensureE2EStudent(email);

    cy.intercept('GET', '**/api/users/portfolio/*').as('fetchPortfolio');

    loginThroughUi(email);
    openOwnPortfolio();

    createProjectFromModal(project);

    projectsSection()
      .should('contain.text', project.title)
      .and('contain.text', project.description);

    cy.intercept('GET', '**/api/users/portfolio/*').as('reloadPortfolioAfterProject');
    cy.reload();
    cy.wait('@reloadPortfolioAfterProject')
      .its('response.statusCode')
      .should('eq', 200);

    projectsSection()
      .should('contain.text', project.title);
  });
});
