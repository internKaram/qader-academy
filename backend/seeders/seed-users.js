/**
 * @file seed-users.js
 * @description Seeds the database with test users using only the fields the
 *              frontend registration form sends: `name`, `email`, and `password`.
 *              Passwords are hashed with bcrypt (cost factor 10) before insertion,
 *              mirroring the behaviour of the register controller.
 *
 *              Seed composition:
 *              - 7 Students
 *              - 3 Instructors
 *              - 1 Admin
 *
 * @usage
 *   node seeders/seed-users.js
 */

'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connectDB = require('../config/connectDatabase');
const User = require('../models/user');

/** @constant {number} SALT_ROUNDS - bcrypt cost factor, same as the auth controller. */
const SALT_ROUNDS = 10;

/**
 * Raw user data in the shape the frontend registration form submits.
 * Fields: name, email, password, role (role is not sent by the form but is
 * required here to assign the correct permissions during seeding).
 *
 * @type {Array<{name: string, email: string, password: string, role: string}>}
 */
const rawUsers = [
  // ── Students (7) ──────────────────────────────────────────────────────────
  {
    name: 'Abdulwahab Najib',
    email: 'abdulwahab@qader.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Basma Mokhles',
    email: 'basma@qader.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Fisal Eljaroshah',
    email: 'fisal@qader.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Sabrin Alqarni',
    email: 'sabrin@qader.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Karam Khirallah',
    email: 'karam@qader.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'm01yyad',
    email: 'm01yyad@qader.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Raghad',
    email: 'raghad@qader.com',
    password: 'Student@123',
    role: 'student',
  },


  // ── Instructors (3) ────────────────────────────────────────────────────────
  {
    name: 'Abdulaziz Nasser',
    email: 'aziz@qader.com',
    password: 'Instructor@123',
    role: 'instructor',
  },
  {
    name: 'Mona Hussein',
    email: 'mona@qader.com',
    password: 'Instructor@123',
    role: 'instructor',
  },
  {
    name: 'Salman Faris',
    email: 'salman@qader.com',
    password: 'Instructor@123',
    role: 'instructor',
  },

  // ── Admin (1) ──────────────────────────────────────────────────────────────
  {
    name: 'Salem Shurrab',
    email: 'salem@qader.com',
    password: 'Admin@123',
    role: 'admin',
  },
];

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @async
 * @param {string} password - The plain-text password to hash.
 * @returns {Promise<string>} The resulting bcrypt hash string.
 */
const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

/**
 * Main seeder entry point.
 * Connects to MongoDB, wipes existing users, inserts the seed data, then disconnects.
 *
 * @async
 * @returns {Promise<void>}
 */
const seed = async () => {
  await connectDB();

  console.log('\n🌱  Starting user seeder…\n');

  // Wipe existing users so the seeder is idempotent
  await User.deleteMany({});
  console.log('🗑️   Cleared existing users.\n');

  // Build documents – hash passwords in parallel for speed
  const userDocs = await Promise.all(
    rawUsers.map(async ({ name, email, password, role }) => ({
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
    }))
  );

  const inserted = await User.insertMany(userDocs);

  // Pretty-print a summary table
  console.log('✅  Seeded users:\n');
  console.log(
    `${'Name'.padEnd(30)} ${'Email'.padEnd(35)} ${'Password'.padEnd(20)} Role`
  );
  console.log('─'.repeat(100));
  rawUsers.forEach(({ name, email, password, role }) => {
    console.log(`${name.padEnd(30)} ${email.padEnd(35)} ${password.padEnd(20)} ${role}`);
  });

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB. Done!\n');
};

seed().catch((err) => {
  console.error('❌  Seeder failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
