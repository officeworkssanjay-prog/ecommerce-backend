# Setup, Configuration & Deployment Runbook

This guide contains complete technical instructions for developers and DevOps engineers setting up, running, configuring, and deploying the Multi-Vendor E-Commerce Platform.

---

## 💻 System Prerequisites

Ensure your host system meets the minimum requirements:

| Component | Minimum Requirement | Recommended |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 20.04/22.04 LTS, macOS, or Windows 10/11 | Linux Ubuntu 22.04 LTS |
| **PHP Version** | `^8.1` | PHP 8.2 |
| **Web Server** | Nginx `1.18+` or Apache `2.4+` | Nginx |
| **Database** | MySQL `5.7+` or MySQL `8.0` | MySQL 8.0 / MariaDB 10.6 |
| **Composer** | Composer `2.2+` | Composer 2.6+ |
| **Node.js** | Node.js `16.x` or `18.x` | Node.js 18 LTS |
| **NPM** | `8.x` or `9.x` | NPM 9.x |

### Required PHP Extensions:
- `bcmath`
- `ctype`
- `curl`
- `dom`
- `fileinfo`
- `gd` *(critical for product image uploads & thumbnails)*
- `json`
- `mbstring`
- `openssl`
- `pcre`
- `pdo`
- `pdo_mysql`
- `tokenizer`
- `xml`

---

## 🚀 Step-by-Step Local Development Setup

### 1. Clone & Navigate
```bash
git clone <repository_url>
cd app
```

### 2. Install PHP Dependencies
```bash
composer install --no-interaction --prefer-dist --optimize-autoloader
```

### 3. Install Node Dependencies
```bash
npm install
```

### 4. Create Local Environment Configuration
Copy the template file to `.env`:

```bash
# On Windows PowerShell / Command Prompt:
copy .env.example .env

# On Linux / macOS:
cp .env.example .env
```

### 5. Generate Application Encryption Key
```bash
php artisan key:generate
```

### 6. Configure MySQL Database
1. Open MySQL and create an empty database:
   ```sql
   CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Open `.env` and set your credentials:
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ecommerce_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

### 7. Run Database Migrations & Seed Default Data
Execute migrations and seed default administrators, merchants, and customers:

```bash
php artisan migrate --seed
```

> [!TIP]
> **Default Test Credentials created by Seeder:**
> - **Admin**: `admin@gmail.com` / `password`
> - **Vendor**: `vendor@gmail.com` / `password`
> - **Customer**: `user@gmail.com` / `password`

### 8. Link Storage Symlink
Exposes uploaded media to the web root:
```bash
php artisan storage:link
```

### 9. Build or Run Frontend Asset Bundler
For live hot-module replacement during development:
```bash
npm run dev
```

For a compiled production build:
```bash
npm run build
```

### 10. Start Laravel Development Server
In a separate terminal window:
```bash
php artisan serve
```
Open your browser and visit: `http://127.0.0.1:8000`.

---

## ⚙️ Third-Party Service Configurations

