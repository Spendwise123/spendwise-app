# SpendWise Security Demonstration Guide

This guide provides step-by-step instructions for demonstrating the security features of the SpendWise application.

---

## 🔐 1. Authentication (JWT Testing)
**Goal:** Prove that sensitive data is "locked" and requires a valid key (token).

1.  **Open Postman** and create a **GET** request to: `http://127.0.0.1:5000/api/expenses/`
2.  Go to the **Authorization** tab and select **No Auth**.
3.  Click **Send**.
    *   **Result:** You should see `401 Unauthorized`.
4.  Now, **Login** via the app or Postman (`POST api/auth/login/`) to get a token.
5.  Change **Authorization** to **Bearer Token** and paste your token.
6.  Click **Send**.
    *   **Result:** You should see a `200 OK` and a list of transactions (or `[]`).

---

## 👥 2. Authorization & Data Isolation (RBAC)
**Goal:** Prove that users cannot see each other's private financial data.

1.  **Login as User A** and create a transaction (e.g., "Lunch - $500").
2.  **Login as User B** (a different email address).
3.  **Perform a GET request** to `http://127.0.0.1:5000/api/expenses/` using **User B's token**.
    *   **Result:** User B will see `[]` (empty list). This proves User B cannot see User A's data even though they are both logged in.

---

## 💾 3. Encryption at Rest (Database Hashing)
**Goal:** Prove that passwords are not stored as plain text in the database.

1.  Open your **VS Code Terminal**.
2.  Paste and run this command:
    ```powershell
    python -c "import sqlite3; conn = sqlite3.connect('backend/db.sqlite3'); cursor = conn.cursor(); cursor.execute('SELECT email, password FROM users_user LIMIT 1'); print(cursor.fetchone()); conn.close()"
    ```
    *   **Result:** You will see a string like `pbkdf2_sha256$1000000$...`. This is the encrypted "hash," proving that Sarah's real password is never stored directly.

---

## 🛡️ 4. Security Headers (Best Practices)
**Goal:** Prove the system protects against browser-based attacks (Clickjacking).

1.  In **Postman**, send any successful `GET` request.
2.  Click the **Headers** tab in the **Response** area (bottom half of the screen).
3.  Locate these rows:
    *   `X-Frame-Options`: Should be **`DENY`**.
    *   `X-Content-Type-Options`: Should be **`nosniff`**.
    *   `Referrer-Policy`: Should be **`same-origin`**.

---

## 🚩 5. Vulnerability Demonstration
**Goal:** Show how an unprotected endpoint behaves for a security audit.

1.  In **Postman**, perform a **GET** request to: `http://127.0.0.1:5000/api/expenses/testv/`
2.  Set **Authorization** to **No Auth**.
3.  Click **Send**.
    *   **Result:** You will see the **Financial Services** list (Investment Advisory, etc.) even without logging in. This demonstrates the "discovered" vulnerability from Criterion 6.

---

**Note:** Always ensure your server is running (`python manage.py runserver 5000`) before starting these tests!
