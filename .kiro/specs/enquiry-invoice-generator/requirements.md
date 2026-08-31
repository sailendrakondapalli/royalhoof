# Requirements Document

## Introduction

This feature adds invoice generation and PDF sending capabilities to the AdminEnquiries component. Administrators can create professional invoices for enquiries, preview them, and send them via WhatsApp. Invoices are generated on-the-fly without database persistence, utilizing the existing WhatsApp flow where the admin manually attaches the generated PDF.

## Glossary

- **Invoice_Generator**: The system component responsible for creating invoice data structures and rendering invoice UI
- **PDF_Generator**: The system component responsible for converting invoice data into PDF format
- **Invoice_Form**: The user interface component that captures invoice details
- **AdminEnquiries_Component**: The existing admin page component for managing customer enquiries
- **WhatsApp_Integration**: The existing system mechanism that opens WhatsApp with pre-filled messages
- **Invoice_Data**: The structured data object containing all invoice information (invoice number, dates, items, amounts, business details, payment terms)
- **Line_Item**: An individual row in the invoice containing item description, quantity, unit price, and total
- **Invoice_Number**: A unique identifier auto-generated in sequential format (e.g., INV-001, INV-002)
- **Preview_Modal**: The UI component that displays the formatted invoice before sending

## Requirements

### Requirement 1: Invoice Form Interface

**User Story:** As an administrator, I want to access an invoice creation form from each enquiry, so that I can generate invoices for customers.

#### Acceptance Criteria

1. WHEN the administrator views an enquiry in AdminEnquiries_Component, THE Invoice_Generator SHALL display an "Generate Invoice" action button
2. WHEN the administrator clicks the "Generate Invoice" button, THE Invoice_Generator SHALL open Invoice_Form in a modal overlay
3. THE Invoice_Form SHALL display all required input fields organized in a logical layout
4. THE Invoice_Form SHALL pre-fill the customer name and phone number from the selected enquiry data
5. WHEN the modal is open, THE Invoice_Form SHALL prevent interaction with the underlying AdminEnquiries_Component content

### Requirement 2: Invoice Number Generation

**User Story:** As an administrator, I want invoice numbers to be automatically generated, so that each invoice has a unique sequential identifier.

#### Acceptance Criteria

1. WHEN Invoice_Form is opened, THE Invoice_Generator SHALL generate an invoice number in the format "INV-XXX" where XXX is a zero-padded sequential number
2. THE Invoice_Generator SHALL store the last used invoice number in browser localStorage
3. WHEN generating a new invoice number, THE Invoice_Generator SHALL increment the last used number by one
4. IF no previous invoice number exists in localStorage, THEN THE Invoice_Generator SHALL start the sequence at "INV-001"
5. THE Invoice_Form SHALL display the generated invoice number in a read-only field

### Requirement 3: Invoice Date Fields

**User Story:** As an administrator, I want to specify invoice dates, so that I can document when the invoice was issued and when payment is due.

#### Acceptance Criteria

1. THE Invoice_Form SHALL provide an "Invoice Date" input field of type date
2. THE Invoice_Form SHALL provide a "Due Date" input field of type date
3. WHEN Invoice_Form is opened, THE Invoice_Form SHALL pre-fill the "Invoice Date" field with the current date
4. THE Invoice_Form SHALL allow the administrator to modify both date fields
5. THE Invoice_Form SHALL validate that the due date is not earlier than the invoice date

### Requirement 4: Line Items Management

**User Story:** As an administrator, I want to add multiple line items to an invoice, so that I can bill for different products or services.

#### Acceptance Criteria