### 1. Pusher WebSockets (Live Chat)
The live chat messenger requires valid Pusher credentials:
1. Register an account at [Pusher.com](https://pusher.com/).
2. Create a **Channels** app with cluster (e.g. `mt1`, `ap2`).
3. Set your `.env` keys:
   ```ini
   BROADCAST_DRIVER=pusher
   PUSHER_APP_ID=1234567
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1

   VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
   VITE_PUSHER_HOST="${PUSHER_HOST}"
   VITE_PUSHER_PORT="${PUSHER_PORT}"
   VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
   VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
   ```
4. Administrators can also update these keys live in **Admin Panel &rarr; Settings &rarr; Pusher Setting**.

---

### 2. Socialite OAuth Single Sign-On

#### Google OAuth:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Setup OAuth Consent Screen and create OAuth Client ID for Web Applications.
3. Authorized Redirect URI: `http://127.0.0.1:8000/google/callback` (or your production domain).
4. Update `.env`:
   ```ini
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CLIENT_REDIRECT="${APP_URL}/google/callback"
   ```

#### GitHub OAuth:
1. Register an OAuth App under GitHub **Developer Settings &rarr; OAuth Apps**.
2. Authorization callback URL: `http://127.0.0.1:8000/github/callback`.
3. Update `.env`:
   ```ini
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CLIENT_REDIRECT="${APP_URL}/github/callback"
   ```

---

### 3. Payment Gateway Sandbox Setup
Payment credentials are dynamically managed from **Admin Panel &rarr; Payment Settings**:
- **PayPal**:
  - Obtain Client ID & Secret Key from [PayPal Developer](https://developer.paypal.com/).
  - Set Mode to `Sandbox` for testing or `Live` for production.
  - Set conversion exchange rate (e.g. INR to USD: `0.012`).
- **Stripe**:
  - Obtain Publishable Key & Secret Key from [Stripe Dashboard](https://dashboard.stripe.com/).
  - Set Currency to `USD` and exchange rate.
- **Razorpay**:
  - Obtain Key ID & Key Secret from [Razorpay Dashboard](https://dashboard.razorpay.com/).
  - Set Currency to `INR` and exchange rate.

---

## 🚢 Production Deployment Runbook

### 1. Server Environment Preparation (Ubuntu/Nginx)
Install PHP 8.1, Nginx, MySQL, and required modules:
```bash
sudo apt update
sudo apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-mbstring \
    php8.1-xml php8.1-bcmath php8.1-curl php8.1-gd php8.1-zip unzip
```

### 2. Directory Permissions
Ensure the web server user (`www-data`) owns writable directories:
```bash
sudo chown -R www-data:www-data /var/www/ecommerce
sudo chmod -R 775 /var/www/ecommerce/storage
sudo chmod -R 775 /var/www/ecommerce/bootstrap/cache
sudo chmod -R 775 /var/www/ecommerce/public/uploads
```

### 3. Nginx Virtual Host Configuration
Create `/etc/nginx/sites-available/ecommerce.conf`:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/ecommerce/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 25M;
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Production Performance Optimization
Execute Laravel optimization commands:

```bash
# Cache configuration file
php artisan config:cache

# Cache route tree for rapid route dispatching
php artisan route:cache

# Compile blade templates
php artisan view:cache

# Cache event/listeners
php artisan event:cache

# Optimize composer autoloader
composer install --optimize-autoloader --no-dev
```

### 5. SSL / HTTPS Setup
Obtain a free SSL certificate via Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

---

## ❓ Troubleshooting & FAQs

### Q1: Images return 404 after uploading
**Solution**:
1. Check that `php artisan storage:link` has been executed.
2. Verify that `public/uploads` directory exists and has write permissions (`chmod 775 public/uploads`).
3. Ensure the web server document root points to `/public` and not the root repository directory.

### Q2: `419 Page Expired` on Form Submission
**Solution**:
1. Ensure the form contains `@csrf`.
2. Check that `SESSION_DOMAIN` in `.env` matches your production domain (or leave null).
3. If using HTTPS, ensure `APP_URL` begins with `https://`.

### Q3: Uploading large images fails with 413 or 500 error
**Solution**:
Update `php.ini` and Nginx settings:
- In `php.ini`:
  ```ini
  upload_max_filesize = 20M
  post_max_size = 25M
  memory_limit = 256M
  ```
- In Nginx configuration:
  ```nginx
  client_max_body_size 25M;
  ```
Restart PHP-FPM and Nginx.

### Q4: Real-time chat messages not received immediately
**Solution**:
1. Verify `BROADCAST_DRIVER=pusher` in `.env`.
2. Check that the Pusher App Key in `.env` matches `VITE_PUSHER_APP_KEY`.
3. Open browser Developer Tools &rarr; Console to check if WebSocket connections to Pusher are succeeding or failing authentication on `/broadcasting/auth`.
