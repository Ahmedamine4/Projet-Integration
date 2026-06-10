describe('Full system E2E', () => {
  it('logs in with real frontend, backend and database', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    cy.visit('/login');

    cy.get('input[placeholder="name@company.com"]')
      .should('be.visible')
      .clear()
      .type('e2e.student@test.com');

    cy.get('input[placeholder="Enter your password"]')
      .should('be.visible')
      .clear()
      .type('Nour2006*');

    cy.contains('button', /sign in/i).click();

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);

    cy.url().should('not.include', '/login');
  });
});
describe('Full system E2E', () => {
  it('logs in with real frontend, backend and database', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    cy.visit('/login');

    cy.pause();

    cy.get('input[placeholder="name@company.com"]')
      .should('be.visible')
      .clear()
      .type('e2e.student@test.com');

    cy.get('input[placeholder="Enter your password"]')
      .should('be.visible')
      .clear()
      .type('TON_MOT_DE_PASSE');

    cy.contains('button', /sign in/i).click();

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);

    cy.url().should('not.include', '/login');
  });
});
it('opens the feed after real login', () => {
  cy.intercept('POST', '**/api/auth/login').as('loginRequest');

  cy.visit('/login');

  cy.get('input[placeholder="name@company.com"]')
    .should('be.visible')
    .clear()
    .type('e2e.student@test.com');

  cy.get('input[placeholder="Enter your password"]')
    .should('be.visible')
    .clear()
    .type('TON_MOT_DE_PASSE');

  cy.contains('button', /sign in/i).click();

  cy.wait('@loginRequest')
    .its('response.statusCode')
    .should('be.oneOf', [200, 201]);

  cy.visit('/feed');

  cy.url().should('include', '/feed');
  cy.contains(/top students|recommended opportunities|students/i)
    .should('be.visible');
});