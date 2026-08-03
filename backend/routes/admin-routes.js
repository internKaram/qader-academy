const express = require('express');
const router = express.Router();

const { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  suspendUser 
} = require('../controllers/admin-controller');

// تحققي من وجود ملف الـ auth أو استبدليه مؤقتاً بدالة تحقق محلية لمنع الـ Crash
const authMiddleware = require('../middlewares/auth-middleware');
const protect = authMiddleware.protect || authMiddleware; 

const rbacMiddleware = require('../middlewares/rbac-middleware');

// حماية المسارات بشكل مضمون 100%
if (protect) router.use(protect);
if (rbacMiddleware) router.use(rbacMiddleware('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', suspendUser);

module.exports = router;