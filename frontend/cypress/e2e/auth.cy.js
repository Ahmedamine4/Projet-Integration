describe('Authentication flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/auth/profile', {
      statusCode: 401,
      body: {
        message: 'Not authenticated',
      },
    }).as('profileRequest');
  });

  it('opens the login page', () => {
    cy.visit('/login');

    cy.url().should('include', '/login');
    cy.contains('Welcome back').should('be.visible');
    cy.contains('Sign In').should('be.visible');
  });

  it('logs in successfully and leaves the login page', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        user: {
          id: 1,
          prenom: 'Wissam',
          nom: 'Bakkali',
          email: 'wissam@test.com',
          role: 'etudiant',
        },
      },
    }).as('loginRequest');

    cy.visit('/login');

    cy.get('input[placeholder="name@company.com"]')
      .should('be.visible')
      .type('wissam@test.com');

    cy.get('input[placeholder="Enter your password"]')
      .should('be.visible')
      .type('Password123!');

    cy.contains('button', /sign in/i).click();

    cy.wait('@loginRequest');

    cy.url().should('not.include', '/login');
  });
});