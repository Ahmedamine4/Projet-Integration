const E2E_EMAIL = 'exemple123@gmail.com';
const E2E_PASSWORD = 'Test123!';

function loginWithRealBackend() {
  cy.clearCookies();
  cy.clearLocalStorage();

  cy.intercept('POST', '**/api/auth/login').as('loginRequest');

  cy.visit('/login');

  cy.get('input[placeholder="name@company.com"]')
    .should('be.visible')
    .clear()
    .type(E2E_EMAIL);

  cy.get('input[placeholder="Enter your password"]')
    .should('be.visible')
    .clear()
    .type(E2E_PASSWORD, { log: false });

  cy.contains('button', /sign in/i).click();

  cy.wait('@loginRequest')
    .its('response.statusCode')
    .should('be.oneOf', [200, 201]);
}

function assertMainProgress(progressText) {
  cy.contains('.wrapper-header', 'Getting Started', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.contains(progressText).should('be.visible');
    });
}

function clickGettingStartedStep(stepTitle) {
  cy.contains('.step', stepTitle, { timeout: 10000 })
    .should('be.visible')
    .click({ force: true });
}

function completeSchoolPathModal() {
  // Ouvre le modal school
  clickGettingStartedStep(/Build your academic path/i);

  cy.get('.modal', { timeout: 10000 })
    .should('be.visible');

  cy.contains('.modal', /Build your academic path/i)
    .should('be.visible');

  // Step 1 : Study status
  cy.contains('.modal', /Study status/i)
    .should('be.visible');

  cy.contains('button.option', /I am not currently studying/i)
    .should('be.visible')
    .click({ force: true });

  cy.contains('button', /^Next$/i)
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true });

  // Step 2 : Academic level
  cy.contains('.modal', /Academic level/i, { timeout: 10000 })
    .should('be.visible');

  cy.contains('button.option', /Bachelor \/ Licence/i)
    .should('be.visible')
    .click({ force: true });

  cy.contains('button', /^Next$/i)
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true });

  // Step 3 : Bachelor school form
  cy.contains('.modal', /Bachelor \/ Licence school/i, { timeout: 10000 })
    .should('be.visible');

  cy.get('input[placeholder="Search Bachelor / Licence school"]', {
    timeout: 10000,
  })
    .should('be.visible')
    .click({ force: true })
    .clear({ force: true });

  // BaseDropdown affiche les options via .dropdown__option
  cy.get('.dropdown__option', { timeout: 10000 })
    .first()
    .should('be.visible')
    .click({ force: true });

  // YearInput : champs année
  cy.get('.modal input[placeholder="YYYY"]', { timeout: 10000 })
    .should('have.length.at.least', 2);

  cy.get('.modal input[placeholder="YYYY"]')
    .eq(0)
    .should('be.visible')
    .clear({ force: true })
    .type('2020', { force: true });

  cy.get('.modal input[placeholder="YYYY"]')
    .eq(1)
    .should('be.visible')
    .clear({ force: true })
    .type('2024', { force: true });

  cy.contains('button', /^Complete$/i, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true });

  // Le modal doit se fermer
  cy.get('.modal').should('not.exist');
}

function completePhoneStep() {
  clickGettingStartedStep(/Add your phone number/i);

  cy.get('input[placeholder="Enter your phone number"]', {
    timeout: 10000,
  })
    .should('be.visible')
    .clear()
    .type('612345678');

  cy.contains('button', /save phone number/i)
    .should('be.visible')
    .click();

  assertMainProgress('3 / 3');
}

describe('Getting Started E2E', () => {
  it('logs in and completes getting started steps', () => {
    loginWithRealBackend();

    cy.intercept('GET', '**/api/getInstitutions').as('getInstitutions');

    // ?github=connected marque GitHub comme done dans le composant
    cy.visit('/getting-started?github=connected');

    cy.wait('@getInstitutions');

    cy.contains("Let's get you set up", { timeout: 10000 })
      .should('be.visible');

    cy.contains('Getting Started')
      .should('be.visible');

    // GitHub est déjà done grâce à ?github=connected
    assertMainProgress('1 / 3');

    completeSchoolPathModal();

    // School done + GitHub done
    assertMainProgress('2 / 3');

    completePhoneStep();
  });
});