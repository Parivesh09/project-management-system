const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_PREFERENCES = {
  email: true,
  inApp: true,
  taskAssigned: true,
  taskUpdated: true,
  taskCompleted: true,
  taskCommented: true,
};

const transformPreferences = (preferences) => {
  // If preferences is already in the correct format, return it
  if (typeof preferences.email === 'boolean') {
    return preferences;
  }

  // Transform nested structure to flat structure
  return {
    email: preferences.email?.enabled ?? true,
    inApp: preferences.inApp?.enabled ?? true,
    taskAssigned: (preferences.email?.taskAssigned ?? true) && (preferences.inApp?.taskAssigned ?? true),
    taskUpdated: (preferences.email?.taskUpdated ?? true) && (preferences.inApp?.taskUpdated ?? true),
    taskCompleted: (preferences.email?.taskCompleted ?? true) && (preferences.inApp?.taskCompleted ?? true),
    taskCommented: (preferences.email?.taskCommented ?? true) && (preferences.inApp?.taskCommented ?? true),
  };
};

const getPreferences = async (userId) => {
  try {
    let preferences = await prisma.notificationPreferences.findUnique({
      where: {
        userId: userId,
      },
    });

    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: userId,
          ...DEFAULT_PREFERENCES,
        },
      });
    }

    // Transform to nested structure for frontend
    return {
      email: {
        enabled: preferences.email,
        taskAssigned: preferences.taskAssigned,
        taskUpdated: preferences.taskUpdated,
        taskCompleted: preferences.taskCompleted,
        taskCommented: preferences.taskCommented,
      },
      inApp: {
        enabled: preferences.inApp,
        taskAssigned: preferences.taskAssigned,
        taskUpdated: preferences.taskUpdated,
        taskCompleted: preferences.taskCompleted,
        taskCommented: preferences.taskCommented,
      },
    };
  } catch (error) {
    console.error('Error in getPreferences:', error);
    throw error;
  }
};

const updatePreferences = async (userId, preferences) => {
  try {
    // Transform nested preferences to flat structure
    const transformedPreferences = transformPreferences(preferences);

    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: {
        userId: userId,
      },
      update: transformedPreferences,
      create: {
        userId: userId,
        ...DEFAULT_PREFERENCES,
        ...transformedPreferences,
      },
    });

    // Transform back to nested structure for frontend
    return {
      email: {
        enabled: updatedPreferences.email,
        taskAssigned: updatedPreferences.taskAssigned,
        taskUpdated: updatedPreferences.taskUpdated,
        taskCompleted: updatedPreferences.taskCompleted,
        taskCommented: updatedPreferences.taskCommented,
      },
      inApp: {
        enabled: updatedPreferences.inApp,
        taskAssigned: updatedPreferences.taskAssigned,
        taskUpdated: updatedPreferences.taskUpdated,
        taskCompleted: updatedPreferences.taskCompleted,
        taskCommented: updatedPreferences.taskCommented,
      },
    };
  } catch (error) {
    console.error('Error in updatePreferences:', error);
    throw error;
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
}; 