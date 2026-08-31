# Design Document

## Architecture Overview

The enquiry-invoice-generator feature extends the AdminEnquiries component with invoice generation capabilities. The architecture follows a component-based approach with clear separation of concerns:

**Core Components:**
- **InvoiceModal**: Main container component managing invoice creation workflow
- **InvoiceForm**: Form component for capturing invoice details and managing state
- **InvoicePreview**: Display component rendering formatted invoice for preview
- **InvoicePDF**: Service layer handling PDF generation using jsPDF library

**Data Flow:**
1. Admin clicks "Generate Invoice" button on enquiry card
2. InvoiceModal opens with InvoiceForm pre-populated from enquiry data
3. Admin fills/modifies invoice details with real-time calculations
4. Admin clicks "Preview" to see formatted invoice in InvoicePreview
5. Admin clicks "Generate & Send" to generate PDF and trigger WhatsApp
6. PDF downloads, WhatsApp opens with pre-filled message, modals close

**Storage Strategy:**
- **Component State**: Temporary invoice data during creation session (React useState)
- **localStorage**: Persistent invoice counter and business details only
- **No Database**: Invoice data is never persisted to Supabase
- **No Filesystem**: PDFs generated in-memory and directly downloaded

**Integration Points:**
- Reuses existing AdminEnquiries styling constants and patterns
- Leverages existing react-hot-toast notification system
- Follows existing WhatsApp integration pattern (api.whatsapp.com)
- Uses lucide-react icons for consistency

## Component Design

### InvoiceModal Component

