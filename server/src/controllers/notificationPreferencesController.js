const { getPreferences, updatePreferences } = require('../models/notificationPreferences');

const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = await getPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
};

const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from authenticated request
    if (!userId) {
      console.error('User not authenticated', req.user);
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updatedPreferences = await updatePreferences(userId, req.body);
    res.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
}; 