1. THE Invoice_Form SHALL display a line items section with columns for description, quantity, unit price, and total
2. THE Invoice_Form SHALL allow the administrator to add a new Line_Item by clicking an "Add Item" button
3. WHEN a Line_Item is added, THE Invoice_Form SHALL create a new row with empty input fields for description, quantity, and unit price
4. THE Invoice_Form SHALL calculate and display the line total as quantity multiplied by unit price
5. THE Invoice_Form SHALL allow the administrator to remove a Line_Item by clicking a delete button on that row
6. THE Invoice_Form SHALL display at least one Line_Item row by default
7. WHEN quantity or unit price changes, THE Invoice_Form SHALL recalculate the line total in real-time

### Requirement 5: Financial Calculations

**User Story:** As an administrator, I want subtotal, tax, and total amounts to be automatically calculated, so that I don't have to manually compute invoice totals.

#### Acceptance Criteria

1. THE Invoice_Form SHALL calculate the subtotal as the sum of all Line_Item totals
2. THE Invoice_Form SHALL provide a "Tax Rate" input field accepting percentage values
3. WHEN the tax rate or subtotal changes, THE Invoice_Form SHALL calculate tax amount as subtotal multiplied by tax rate percentage
4. THE Invoice_Form SHALL calculate the final total as subtotal plus tax amount
5. THE Invoice_Form SHALL display subtotal, tax amount, and total in a summary section
6. THE Invoice_Form SHALL format all monetary amounts with two decimal places
7. THE Invoice_Form SHALL update all calculations in real-time as input values change

### Requirement 6: Payment Terms and Business Details

**User Story:** As an administrator, I want to include payment terms and business details on the invoice, so that customers know how and when to pay.

#### Acceptance Criteria

1. THE Invoice_Form SHALL provide a "Payment Terms" text input field
2. THE Invoice_Form SHALL provide a "Business Name" text input field
3. THE Invoice_Form SHALL provide a "Business Address" textarea field
4. THE Invoice_Form SHALL provide a "Business Contact" text input field
5. THE Invoice_Form SHALL allow the administrator to optionally save business details to localStorage for future use
6. WHEN business details exist in localStorage, THE Invoice_Form SHALL pre-fill business fields with saved values
7. THE Invoice_Form SHALL store payment terms, business name, business address, and business contact separately in localStorage

### Requirement 7: Invoice Preview

**User Story:** As an administrator, I want to preview the invoice before sending, so that I can verify all information is correct.

#### Acceptance Criteria

1. WHEN the administrator clicks a "Preview" button in Invoice_Form, THE Invoice_Generator SHALL display Preview_Modal
2. THE Preview_Modal SHALL render Invoice_Data in a professional invoice layout format
3. THE Preview_Modal SHALL display all invoice information including invoice number, dates, line items, calculations, payment terms, and business details
4. THE Preview_Modal SHALL format the invoice with clear visual hierarchy and appropriate spacing
5. THE Preview_Modal SHALL provide a "Close" button to return to Invoice_Form
6. THE Preview_Modal SHALL provide a "Generate & Send" button to proceed with PDF generation
7. WHEN Preview_Modal is open, THE Invoice_Generator SHALL prevent interaction with Invoice_Form

### Requirement 8: PDF Generation

**User Story:** As an administrator, I want to generate a PDF from the invoice data, so that I can send a professional document to customers.

#### Acceptance Criteria

1. WHEN the administrator clicks "Generate & Send" in Preview_Modal, THE PDF_Generator SHALL convert Invoice_Data into PDF format
2. THE PDF_Generator SHALL create a PDF with professional styling matching the preview layout
3. THE PDF_Generator SHALL generate the PDF file in-memory without persisting to filesystem or database
4. THE PDF_Generator SHALL name the PDF file using the format "Invoice-{InvoiceNumber}.pdf"
5. IF PDF generation fails, THEN THE PDF_Generator SHALL display an error message to the administrator
6. THE PDF_Generator SHALL use a JavaScript library compatible with React for PDF generation

### Requirement 9: WhatsApp Integration

**User Story:** As an administrator, I want to send the generated invoice via WhatsApp, so that I can deliver invoices using the customer's preferred communication channel.