**Purpose**: Root component managing the invoice generation workflow and modal state

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  enquiry: {
    id: string,
    name: string,
    phone: string,
    email: string
  }
}
```

**State Management:**
```javascript
{
  showPreview: boolean,         // Controls preview modal visibility
  invoiceData: InvoiceData      // Complete invoice data structure
}
```

**Behavior:**
- Manages modal overlay with backdrop click-to-close
- Prevents body scroll when modal is open
- Handles transition between form view and preview view
- Cleans up state on modal close

**Styling:**
- Full-screen overlay with rgba(0,0,0,0.75) backdrop
- Centered modal with CARD_BG background
- CARD_BORDER with 12px border radius
- Box shadow: 0 20px 60px rgba(0,0,0,0.5)
- Responsive: 90% width on mobile, max-width 900px on desktop

### InvoiceForm Component

**Purpose**: Captures all invoice details with validation and real-time calculations

**Props:**
```javascript
{
  enquiry: Object,              // Pre-fill source data
  onPreview: function,          // Callback with invoice data
  onClose: function             // Close handler
}
```

**State Structure:**
```javascript
{
  invoiceNumber: string,        // Auto-generated on mount
  invoiceDate: string,          // ISO date format, defaults to today
  dueDate: string,              // ISO date format
  lineItems: [
    {
      id: string,               // Unique identifier
      description: string,
      quantity: number,
      unitPrice: number,
      total: number            // Calculated field
    }
  ],
  taxRate: number,             // Percentage (0-100)
  subtotal: number,            // Calculated field
  taxAmount: number,           // Calculated field
  total: number,               // Calculated field
  paymentTerms: string,
  businessName: string,
  businessAddress: string,
  businessContact: string,
  saveBusinessDetails: boolean, // Checkbox to persist to localStorage
  validationErrors: {
    invoiceDate: string,
    dueDate: string,
    lineItems: string,
    paymentTerms: string,
    businessName: string
  }
}
```

**Invoice Number Generation Logic:**
```javascript
// On component mount:
1. Read 'lastInvoiceNumber' from localStorage
2. If exists: parse number, increment by 1
3. If not exists: default to 1
4. Format as "INV-XXX" with zero-padding (e.g., "INV-001", "INV-042")
5. Store new number in state (not yet persisted)
6. Persist to localStorage only after successful invoice send
```

**Calculation Logic:**

*Line Item Total:*
```javascript
lineItem.total = lineItem.quantity * lineItem.unitPrice
```

*Subtotal:*
```javascript
subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
```

*Tax Amount:*
```javascript
taxAmount = subtotal * (taxRate / 100)
```

*Final Total:*
```javascript
total = subtotal + taxAmount
```

*Number Formatting:*
```javascript
amount.toFixed(2)  // Always 2 decimal places
```

**Validation Rules:**

1. **Invoice Date**: Required, cannot be empty
2. **Due Date**: Required, must be >= invoiceDate
3. **Line Items**: At least one item with description, quantity > 0, unitPrice > 0
4. **Payment Terms**: Required, non-empty string
5. **Business Name**: Required, non-empty string

**Validation Implementation:**
```javascript
const validateForm = () => {
  const errors = {}
  
  if (!invoiceDate) {
    errors.invoiceDate = 'Invoice date is required'
  }
  
  if (!dueDate) {
    errors.dueDate = 'Due date is required'
  } else if (new Date(dueDate) < new Date(invoiceDate)) {
    errors.dueDate = 'Due date cannot be earlier than invoice date'
  }
  
  const validItems = lineItems.filter(item => 
    item.description && item.quantity > 0 && item.unitPrice > 0
  )
  if (validItems.length === 0) {
    errors.lineItems = 'At least one complete line item is required'
  }
  
  if (!paymentTerms.trim()) {
    errors.paymentTerms = 'Payment terms are required'
  }
  
  if (!businessName.trim()) {
    errors.businessName = 'Business name is required'
  }
  
  return errors
}
```

**localStorage Integration:**

*Load on Mount:*
```javascript
useEffect(() => {
  const savedBusinessName = localStorage.getItem('invoiceBusinessName')
  const savedBusinessAddress = localStorage.getItem('invoiceBusinessAddress')
  const savedBusinessContact = localStorage.getItem('invoiceBusinessContact')
  const savedPaymentTerms = localStorage.getItem('invoicePaymentTerms')
  
  if (savedBusinessName) setBusinessName(savedBusinessName)
  if (savedBusinessAddress) setBusinessAddress(savedBusinessAddress)
  if (savedBusinessContact) setBusinessContact(savedBusinessContact)
  if (savedPaymentTerms) setPaymentTerms(savedPaymentTerms)
}, [])
```

*Save When Checkbox Enabled:*
```javascript
useEffect(() => {
  if (saveBusinessDetails) {
    localStorage.setItem('invoiceBusinessName', businessName)
    localStorage.setItem('invoiceBusinessAddress', businessAddress)
    localStorage.setItem('invoiceBusinessContact', businessContact)
    localStorage.setItem('invoicePaymentTerms', paymentTerms)
  }
}, [saveBusinessDetails, businessName, businessAddress, businessContact, paymentTerms])
```

**Form Layout:**

Section 1: Invoice Header (2-column grid on desktop)
- Invoice Number (read-only, pre-filled)
- Invoice Date (date input, defaults to today)
- Due Date (date input)

Section 2: Customer Information (pre-filled, read-only display)
- Customer Name
- Phone Number
- Email (if available)

Section 3: Line Items (table layout)
- Column headers: Description | Quantity | Unit Price | Total | Actions
- Dynamic rows with add/remove functionality
- "Add Item" button below table
- Real-time calculation on input change

Section 4: Calculations Summary (right-aligned)
- Subtotal display
- Tax Rate input (percentage)
- Tax Amount display
- Total display (emphasized with larger font)

Section 5: Payment & Business Details (2-column grid on desktop)
- Payment Terms textarea
- Business Name input
- Business Address textarea
- Business Contact input
- "Save business details" checkbox

Section 6: Actions (right-aligned button group)
- "Cancel" button (secondary style)
- "Preview Invoice" button (primary style, disabled if validation fails)

**Error Display:**
- Inline error messages below each field with error
- Red text color (#f87171)
- Error icon from lucide-react
- Error border on invalid input fields

**Styling:**
- Uses inputStyle from AdminEnquiries
- CARD_BG (#242120) for section backgrounds
- CARD_BORDER (rgba(255,255,255,0.07)) for borders
- TEXT_PRIMARY (#F3EBDD) for labels and values
- TEXT_MUTED (rgba(243,235,221,0.45)) for hints
- ACCENT (#D8C7AE) for primary actions
- Font: 'Cormorant Garamond' for headings, 'Inter' for body

### InvoicePreview Component

**Purpose**: Renders formatted invoice layout matching professional invoice standards

**Props:**
```javascript
{
  invoiceData: InvoiceData,
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  onClose: function,
  onGeneratePDF: function
}
```

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│                     INVOICE                          │
│                                                      │
│  Invoice #: INV-001                Date: 2024-01-15 │
│                                  Due: 2024-01-30     │
├─────────────────────────────────────────────────────┤
│  From:                        To:                    │
│  Business Name                Customer Name          │
│  Business Address             Phone: +91...         │
│  Business Contact             Email: ...            │
├─────────────────────────────────────────────────────┤
│  Description    Quantity    Unit Price    Total     │
│  ─────────────────────────────────────────────────  │
│  Item 1         2           ₹500.00      ₹1000.00   │
│  Item 2         1           ₹750.00      ₹750.00    │
├─────────────────────────────────────────────────────┤
│                              Subtotal:  ₹1750.00    │
│                              Tax (18%): ₹315.00     │
│                              ─────────────────────   │
│                              Total:     ₹2065.00    │
├─────────────────────────────────────────────────────┤
│  Payment Terms:                                      │
│  [Payment terms text...]                            │
└─────────────────────────────────────────────────────┘
```

