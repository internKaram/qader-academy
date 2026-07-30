const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  suspendUser 
} = require('../controllers/admin-controller');

const { protect } = require('../middlewares/auth-middleware');
const { authorizeAdmin } = require('../middlewares/rbac-middleware'); // أو دالة التحقق من الأدمن المتاحة بمشروعك

// تطبيق الحماية على جميع مسارات الأدمن
router.use(protect);
router.use(authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', suspendUser);

module.exports = router;