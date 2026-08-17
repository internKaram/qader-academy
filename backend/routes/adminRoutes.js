
const express = require('express');
const router = express.Router();
 
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/rbacMiddleware');
 

router.get('/stats', protect, adminOnly, (req, res) => {
  res.status(200).json({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
  });
});
 
module.exports = router;
 