**Styling:**
- Professional invoice layout with clear visual hierarchy
- Header: 'Cormorant Garamond', 2rem, font-weight 700
- Section headers: 'Inter', 0.75rem, uppercase, letter-spacing 0.1em
- Body text: 'Inter', 0.875rem
- Table with alternating row backgrounds for readability
- Currency symbol: ₹ (Indian Rupee)
- Emphasized total with larger font size (1.25rem) and bold weight
- Padding: 32px overall, 16px for sections
- Border: 1px solid CARD_BORDER between sections

**Action Bar:**
- Fixed at bottom of preview modal
- Buttons: "Close" (secondary) and "Generate & Send" (primary with WhatsApp green #25D366)
- Right-aligned button group

### InvoicePDF Service

**Purpose**: Generate PDF from invoice data using jsPDF library

**Library Choice:**
```javascript
// package.json addition needed:
"jspdf": "^2.5.1"
```

**Why jsPDF:**
- React-compatible, runs in browser
- No server-side dependencies
- Generates PDFs in-memory
- Good text formatting and styling support
- Active maintenance and community

**Implementation:**

```javascript
import jsPDF from 'jspdf'

export const generateInvoicePDF = (invoiceData, customerInfo) => {
  try {
    const doc = new jsPDF()
    
    // Set font
    doc.setFont('helvetica')
    
    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 105, 20, { align: 'center' })
    
    // Invoice details
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, 40)
    doc.text(`Date: ${formatDate(invoiceData.invoiceDate)}`, 20, 47)
    doc.text(`Due: ${formatDate(invoiceData.dueDate)}`, 20, 54)
    
    // From section
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('FROM:', 20, 70)
    doc.setFont('helvetica', 'normal')
    doc.text(invoiceData.businessName, 20, 77)
    doc.text(invoiceData.businessAddress, 20, 84, { maxWidth: 80 })
    doc.text(invoiceData.businessContact, 20, 98)
    
    // To section
    doc.setFont('helvetica', 'bold')
    doc.text('TO:', 120, 70)
    doc.setFont('helvetica', 'normal')
    doc.text(customerInfo.name, 120, 77)
    doc.text(`Phone: ${customerInfo.phone}`, 120, 84)
    if (customerInfo.email) {
      doc.text(`Email: ${customerInfo.email}`, 120, 91)
    }
    
    // Line items table header
    let yPos = 115
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 20, yPos)
    doc.text('Qty', 120, yPos)
    doc.text('Unit Price', 140, yPos)
    doc.text('Total', 170, yPos)
    
    // Line separator
    doc.line(20, yPos + 3, 190, yPos + 3)
    yPos += 10
    
    // Line items
    doc.setFont('helvetica', 'normal')
    invoiceData.lineItems.forEach(item => {
      doc.text(item.description, 20, yPos, { maxWidth: 90 })
      doc.text(item.quantity.toString(), 120, yPos)
      doc.text(`₹${item.unitPrice.toFixed(2)}`, 140, yPos)
      doc.text(`₹${item.total.toFixed(2)}`, 170, yPos)
      yPos += 7
    })
    
    // Totals section
    yPos += 5
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    
    doc.text('Subtotal:', 140, yPos)
    doc.text(`₹${invoiceData.subtotal.toFixed(2)}`, 170, yPos)
    yPos += 7
    
    doc.text(`Tax (${invoiceData.taxRate}%):`, 140, yPos)
    doc.text(`₹${invoiceData.taxAmount.toFixed(2)}`, 170, yPos)
    yPos += 7
    
    doc.line(140, yPos, 190, yPos)
    yPos += 7
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Total:', 140, yPos)
    doc.text(`₹${invoiceData.total.toFixed(2)}`, 170, yPos)
    
    // Payment terms
    yPos += 15
    doc.setFontSize(9)
    doc.text('PAYMENT TERMS:', 20, yPos)
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.text(invoiceData.paymentTerms, 20, yPos, { maxWidth: 170 })
    
    // Generate blob for download
    const pdfBlob = doc.output('blob')
    const filename = `Invoice-${invoiceData.invoiceNumber}.pdf`
    
    return { blob: pdfBlob, filename }
    
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF: ' + error.message)
  }
}

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

**Error Handling:**
- Wraps generation in try-catch
- Logs detailed error to console
- Throws user-friendly error message
- Caller displays error toast to admin

**Download Implementation:**
```javascript
const downloadPDF = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

### WhatsApp Integration

**Purpose**: Open WhatsApp with pre-filled message after PDF generation

**Implementation:**

```javascript
const sendInvoiceViaWhatsApp = (customerPhone, invoiceNumber, pdfBlob, pdfFilename) => {
  try {
    // Download PDF first
    downloadPDF(pdfBlob, pdfFilename)
    
    // Format phone number (reuse existing AdminEnquiries logic)
    const cleanPhone = customerPhone.replace(/\D/g, '')
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
    
    // Create WhatsApp message
    const message = 'Please find your invoice attached'
    const encodedMessage = encodeURIComponent(message)
    
    // Build WhatsApp URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodedMessage}`
    
    // Open WhatsApp
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      window.location.href = whatsappUrl
    } else {
      window.open(whatsappUrl, '_blank')
    }
    
    // Show success message
    toast.success('WhatsApp opened! Please manually attach the downloaded PDF.', {
      duration: 5000
    })
    
    // Persist invoice number to localStorage
    localStorage.setItem('lastInvoiceNumber', invoiceNumber)
    
    return true
    
  } catch (error) {
    console.error('WhatsApp integration failed:', error)
    toast.error('Failed to open WhatsApp: ' + error.message)
    return false
  }
}
```

**Phone Number Formatting Logic:**
1. Remove all non-digit characters: `phone.replace(/\D/g, '')`
2. Add country code if missing: Check if starts with '91', else prepend '91'
3. Result format: '919876543210'

**URL Structure:**
```
https://api.whatsapp.com/send?phone=919876543210&text=Please%20find%20your%20invoice%20attached
```

**Success Flow:**
1. PDF downloads to user's device
2. WhatsApp opens in new tab/window with pre-filled message
3. Success toast displays with manual attachment instruction
4. Invoice number persisted to localStorage
5. Both modals (preview and form) close
6. Return to AdminEnquiries view

**Error Handling:**
- Catch any WhatsApp opening errors
- Display error toast with specific message
- Keep modals open on error (allow retry)
- Log error to console for debugging

## Data Models

### InvoiceData Type

```typescript
interface InvoiceData {
  invoiceNumber: string          // Format: "INV-XXX"
  invoiceDate: string           // ISO 8601 date string
  dueDate: string               // ISO 8601 date string
  lineItems: LineItem[]
  taxRate: number               // Percentage (0-100)
  subtotal: number              // Calculated
  taxAmount: number             // Calculated
  total: number                 // Calculated
  paymentTerms: string
  businessName: string
  businessAddress: string
  businessContact: string
}

