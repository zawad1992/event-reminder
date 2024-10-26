# Event Reminder System

A robust event management and reminder system built with Laravel 11, featuring CRUD operations, email notifications, offline capabilities, and CSV import functionality.

## Features

- ✨ Complete CRUD operations for event management
- 📅 Track upcoming and completed events
- 🔔 Automated email reminders
- 📑 Custom event ID generation with predefined prefix
- 💾 Offline functionality with online sync capability
- 📤 CSV import support for event data
- 📨 Email notifications to external participants

## Prerequisites

### System Requirements
- PHP 8.2 or higher
- Composer
- MySQL/MariaDB
- Git

### Required PHP Extensions

#### Core Extensions
- php-openssl (Security features)
- php-pdo (Database connections)
- php-mbstring (String handling)
- php-tokenizer (Parsing)
- php-xml (XML processing)
- php-ctype (Character type checking)
- php-json (JSON processing)
- php-bcmath (Arbitrary precision mathematics)
- php-fileinfo (File handling)
- php-zip (ZIP file operations)

#### Additional Extensions
- php-curl (HTTP requests)
- php-pcntl (Process control)
- php-sockets (WebSocket implementation)

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/zawad1992/event-reminder.git
   cd event-reminder
   ```

2. **Environment Setup**
   
   For Windows:
   ```bash
   ren .env.example .env
   ```
   
   For Linux:
   ```bash
   mv .env.example .env
   ```

3. **Configure Mail Settings**
   
   Modify the following configuration in your `.env` file:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=127.0.0.1
   MAIL_PORT=2525
   MAIL_USERNAME=null
   MAIL_PASSWORD=null
   MAIL_ENCRYPTION=null
   MAIL_FROM_ADDRESS="hello@example.com"
   MAIL_FROM_NAME="${APP_NAME}"
   ```
   Note: Update these values according to your mail server settings.

4. **Install Dependencies**
   ```bash
   composer install
   ```

5. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

6. **Database Setup**
   - Create a database named `dbeventmanager`
   - Update `.env` file with your database credentials
   - Run migrations and seeders:
     ```bash
     php artisan migrate --seed
     ```

7. **Start the Development Server**
   ```bash
   php artisan serve
   # OR specify a custom port
   php artisan serve --port 8585
   ```

## Running the Scheduler

For local development:

1. Open a new terminal in the project root folder
2. Run the following commands:
   ```bash
   # Manual execution of reminders
   php artisan events:send-reminders

   # Run scheduler (executes every 30 minutes)
   php artisan schedule:work
   ```

## Accessing the Application

### Local Development URLs
- Default: `http://127.0.0.1:8000`
- Custom Port: `http://127.0.0.1:8585` (if specified)

### Default Login Credentials
```
Email: zawad1992@gmail.com
Password: password123
```

Alternatively, you can register a new account using the Register button.

## Feature Implementation Status

| Feature | Status |
|---------|--------|
| CRUD Operations | ✅ Complete |
| Event Reminder ID Generation | ✅ Complete |
| Offline/Online Sync | ⚠️ Implemented with known issues |
| Email Reminders | ✅ Complete |
| CSV Import | ✅ Complete |

## Support

For support, please [send a message](https://zawadulkawum.com/) on my professional website.