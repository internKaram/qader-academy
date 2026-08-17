# 🌱 User Seeder — `seed-users.js`

**Owner:** Faisal
**Date:** 2026-08-03  
**Location:** `backend/seeders/seed-users.js`

---

## Overview

Seeds the `users` collection with **11 pre-defined test accounts** covering all three roles in the system. Passwords are hashed with **bcrypt** (cost factor 10) — identical to the production auth controller behaviour.

> ⚠️ **This wipes ALL existing users before inserting.** Only run against your dev database — never staging or production.

---

## Seed Composition

| Role       | Count | Password         |
|------------|-------|------------------|
| Student    | 7     | `Student@123`    |
| Instructor | 3     | `Instructor@123` |
| Admin      | 1     | `Admin@123`      |

---

## Test Accounts

| Name              | Email                | Role       |
|-------------------|----------------------|------------|
| Abdulwahab Najib  | abdulwahab@qader.com | student    |
| Basma Mokhles     | basma@qader.com      | student    |
| Fisal Eljaroshah  | fisal@qader.com      | student    |
| Sabrin Alqarni    | sabrin@qader.com     | student    |
| Karam Khirallah   | karam@qader.com      | student    |
| m01yyad           | m01yyad@qader.com    | student    |
| Raghad            | raghad@qader.com     | student    |
| Abdulaziz Nasser  | aziz@qader.com       | instructor |
| Mona Hussein      | mona@qader.com       | instructor |
| Salman Faris      | salman@qader.com     | instructor |
| Salem Shurrab     | salem@qader.com      | admin      |

---

## How to Run

1. Ensure your `.env` has a valid `MONGO_URI` pointing to your **local** database.
2. From the `backend/` directory, run:

```bash
node seeders/seed-users.js
```

---

## What It Does (Step by Step)

1. Connects to MongoDB via `config/connectDatabase.js`
2. **Deletes** all existing documents in the `users` collection
3. Hashes all passwords in parallel using **`bcrypt@5.1`** (cost factor 10)
4. Inserts all 11 users via `User.insertMany()`
5. Prints a formatted summary table to the console
6. Disconnects from MongoDB

---

## Important Notes

- Uses **`bcrypt@5.1`** as mandated by the SRS — do **not** replace with `bcryptjs`
- The seeder is **idempotent** — safe to run multiple times, always starts fresh
- Salt rounds = `10`, matching the production `auth-controller.js`