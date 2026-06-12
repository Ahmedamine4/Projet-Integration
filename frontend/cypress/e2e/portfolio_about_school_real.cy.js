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
    .type(email);

  cy.get('input[placeholder="Enter your password"]')
    .should('be.visible')
    .clear()
    .type(E2E_PASSWORD, { log: false });

  cy.contains('button', /^Sign In$/)
    .should('be.enabled')
    .click();

  cy.wait('@loginRequest').then(({ response }) => {
    expect(response.statusCode).to.eq(200);
    expect(response.body.user.email).to.eq(email);
    expect(response.body.user.role).to.eq('etudiant');
  });

  cy.url({ timeout: 15000 }).should('not.include', '/login');
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

  cy.contains('button', /^Save changes$/)
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
      cy.contains('button', /^Add academic path$/)
        .should('be.visible')
        .click();
    });

  cy.contains('h3', /^Build your academic path$/, { timeout: 10000 })
    .should('be.visible');
}

function fillSchoolPath(schoolName) {
  cy.intercept('POST', '**/api/select-institutions').as('saveInstitutions');

  openSchoolModal();

  cy.contains('button.option', /^I am not currently studying/)
    .should('be.visible')
    .click();

  cy.contains('button', /^Next$/).should('be.enabled').click();

  cy.contains('button.option', /^Bachelor \/ Licence/)
    .should('be.visible')
    .click();

  cy.contains('button', /^Next$/).should('be.enabled').click();

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
    .should('be.enabled')
    .click();

  cy.wait('@saveInstitutions')
    .its('response.statusCode')
    .should('eq', 200);

  cy.contains('h3', /^Build your academic path$/).should('not.exist');
  cy.contains('h2', /^Education$/)
    .closest('.education')
    .should('contain.text', schoolName)
    .and('contain.text', 'Bachelor / Licence')
    .and('contain.text', '2020 - 2024');
}

describe('Portfolio about me and academic path real E2E', () => {
  it('logs in as a real student, updates about me, and saves a real academic path', () => {
    const runId = Date.now();
    const email = `e2e.portfolio.student.${runId}@test.com`;
    const aboutText = `Etudiante E2E passionnee par le developpement full-stack, la qualite logicielle et les portfolios certifies. Run ${runId}.`;

    ensureE2EStudent(email);
    fetchAcademicSchool().as('academicSchool');

    loginThroughUi(email);
    openOwnPortfolio();

    cy.intercept('GET', '**/api/users/portfolio/*').as('fetchPortfolio');

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
});