interface LineItem {
  id: string                    // Unique identifier (UUID or nanoid)
  description: string
  quantity: number
  unitPrice: number
  total: number                 // Calculated: quantity * unitPrice
}

interface CustomerInfo {
  name: string
  phone: string
  email?: string
}
```

### localStorage Schema

```javascript
// Invoice counter
localStorage.setItem('lastInvoiceNumber', 'INV-042')

// Business details (saved only if checkbox enabled)
localStorage.setItem('invoiceBusinessName', 'Rudraksha Equestrian')
localStorage.setItem('invoiceBusinessAddress', '123 Main Street, City, State, PIN')
localStorage.setItem('invoiceBusinessContact', 'contact@example.com | +91-1234567890')
localStorage.setItem('invoicePaymentTerms', 'Payment due within 30 days')
```

**localStorage Error Handling:**
```javascript
const safeLocalStorageGet = (key, defaultValue = null) => {
  try {
    return localStorage.getItem(key) || defaultValue
  } catch (error) {
    console.error(`localStorage get failed for key ${key}:`, error)
    return defaultValue
  }
}

const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(`localStorage set failed for key ${key}:`, error)
    toast.error('Failed to save data locally')
    return false
  }
}
```

## Integration with AdminEnquiries

**Button Addition:**

Add "Generate Invoice" button to each enquiry card in AdminEnquiries.jsx:

```javascript
// After "Edit Notes" button, before closing the admin notes section
<button 
  onClick={() => openInvoiceModal(item)}
  style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: 4, 
    color: ACCENT, 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    fontSize: "0.75rem", 
    fontFamily: "'Inter', sans-serif",
    marginLeft: 8
  }}
