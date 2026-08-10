const Activity = require('../models/Activity');

const logActivity = async ({ student, type, course, courseTitle, lessonTitle, meta = {} }) => {
  try {
    await Activity.create({ student, type, course, courseTitle, lessonTitle, meta });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};
 

const getActivityFeed = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;
 
    const [activities, total] = await Promise.all([
      Activity.find({ student: req.user._id })
        .sort({ createdAt: -1 }) // matches the index direction exactly
        .skip(skip)
        .limit(limit),
      Activity.countDocuments({ student: req.user._id }),
    ]);
 
    return res.status(200).json({
      activities,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + activities.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching activity feed', error: error.message });
  }
};
 
module.exports = { logActivity, getActivityFeed };