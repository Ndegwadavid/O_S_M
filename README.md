# OptiPlus System Setup and Usage Instructions

## Project Setup

1. Clone the repository and install dependencies:

```bash
# Clone the project
git clone <repository-url>
cd optiplus-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Configure environment variables:

Create `.env` file in backend directory:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
DB_PATH=./src/db/optiplus.db
BACKUP_PATH=./backups
CLIENT_URL=http://localhost:5173
```

3. Start the development servers:

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

## Available Routes and Endpoints

### Frontend Routes:
- Dashboard: http://localhost:5173/
- Client Registration: http://localhost:5173/clients/register
- Prescriptions: http://localhost:5173/prescriptions
- Sales Order: http://localhost:5173/sales

### Backend API Endpoints:

1. Client Endpoints:
   - GET /api/clients/next-id - Get next client ID
   - POST /api/clients - Register new client
   - GET /api/clients/search - Search clients
   - GET /api/clients/:id - Get client by ID
   - GET /api/clients/:id/history - Get client history

2. Prescription Endpoints:
   - POST /api/prescriptions - Create new prescription
   - GET /api/prescriptions/:id - Get prescription by ID
   - GET /api/prescriptions/client/:clientId - Get client prescriptions
   - GET /api/prescriptions/client/:clientId/latest - Get latest prescription

3. Sales Endpoints:
   - POST /api/sales - Create new sale
   - PATCH /api/sales/:id/status - Update order status
   - GET /api/sales/reference/:referenceNumber - Get order by reference
   - GET /api/sales/pending-collections - Get pending collections
   - GET /api/sales/pending-jobs - Get pending jobs

4. Admin Endpoints:
   - GET /api/admin/trends/registration - Get registration trends
   - GET /api/admin/summary/sales - Get sales summary
   - GET /api/admin/summary/status - Get status summary
   - GET /api/admin/activity/daily - Get daily activity

## Testing the System

1. Start both servers and navigate to http://localhost:5173

2. Testing Flow:
   a. Register a New Client:
      - Go to Client Registration
      - Fill in client details
      - Submit the form
      - Note the generated client ID (M/YYYY/MM/ID format)

   b. Create a Prescription:
      - Go to Prescriptions
      - Search for the client using ID or name
      - Fill in prescription details
      - Save the prescription

   c. Create a Sales Order:
      - Go to Sales Order
      - Search for the client
      - View the latest prescription
      - Fill in order details
      - Create the order

   d. Monitor Dashboard:
      - View registration trends
      - Check pending collections
      - Monitor sales statistics

3. Testing Features:
   - Real-time notifications when new clients are registered
   - Automatic ID generation for clients
   - Status updates for orders
   - Search functionality
   - Data visualization in dashboard

## Common Operations

1. Register New Client:
   - Navigate to Client Registration
   - System automatically generates next ID
   - Fill all required fields
   - Submit form

2. Create Prescription:
   - Navigate to Prescriptions
   - Search for client
   - Enter eye examination details
   - Save prescription

3. Create Sales Order:
   - Navigate to Sales
   - Search for client
   - View prescription
   - Enter product details
   - Set payment information
   - Create order

4. Monitor System:
   - Use Dashboard for overview
   - Check pending collections
   - Monitor registration trends
   - View sales statistics

## Troubleshooting

1. Database Issues:
   - Check if database file exists
   - Verify file permissions
   - Use backup utility if needed

2. Connection Issues:
   - Verify both servers are running
   - Check correct ports are being used
   - Verify environment variables

3. ID Generation Issues:
   - Check current month and year settings
   - Verify ID sequence in database
   - Check for gaps in sequence

## Backup and Maintenance

1. Database Backup:
   ```bash
   # Manual backup
   cd backend
   node src/utils/backup.js create
   ```

2. View Logs:
   ```bash
   # Backend logs
   cd backend
   npm run logs
   ```

3. Clear Database:
   ```bash
   # Reset database (warning: removes all data)
   cd backend
   node src/utils/reset-db.js
   ```

## System Requirements

- Node.js 16+
- npm 7+
- Modern web browser
- Local network access for multi-device usage