>
  <FileText size={12} /> Generate Invoice
</button>
```

**State Addition:**

```javascript
// In AdminEnquiries component
const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
const [selectedEnquiry, setSelectedEnquiry] = useState(null)

const openInvoiceModal = (enquiry) => {
  setSelectedEnquiry(enquiry)
  setInvoiceModalOpen(true)
}

const closeInvoiceModal = () => {
  setInvoiceModalOpen(false)
  setSelectedEnquiry(null)
}
```

**Modal Render:**

```javascript
// At the end of AdminEnquiries return, after WhatsApp modal
{invoiceModalOpen && selectedEnquiry && (
  <InvoiceModal
    isOpen={invoiceModalOpen}
    onClose={closeInvoiceModal}
    enquiry={selectedEnquiry}
  />
)}
```

## Error Handling Strategy

**Categories:**

1. **Validation Errors**: User input issues
   - Display inline error messages below fields
   - Highlight invalid fields with red border
   - Prevent preview until resolved
   - No toast notifications (field-level feedback sufficient)

2. **PDF Generation Errors**: jsPDF failures
   - Catch in generateInvoicePDF function
   - Display error toast with message
   - Log detailed error to console
   - Keep modal open for retry

3. **localStorage Errors**: Storage quota or permissions
   - Catch in safe wrapper functions
   - Log to console
   - Display warning toast
   - Continue functionality (degrade gracefully)

4. **WhatsApp Integration Errors**: URL opening issues
   - Catch in sendInvoiceViaWhatsApp function
   - Display error toast
   - Keep modals open for manual retry
   - Log error details

**Error Display Standards:**

```javascript
// Validation error
<div style={{ 
  color: '#f87171', 
  fontSize: '0.75rem', 
  marginTop: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 4
}}>
  <AlertCircle size={12} />
  {error.message}
</div>

// Toast notifications
toast.error(message, { duration: 4000 })
toast.success(message, { duration: 5000 })
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Invoice Number Format Consistency

*For any* invoice generation session, the generated invoice number SHALL match the pattern "INV-" followed by exactly three zero-padded digits.

**Validates: Requirements 2.1**

### Property 2: Invoice Number Sequential Increment

*For any* existing invoice number in localStorage, generating a new invoice number SHALL produce a number exactly one greater than the stored value.

**Validates: Requirements 2.2, 2.3**

### Property 3: Line Item Total Calculation

*For any* line item with quantity and unit price values, the displayed total SHALL equal the product of quantity and unit price.

**Validates: Requirements 4.4**

### Property 4: Subtotal Summation

*For any* collection of line items with calculated totals, the subtotal SHALL equal the sum of all line item totals.

**Validates: Requirements 5.1**

