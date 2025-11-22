# Vantelle BD Order Management System

A modern **e-commerce order management system** built with **React**, **Node.js**, and **PostgreSQL**, allowing users to place, track, and manage orders. The system also supports generating **professional PDF invoices** for each order.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- User authentication and authorization
- View orders by status: Pending, Confirmed, Processing, Delivered, Cancelled
- Track orders with unique tracking numbers
- Cancel pending orders
- Generate PDF invoices for orders
- Responsive and clean UI
- Admin dashboard for managing orders (planned)

---

## Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** PostgreSQL  
- **Authentication:** JWT  
- **PDF Generation:** html2pdf.js  
- **Version Control:** Git  

---

## Architecture

```mermaid
flowchart TD
    A[User] -->|Login/Register| B[React Frontend]
    B -->|API Calls| C[Node.js Express Backend]
    C -->|Queries| D[PostgreSQL Database]
    C -->|Generate PDF| E[html2pdf.js]
    D -->|Order Data| C
    C -->|Response| B
    B -->|View PDF| F[Browser Download]
erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o| ADDRESSES : ships_to
    CART ||--o| PRODUCTS : contains
    PRODUCTS ||--o{ PRODUCT_IMAGES : has_images

    USERS {
        int user_id PK
        string full_name
        string username
        string email
        string phone
        string password_hash
        string gender
        bytea profile_image
        string role
        string status
        timestamp created_at
        timestamp updated_at
    }

    ADDRESSES {
        int address_id PK
        int user_id FK
        string address_line1
        string address_line2
        string city
        string state
        string division
        string country
        string postal_code
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        int id PK
        string title
        text description
        numeric price
        numeric discount
        string discount_type
        int inventory
        string category
        string color
        string[] size_options
        boolean is_featured
        string status
        string gender
        string season
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_IMAGES {
        int id PK
        int product_id FK
        bytea image_data
        string color
        boolean is_main
        timestamp created_at
    }

    CART {
        int id PK
        int user_id FK
        int product_id FK
        int quantity
        numeric unit_price
        string size
        string color
        numeric discount
        string discount_type
        timestamp added_at
    }

    ORDERS {
        int order_id PK
        int user_id FK
        timestamp order_date
        string status
        numeric total_amount
        string payment_method
        string payment_status
        text shipping_address
        numeric shipping_fee
        string tracking_number
        string estimated_delivery
        text notes
        string coupon_code
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        numeric unit_price
        numeric discount
        string discount_type
        string size
        string color
        numeric total_price
    }
```
## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn
- Git

## Installation & run

Clone repo:
```bash
git clone https://github.com/yourusername/vantelle-orders.git
cd vantelle-orders
```

Backend:
```bash
cd backend
npm install
# start in dev mode (e.g. nodemon)
npm run dev
```

Frontend:
```bash
cd ../frontend
npm install
npm start
# opens at http://localhost:3000 by default
```

## Environment variables (example)

Create a `.env` in backend:
```
DATABASE_URL=postgres://username:password@localhost:5432/vantelle_db
JWT_SECRET=your_jwt_secret
PORT=5000
```

Adjust frontend config (API base URL) if needed, e.g. in frontend/src/pages/config.js:
```js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
export default API_BASE_URL;
```

## Usage

- Register or login
- Browse products, add to cart, checkout
- View orders, download invoice PDFs

## Troubleshooting

- Ensure PostgreSQL is running and DATABASE_URL is correct.
- For CORS issues, enable CORS middleware in backend.
- Check browser console and backend logs for errors.

## Future improvements

- Admin dashboard
- Email notifications
- Inventory & stock management
- Internationalization (i18n)
- Mobile-first responsive improvements

## License

MIT

Author: Abu Russel  
Contact: aburussel87@gmail.com