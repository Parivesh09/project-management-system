const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('./auditLog');

const prisma = new PrismaClient();

const createTeam = async (data, creatorId) => {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      members: {
        create: [
          {
            userId: creatorId,
            role: 'ADMIN'
          },
          ...data.members.map(member => ({
            userId: member.userId,
            role: member.role || 'USER'
          }))
        ]
      }
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  await createAuditLog(
    creatorId,
    'TEAM_CREATED',
    `Created team: ${team.name}`
  );

  return team;
};

const updateTeam = async (teamId, data, userId) => {
  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name,
      description: data.description
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  await createAuditLog(
    userId,
    'TEAM_UPDATED',
    `Updated team: ${team.name}`
  );

  return team;
};

const addTeamMember = async (teamId, memberData, addedBy) => {
  const member = await prisma.teamMember.create({
    data: {
      teamId,
      userId: memberData.userId,
      role: memberData.role || 'USER'
    },
    include: {
      user: true,
      team: true
    }
  });

  await createAuditLog(
    addedBy,
    'TEAM_MEMBER_ADDED',
    `Added ${member.user.name} to team ${member.team.name}`
  );

  return member;
};

const removeTeamMember = async (teamId, userId, removedBy) => {
  const member = await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId,
        teamId
      }
    },
    include: {
      user: true,
      team: true
    }
  });

  await createAuditLog(
    removedBy,
    'TEAM_MEMBER_REMOVED',
    `Removed ${member.user.name} from team ${member.team.name}`
  );

  return member;
};

const getTeamMembers = async (teamId) => {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });
};

const getUserTeams = async (userId) => {
  return prisma.team.findMany({
    where: {
      members: {
        some: {
          userId
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      },
      projects: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });
};

module.exports = {
  createTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  getUserTeams
}; 