### Property 5: Tax Amount Calculation

*For any* subtotal and tax rate percentage, the tax amount SHALL equal the subtotal multiplied by the tax rate divided by 100.

**Validates: Requirements 5.3**

### Property 6: Final Total Calculation

*For any* subtotal and tax amount, the final total SHALL equal their sum.

**Validates: Requirements 5.4**

### Property 7: Monetary Formatting Precision

*For any* monetary value displayed in the interface or PDF, the formatted string SHALL contain exactly two decimal places.

**Validates: Requirements 5.6**

### Property 8: Due Date Validation

*For any* pair of invoice date and due date values, validation SHALL fail if the due date is chronologically earlier than the invoice date.

**Validates: Requirements 3.5**

### Property 9: Form Pre-fill from Enquiry

*For any* enquiry object with name and phone fields, opening the invoice form SHALL pre-populate the customer information with those exact values.

**Validates: Requirements 1.4**

### Property 10: Business Details Persistence and Retrieval

*For any* saved business details in localStorage, opening a new invoice form SHALL pre-fill all business fields with the saved values.

**Validates: Requirements 6.6**

### Property 11: Business Details Separate Storage

*For any* saved business details, each field (business name, address, contact, payment terms) SHALL be stored under a separate localStorage key.

**Validates: Requirements 6.7**

### Property 12: Invoice Data Completeness in Preview

*For any* valid invoice data, the preview modal SHALL render all invoice fields including invoice number, dates, line items, calculations, payment terms, and business details.

**Validates: Requirements 7.3**

### Property 13: PDF Filename Format

*For any* invoice number, the generated PDF filename SHALL match the pattern "Invoice-{InvoiceNumber}.pdf".

**Validates: Requirements 8.4**

### Property 14: PDF Generation Success

*For any* valid invoice data structure, the PDF generation function SHALL successfully produce a PDF blob without throwing errors.

**Validates: Requirements 8.1**

### Property 15: Phone Number Formatting Consistency

*For any* input phone number, the WhatsApp integration SHALL format it by removing non-digits and prepending "91" if not already present, producing a number starting with "91".

**Validates: Requirements 9.2**

### Property 16: WhatsApp URL Format

*For any* formatted phone number and message text, the generated WhatsApp URL SHALL follow the pattern "https://api.whatsapp.com/send?phone={phone}&text={encodedText}".

**Validates: Requirements 9.5**

### Property 17: Line Item Validation

*For any* form state where all line items have empty descriptions or zero/negative quantities or prices, the validation SHALL fail.

**Validates: Requirements 10.2**

### Property 18: Preview Blocking on Invalid Form

*For any* invalid form state (missing required fields or invalid line items), the preview button SHALL be disabled or the preview SHALL be blocked from opening.

**Validates: Requirements 10.4**

### Property 19: Required Field Error Display

*For any* empty required field (invoice date, due date, payment terms, business name), an error message SHALL be displayed below that field when validation is triggered.

**Validates: Requirements 10.6**

### Property 20: Invoice Number Storage After Send

*For any* successfully sent invoice, the invoice number SHALL be persisted to localStorage under the key 'lastInvoiceNumber'.

**Validates: Requirements 2.2**

## Testing Strategy

**Unit Tests:**
- Component rendering and UI structure verification
- Button click handlers and modal state transitions
- Form field rendering and initial values
- Specific edge cases (empty localStorage, single line item, etc.)
- Error handling scenarios (PDF failure, localStorage error, etc.)
- Styling consistency verification

**Property-Based Tests:**
- All 20 correctness properties listed above
- Minimum 100 iterations per property test
- Random data generation for invoice numbers, line items, dates, amounts
- Tag format: **Feature: enquiry-invoice-generator, Property {number}: {description}**

**Property Test Examples:**

