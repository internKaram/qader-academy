const express = require('express');
const router = express.Router();

const { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  suspendUser 
} = require('../controllers/admin-controller');

const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');

// Protect all admin routes with authentication and RBAC
router.use(authMiddleware);
router.use(rbacMiddleware('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', suspendUser);

module.exports = router;