#### Acceptance Criteria

1. WHEN PDF generation completes successfully, THE WhatsApp_Integration SHALL open the WhatsApp interface with the enquiry's phone number
2. THE WhatsApp_Integration SHALL format the phone number according to existing AdminEnquiries_Component WhatsApp flow logic
3. THE WhatsApp_Integration SHALL pre-fill a message text stating "Please find your invoice attached"
4. THE WhatsApp_Integration SHALL trigger a browser download of the generated PDF file
5. THE WhatsApp_Integration SHALL use the existing WhatsApp URL pattern ("https://api.whatsapp.com/send") with phone parameter and encoded text
6. WHEN WhatsApp opens, THE Invoice_Generator SHALL display a success toast notification instructing the administrator to manually attach the downloaded PDF
7. WHEN WhatsApp opens, THE Invoice_Generator SHALL close Preview_Modal and Invoice_Form

### Requirement 10: Form Validation

**User Story:** As an administrator, I want the invoice form to validate required fields, so that I cannot generate incomplete invoices.

#### Acceptance Criteria

1. THE Invoice_Form SHALL mark invoice date, due date, payment terms, and business name as required fields
2. THE Invoice_Form SHALL validate that at least one Line_Item exists with description, quantity, and unit price filled
3. WHEN the administrator attempts to preview with invalid data, THE Invoice_Form SHALL display validation error messages
4. THE Invoice_Form SHALL prevent opening Preview_Modal until all validation requirements are met
5. THE Invoice_Form SHALL highlight fields with validation errors using visual indicators
6. WHEN a required field is empty, THE Invoice_Form SHALL display an error message below that field

### Requirement 11: User Interface Styling

**User Story:** As an administrator, I want the invoice interface to match the existing AdminEnquiries design, so that the user experience is consistent.

#### Acceptance Criteria

1. THE Invoice_Form SHALL use the same color scheme as AdminEnquiries_Component (CARD_BG, CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED, ACCENT)
2. THE Invoice_Form SHALL use the same typography families as AdminEnquiries_Component ("Cormorant Garamond" for headings, "Inter" for body text)
3. THE Invoice_Form SHALL apply the same input styling as existing AdminEnquiries_Component form fields
4. THE Preview_Modal SHALL use consistent modal overlay styling with AdminEnquiries_Component WhatsApp modal
5. THE Invoice_Generator SHALL use the same button styling patterns as AdminEnquiries_Component action buttons
6. THE Invoice_Form SHALL be responsive and adapt to mobile screen sizes

### Requirement 12: Error Handling

**User Story:** As an administrator, I want to see helpful error messages when something goes wrong, so that I can understand and resolve issues.

#### Acceptance Criteria

1. IF PDF generation fails, THEN THE PDF_Generator SHALL display a toast notification with the error message
2. IF WhatsApp_Integration fails to open, THEN THE WhatsApp_Integration SHALL display an error toast notification
3. IF localStorage operations fail, THEN THE Invoice_Generator SHALL log the error to console and continue without saved data
4. WHEN a calculation error occurs, THE Invoice_Form SHALL display "Error" in the affected amount field
5. THE Invoice_Generator SHALL use the existing toast notification system from AdminEnquiries_Component

### Requirement 13: No Persistence Requirement

**User Story:** As an administrator, I want invoices to be generated on-the-fly without database storage, so that the system remains lightweight and fast.

#### Acceptance Criteria

1. THE Invoice_Generator SHALL NOT store Invoice_Data in any database
2. THE Invoice_Generator SHALL NOT persist PDF files to server filesystem
3. THE Invoice_Generator SHALL generate Invoice_Data only in browser memory during the invoice creation session
4. WHEN Invoice_Form or Preview_Modal is closed, THE Invoice_Generator SHALL discard Invoice_Data from memory
5. THE Invoice_Generator SHALL only persist invoice counter and business details to localStorage for convenience