```javascript
// Property 1: Invoice Number Format
test('Invoice number format consistency', () => {
  fc.assert(
    fc.property(fc.integer({ min: 1, max: 999 }), (num) => {
      const invoiceNumber = generateInvoiceNumber(num)
      expect(invoiceNumber).toMatch(/^INV-\d{3}$/)
    }),
    { numRuns: 100 }
  )
})

// Property 3: Line Item Total Calculation
test('Line item total calculation', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 100 }),
      fc.float({ min: 0.01, max: 10000 }),
      (quantity, unitPrice) => {
        const total = calculateLineTotal(quantity, unitPrice)
        expect(total).toBeCloseTo(quantity * unitPrice, 2)
      }
    ),
    { numRuns: 100 }
  )
})

// Property 8: Due Date Validation
test('Due date validation', () => {
  fc.assert(
    fc.property(
      fc.date(),
      fc.integer({ min: -30, max: 30 }),
      (invoiceDate, dayOffset) => {
        const dueDate = new Date(invoiceDate)
        dueDate.setDate(dueDate.getDate() + dayOffset)
        
        const errors = validateDates(invoiceDate, dueDate)
        
        if (dayOffset < 0) {
          expect(errors.dueDate).toBeDefined()
        } else {
          expect(errors.dueDate).toBeUndefined()
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

**Integration Tests:**
- Full workflow from button click to WhatsApp opening
- localStorage persistence across component remounts
- PDF download trigger verification
- Toast notification display verification
- Modal open/close flow

**Manual Testing:**
- Visual consistency with AdminEnquiries styling
- Responsive layout on mobile devices
- PDF appearance and formatting quality
- WhatsApp message pre-fill correctness
- Accessibility (keyboard navigation, screen readers)

## File Structure

```
src/
├── components/
│   └── invoice/
│       ├── InvoiceModal.jsx         // Root modal component
│       ├── InvoiceForm.jsx          // Form with validation
│       └── InvoicePreview.jsx       // Preview display
├── services/
│   └── invoiceService.js            // PDF generation, WhatsApp integration
└── pages/
    └── admin/
        └── AdminEnquiries.jsx       // Modified to add button + modal
```

**New Dependencies:**
```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "nanoid": "^5.0.0"
  }
}
```

## Implementation Notes

**Why jsPDF?**
- Client-side PDF generation (no server needed)
- React-compatible
- In-memory generation (meets no-persistence requirement)
- Good text and styling support
- Active maintenance

**Why nanoid for Line Item IDs?**
- Lightweight UUID alternative
- Sufficient uniqueness for temporary IDs
- Fast generation
- Already commonly used in React projects

**Styling Consistency:**
All styling variables and patterns are imported from AdminEnquiries:
```javascript
const CARD_BG = "#242120"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#D8C7AE"
```

**localStorage Keys:**
- `lastInvoiceNumber`: Current counter value (format: "INV-XXX")
- `invoiceBusinessName`: Saved business name
- `invoiceBusinessAddress`: Saved business address
- `invoiceBusinessContact`: Saved business contact
- `invoicePaymentTerms`: Saved payment terms

**Mobile Considerations:**
- Responsive grid layouts (1-column on mobile, 2-column on desktop)
- Touch-friendly button sizes (minimum 44px height)
- Modal takes 90% width on small screens
- WhatsApp opens via window.location.href on mobile (instead of window.open)
- Table layout adapts to single column on very small screens

**Accessibility:**
- All form inputs have associated labels
- Error messages linked with aria-describedby
- Modal has proper focus trap
- Keyboard navigation support (Tab, Enter, Escape)
- Color contrast meets WCAG AA standards
- ARIA labels for icon-only buttons

## Sequence Diagram

**Invoice Generation Flow:**

```
Admin              InvoiceModal       InvoiceForm        InvoicePreview     InvoicePDF         WhatsApp
  |                     |                  |                    |                |                 |
  |--Click "Generate"-->|                  |                    |                |                 |
  |                     |--Open Modal----->|                    |                |                 |
  |                     |                  |--Load from-------->|                |                 |
  |                     |                  |  localStorage      |                |                 |
  |                     |                  |<---Return Data-----|                |                 |
  |                     |                  |                    |                |                 |
  |<----Display Form----|<--Render Form----|                    |                |                 |
  |                     |                  |                    |                |                 |
  |--Fill Invoice------>|----------------->|                    |                |                 |
  |  Details            |                  |--Calculate------->|                 |                 |
  |                     |                  |  Totals           |                 |                 |
  |                     |                  |<--Update UI-------|                 |                 |
  |                     |                  |                    |                |                 |
  |--Click "Preview"--->|----------------->|                    |                |                 |
  |                     |                  |--Validate--------->|                |                 |
  |                     |                  |<--Valid------------|                |                 |
  |                     |                  |                    |                |                 |
  |                     |--Show Preview--->|<-------------------|                |                 |
  |<----Display---------|                  |   Render Invoice   |                |                 |
  |    Preview          |                  |                    |                |                 |
  |                     |                  |                    |                |                 |
  |--Click "Generate--->|----------------->|                    |                |                 |
  |  & Send"            |                  |----Generate PDF--->|                |                 |
  |                     |                  |                    |--Create PDF--->|                 |
  |                     |                  |                    |<--Return Blob--|                 |
  |                     |                  |                    |                |                 |
  |                     |                  |----Download PDF--->|----------------|                 |
  |                     |                  |                    |                |                 |
  |                     |                  |----Open WhatsApp-->|----------------|---------------->|
  |                     |                  |                    |                |                 |
  |                     |                  |----Save Invoice--->|                |                 |
  |                     |                  |    Number to       |                |                 |
  |                     |                  |    localStorage    |                |                 |
  |                     |                  |                    |                |                 |
  |<----Toast Success---|<-----------------|--------------------|                |                 |
  |                     |                  |                    |                |                 |
  |                     |--Close All------>|                    |                |                 |
  |                     |  Modals          |                    |                |                 |
  |<----Return to-------|                  |                    |                |                 |
  |    Enquiries        |                  |                    |                |                 |
