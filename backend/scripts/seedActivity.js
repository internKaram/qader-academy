
require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
 
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
 
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to', mongoose.connection.name);
 
  const sabrin = await User.findOne({ email: 'sabrin@qader.com' });
  const basma = await User.findOne({ email: 'basma@qader.com' });
  const abdulwahab = await User.findOne({ email: 'abdulwahab@qader.com' });
 
  if (!sabrin || !basma || !abdulwahab) {
    console.error(
      'One or more seed users not found. Run the main user-seed script first (seed-users.md accounts must already exist).'
    );
    process.exit(1);
  }
 
  
  let course = await Course.findOne();
  if (!course) {
    course = await Course.create({ title: 'JavaScript Basics', category: 'Web Development' });
  }
  let lesson = await Lesson.findOne({ course: course._id });
  if (!lesson) {
    lesson = await Lesson.create({ course: course._id, title: 'Intro to Variables', order: 1 });
  }
 
  // Clear any previous seed run for these three students, so this script
  // is safely re-runnable without accumulating duplicate rows each time.
  await Activity.deleteMany({ student: { $in: [sabrin._id, basma._id, abdulwahab._id] } });
 
  // --- sabrin@qader.com: POPULATED — one of every event type ---------
  await Activity.insertMany([
    {
      student: sabrin._id,
      type: 'course_started',
      course: course._id,
      courseTitle: course.title,
      createdAt: daysAgo(6),
    },
    {
      student: sabrin._id,
      type: 'lesson_completed',
      course: course._id,
      courseTitle: course.title,
      lessonTitle: lesson.title,
      createdAt: daysAgo(5),
    },
    {
      student: sabrin._id,
      type: 'quiz_failed',
      course: course._id,
      courseTitle: course.title,
      meta: { score: 40 },
      createdAt: daysAgo(3),
    },
    {
      student: sabrin._id,
      type: 'quiz_passed',
      course: course._id,
      courseTitle: course.title,
      meta: { score: 85 },
      createdAt: daysAgo(2),
    },
    {
      student: sabrin._id,
      type: 'certificate_issued',
      course: course._id,
      courseTitle: course.title,
      meta: { certificateNumber: 'QA-2026-0001' },
      createdAt: daysAgo(1),
    },
  ]);
  console.log('Seeded 5 activities for sabrin@qader.com (populated state)');
 
  // --- basma@qader.com: NEAR-EMPTY — exactly one event -----------------
  await Activity.create({
    student: basma._id,
    type: 'course_started',
    course: course._id,
    courseTitle: course.title,
    createdAt: daysAgo(1),
  });
  console.log('Seeded 1 activity for basma@qader.com (near-empty state)');
 
  // --- abdulwahab@qader.com: EMPTY — deliberately no insert -------------
  console.log('Seeded 0 activities for abdulwahab@qader.com (empty state, by design)');
 
  await mongoose.disconnect();
  console.log('Done.');
};
 
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
 