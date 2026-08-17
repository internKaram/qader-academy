const User = require('../models/user');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AuditLog = require('../models/AuditLog');

// 1. جلب الإحصائيات (Metrics & 30-day enrollments)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    
    // حساب معدل الإكمال (Completion Rate) كمثال
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const completionRate = totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1) : 0;

    // جلب تسجيلات آخر 30 يوم للمخطط البياني (Line Chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollmentsLast30Days = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completionRate: `${completionRate}%`
      },
      chartData: enrollmentsLast30Days
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. جلب قائمة المستخدمين مع البحث والفلترة
exports.getAdminUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-passwordHash');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. تعديل دور المستخدم (PUT role) مع تسجيل الـ Audit Log
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // تسجيل الحدث في الـ Audit Log
    const adminId = req.user.userId || req.user._id;
    if (adminId) {
      await AuditLog.create({
        admin: adminId,
        action: 'UPDATE_USER_ROLE',
        targetUser: user._id,
        details: `Changed role from ${oldRole} to ${role}`
      });
    }

    res.status(200).json({ success: true, message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. تعليق / حذف المستخدم (DELETE / Suspend)
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const adminId = req.user.userId || req.user._id;
    if (adminId) {
      await AuditLog.create({
        admin: adminId,
        action: 'SUSPEND_USER',
        targetUser: id,
        details: `Deleted/Suspended user ${user.email}`
      });
    }

    res.status(200).json({ success: true, message: 'User suspended/deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};