const E2E_EMAIL = 'e2e.student@test.com';
const E2E_PASSWORD = 'Nour2006*';

function loginWithRealBackend() {
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

  cy.url().should('not.include', '/login');
}

function openPortfolio() {
  cy.get('body').then(($body) => {
    const portfolioLink = $body.find('a[href*="portfolio"]').first();

    if (portfolioLink.length) {
      cy.wrap(portfolioLink).click({ force: true });
    } else {
      cy.contains('a, button', /portfolio/i).click({ force: true });
    }
  });

  cy.url().should('include', 'portfolio');
}

describe('Portfolio full E2E', () => {
  it('logs in, opens portfolio, updates about me and adds a project', () => {
    const runId = Date.now();

    loginWithRealBackend();
    openPortfolio();

    // ABOUT ME
    cy.contains(/about me|about/i, { timeout: 15000 })
      .should('be.visible')
      .closest('section, article, div')
      .as('aboutSection');

    cy.get('@aboutSection')
      .find(
        'p, .section-body, .section-content, .about-body, .about-content, [class*="body"], [class*="content"]'
      )
      .filter(':visible')
      .first()
      .dblclick({ force: true });

    cy.get('textarea:visible, input[type="text"]:visible', { timeout: 15000 })
      .first()
      .should('be.visible')
      .clear()
      .type(
        `E2E about me test ${runId}. I am testing the full portfolio workflow with Cypress.`
      );

    cy.contains('button', /save|enregistrer|submit|update/i, { timeout: 10000 })
      .click({ force: true });

    cy.contains(`E2E about me test ${runId}`, { timeout: 15000 })
      .should('be.visible');

    // ADD PROJECT
    cy.contains('button', /add project/i, { timeout: 15000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.contains(/create a new project/i, { timeout: 15000 })
      .should('be.visible');

    cy.get('input[placeholder="Enter your project title"]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(`E2E Project ${runId}`);

    cy.get('input[type="date"], input[placeholder="Select project date"]', {
      timeout: 15000,
    })
      .first()
      .clear()
      .type('2026-06-10');

    cy.get('input[type="file"]', { timeout: 15000 })
      .first()
      .selectFile('cypress/fixtures/project-cover.png', { force: true });

    cy.get('body').then(($body) => {
      const cropButton = [...$body.find('button')].find((button) => {
        return /crop|confirm|apply|done|save image|use image|valider/i.test(
          button.innerText
        );
      });

      if (cropButton) {
        cy.wrap(cropButton).click({ force: true });
      }
    });

    cy.get('#description', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(
        'This is a real E2E project created with Cypress using the frontend, backend and database.'
      );

    cy.get('input[placeholder="https://github.com/username/project-name"]', {
      timeout: 15000,
    })
      .should('be.visible')
      .clear()
      .type('https://github.com/e2e/project-test');

    cy.intercept('POST', '**/api/**').as('createProjectRequest');

    cy.contains('button', /submit project/i, { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });

    cy.wait('@createProjectRequest', { timeout: 30000 })
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);

    cy.contains(`E2E Project ${runId}`, { timeout: 30000 })
      .should('be.visible');
  });
});