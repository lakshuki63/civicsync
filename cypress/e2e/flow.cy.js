describe('CivicSync E2E Flow', () => {
  beforeEach(() => {
    // In a real scenario, this would seed the DB fresh
    cy.visit('http://localhost:3000');
  });

  it('completes the full citizen property transfer flow', () => {
    // 1. Landing Page to Register
    cy.contains('Get Started').click();
    cy.url().should('include', '/register');

    // 2. Register (Mock)
    // We skip actual filling and go straight to login with demo credentials
    cy.visit('http://localhost:3000/login');
    cy.contains('citizen').click(); // Use demo quick-fill
    cy.get('button[type="submit"]').click();
    
    // 3. Dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to your Dashboard').should('be.visible');

    // 4. New Transfer Request
    cy.contains('New Request').click();
    cy.url().should('include', '/transfer/new');
    
    cy.get('input[placeholder="e.g. KA-BLR-2023-1234"]').type('MH-MUM-2024-9999');
    cy.get('textarea[placeholder="Complete property address"]').type('404 Marine Drive, Mumbai');
    cy.get('input[placeholder="e.g. Bengaluru Urban"]').type('Mumbai');
    cy.get('input[placeholder="e.g. Karnataka"]').type('Maharashtra');
    
    cy.get('input[placeholder="As per legal documents"]').type('Aman Gupta');
    cy.get('input[placeholder="10-digit number"]').type('9876543210');
    
    cy.contains('Submit Request').click();
    
    // 5. Transfer Details Page
    cy.url().should('include', '/transfer/');
    cy.contains('MH-MUM-2024-9999').should('be.visible');
    cy.contains('SUBMITTED').should('be.visible');

    // 6. Payment
    cy.contains('Pay Now via UPI').click();
    // Assuming mock payment succeeds instantly and reloads status
    cy.contains('Payment Successful', { timeout: 10000 }).should('be.visible');
    cy.contains('IN REVIEW').should('be.visible');
  });

  it('allows officer to approve a request', () => {
    cy.visit('http://localhost:3000/login');
    cy.contains('officer').click();
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/officer');
    cy.contains('Officer Dashboard').should('be.visible');
    
    // Click Review on the first item
    cy.contains('Review').first().click();
    
    // Check Modal
    cy.contains('Review Request:').should('be.visible');
    cy.get('textarea[placeholder="Enter rejection reason or approval note..."]').type('All documents verified successfully.');
    
    // Approve
    cy.contains('Approve').click();
    
    // Modal should close and list should update
    cy.contains('Review Request:').should('not.exist');
  });
});