```

**Key Workflow Steps:**

1. **Initialization**: Admin clicks "Generate Invoice", modal opens, form loads saved business details from localStorage
2. **Data Entry**: Admin fills invoice details, calculations update in real-time
3. **Validation**: Form validates required fields and line items before allowing preview
4. **Preview**: Invoice data rendered in professional format for review
5. **PDF Generation**: jsPDF creates PDF blob in-memory from invoice data
6. **Delivery**: PDF downloads, WhatsApp opens with pre-filled message
7. **Persistence**: Invoice number saved to localStorage for next invoice
8. **Cleanup**: Modals close, invoice data discarded from memory

## Performance Considerations

**Optimization Strategies:**

1. **Debounced Calculations**: Debounce calculation updates on rapid input changes to prevent excessive re-renders
2. **Memoization**: Use React.memo for InvoicePreview component to prevent unnecessary re-renders
3. **Lazy Loading**: Dynamically import jsPDF only when generating PDF (code splitting)
4. **Minimal Re-renders**: Use React.useCallback for event handlers to prevent child re-renders
5. **localStorage Batching**: Batch localStorage writes when saving business details

**Expected Performance:**
- Form renders in <50ms
- Calculations update in <10ms
- PDF generation completes in <500ms for typical invoices
- Modal open/close transitions in <200ms

## Security Considerations

**Data Protection:**
- No sensitive data persisted to database
- Invoice data exists only in memory during session
- localStorage used only for non-sensitive preferences (business details, counter)
- No PII transmitted to external services (WhatsApp receives only phone number)

**Input Validation:**
- Sanitize all user inputs before rendering
- Validate numeric inputs for calculations
- Prevent XSS through React's automatic escaping
- Validate date inputs to prevent invalid date ranges

**localStorage Safety:**
- Use try-catch wrappers for all localStorage operations
- Handle QuotaExceededError gracefully
- No sensitive data stored in localStorage

## Future Enhancements

**Potential Improvements (out of current scope):**

1. **Invoice Templates**: Multiple professional templates for different business types
2. **Tax Configurations**: Support for multiple tax rates (GST, VAT, etc.)
3. **Currency Selection**: Multi-currency support beyond INR
4. **Invoice History**: Optional database persistence for invoice tracking
5. **Bulk Invoicing**: Generate invoices for multiple enquiries at once
6. **Email Integration**: Send invoices via email in addition to WhatsApp
7. **Payment Links**: Integrate with payment gateways for online payments
8. **Invoice Search**: Search and filter previously generated invoices
9. **Custom Branding**: Upload business logo for invoice header
10. **Recurring Invoices**: Template invoices for repeat customers
