# 🛒 Grocery Shop Management System

A comprehensive, full-featured grocery shop management system built with Node.js, Express, and MySQL. Manage inventory, track sales, monitor expenses, and analyze business performance.

## Features

- **Dashboard**: Real-time statistics and recent sales overview
- **Product Inventory**: Complete product management with categories, pricing, and stock levels
- **Sales Management**: Track all sales transactions with detailed breakdown
- **Expense Tracking**: Monitor shop expenses by category
- **Analytics**: Revenue analysis, top-selling products, and category-wise sales
- **Backup Management**: Automatic backups every 2 hours with FTP support
- **User Management**: Multiple user roles (Master Admin, Admin, Manager, Cashier)
- **Settings**: Customizable shop information and FTP backup configuration

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Vanilla JavaScript with responsive CSS
- **Backup**: Node Cron + Basic FTP

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- MySQL 8.0 or higher
- npm or pnpm

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grocery-shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure MySQL connection in `.env`**
   ```
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=grocery_shop
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

5. **Initialize database with sample data**
   ```bash
   npm run init-db
   ```

6. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Master Admin | master | master123 |
| Admin | admin | admin123 |
| Cashier | cashier | cashier123 |

## Project Structure

```
grocery-shop/
├── public/
│   └── index.html          # Frontend UI
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── dashboard.js        # Dashboard statistics
│   ├── products.js         # Product management
│   ├── sales.js            # Sales management
│   ├── expenses.js         # Expense management
│   ├── analytics.js        # Analytics and reports
│   ├── backup.js           # Backup management
│   ├── users.js            # User management
│   └── settings.js         # Settings management
├── server.js               # Express server setup
├── db.js                   # Database connection
├── auth.js                 # Authentication middleware
├── init-db.js              # Database initialization
├── package.json            # Dependencies
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-sales` - Get recent sales

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories/list` - Get product categories
- `POST /api/products` - Add new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/alerts/low-stock` - Get low stock items

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale

### Expenses
- `GET /api/expenses` - Get all expenses (Admin only)
- `POST /api/expenses` - Add new expense (Admin only)
- `DELETE /api/expenses/:id` - Delete expense (Admin only)
- `GET /api/expenses/summary/all` - Get expense summary

### Analytics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/top-products` - Top selling products
- `GET /api/analytics/category-sales` - Category-wise sales
- `GET /api/analytics/monthly-trend` - Monthly revenue trend

### Backup
- `GET /api/backup/list` - List all backups
- `GET /api/backup/download/:filename` - Download backup
- `POST /api/backup/manual` - Create manual backup

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update setting

## Features in Detail

### Inventory Management
- Add, edit, and delete products
- Track stock levels with min/max alerts
- Categorize products
- Monitor expiry dates
- Supplier information

### Sales Tracking
- Record daily sales transactions
- Track items sold and total revenue
- Payment method recording
- Cashier attribution

### Expense Tracking
- Categorize expenses (Rent, Utilities, etc.)
- Track expense dates
- View expense summaries
- Generate expense reports

### Analytics
- Revenue trends over time
- Top-selling products analysis
- Category-wise sales breakdown
- Monthly performance tracking

### Automated Backups
- Automatic backups every 2 hours
- Keep last 5 backups locally
- Optional FTP backup support
- Manual backup creation

## Configuration

### FTP Backup Setup

To enable FTP backups, update the settings in the app:

1. Go to Settings → Backup Management
2. Configure FTP details:
   - FTP Host
   - FTP User
   - FTP Password
   - FTP Port (default: 21)
   - FTP Path (default: /backups)

## Database Schema

### Users
- id, username, password, name, role, created_at

### Products
- id, name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level, supplier, expiry_date, created_at

### Sales
- id, sale_date, cashier_id, total_items, total_amount, payment_method, created_at

### Sale Items
- id, sale_id, product_id, quantity, unit_price, total_price

### Expenses
- id, category, description, amount, expense_date, created_by, created_at

### Settings
- s_key, s_value, updated_at

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected API endpoints
- CORS enabled

## Troubleshooting

### MySQL Connection Failed
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database exists or will be created

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

### Backup Not Working
- Check FTP credentials if FTP backup is enabled
- Verify backups folder has write permissions
- Check server logs for detailed error messages

## Future Enhancements

- SMS/Email notifications for low stock
- Barcode scanning integration
- Customer loyalty program
- Supplier management
- Advanced reporting and dashboards
- Mobile app for cashiers
- Multi-store support

## Support

For issues or questions, please check the logs or contact the development team.

## License

This project is proprietary and confidential.

---

**Happy Selling! 🛒**
