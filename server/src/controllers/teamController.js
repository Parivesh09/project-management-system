const { PrismaClient } = require('@prisma/client');
const { sendNotification } = require('../socket');
const { sendTeamInvitation } = require('../services/emailService');
const { createAuditLog } = require('../services/auditLog');

const prisma = new PrismaClient();

exports.getTeams = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const teams = await prisma.team.findMany({
      where: { members: { some: { userId: currentUserId } } },
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
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    // Transform the data to a more frontend-friendly format
    const formattedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: team.members.map(member => ({
        id: member.id,
        role: member.role,
        user: member.user,
        joinedAt: member.joinedAt
      })),
      projects: team.projects.map(pt => pt.project)
    }));

    res.json(formattedTeams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: `Error retrieving teams: ${error.message}` });
  }
};

exports.createTeam = async (req, res) => {
  const { name, description, memberIds = [], projectIds = [] } = req.body;
  const creatorId = req.user.userId;
  
  try {
    if (!creatorId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create team with creator as admin and other members as users
    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: [
            // Add creator as admin
            {
              userId: creatorId,
              role: 'ADMIN'
            },
            // Add other members as users
            ...memberIds.map(userId => ({
              userId,
              role: 'USER'
            }))
          ]
        },
        // Add project associations if provided
        ...(projectIds.length > 0 && {
          projects: {
            create: projectIds.map(projectId => ({
              project: {
                connect: {
                  id: projectId
                }
              }
            }))
          }
        })
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
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      creatorId,
      'TEAM_CREATED',
      {
        teamId: team.id,
        teamName: team.name,
        details: `Created team: ${team.name}`
      }
    );

    // Send notifications to team members
    for (const member of team.members) {
      if (member.userId !== creatorId) {
        await sendNotification(member.userId, {
          type: 'teamCreated',
          title: 'Added to Team',
          message: `You have been added to team: ${team.name}`,
          link: `/teams/${team.id}`
        });
      }
    }

    // Transform the response to maintain backward compatibility
    const formattedTeam = {
      ...team,
      projects: team.projects.map(pt => pt.project)
    };

    res.json(formattedTeam);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: `Error creating team: ${error.message}` });
  }
};

exports.updateTeam = async (req, res) => {
  const { id } = req.params;
  const { name, description, members, projectIds } = req.body;
  const currentUserId = req.user.userId;
  // Only team ADMIN or MANAGER can update team
  const membership = await prisma.teamMember.findFirst({
    where: { teamId: id, userId: currentUserId, role: { in: ['ADMIN', 'MANAGER'] } }
  });
  if (!membership) {
    return res.status(403).json({ message: 'Only team admins or managers can update this team' });
  }

  try {
    const updatedTeam = await prisma.$transaction(async (prisma) => {
      // First, verify that all projects exist and are valid
      if (projectIds && projectIds.length > 0) {
        const existingProjects = await prisma.project.findMany({
          where: {
            id: {
              in: projectIds
            }
          }
        });

        if (existingProjects.length !== projectIds.length) {
          throw new Error('One or more project IDs are invalid');
        }
      }

      // Update team details first
      const team = await prisma.team.update({
        where: { id },
        data: {
          name,
          description
        }
      });

      // Handle project assignments if provided
      if (projectIds !== undefined) {
        // Remove all existing project-team relationships
        await prisma.projectTeam.deleteMany({
          where: {
            teamId: id
          }
        });

        // Create new project-team relationships
        if (projectIds.length > 0) {
          await prisma.projectTeam.createMany({
            data: projectIds.map(projectId => ({
              teamId: id,
              projectId
            }))
          });
        }
      }

      // Update team members
      if (members) {
        await prisma.teamMember.deleteMany({
          where: { teamId: id }
        });

        if (members.length > 0) {
          await prisma.teamMember.createMany({
            data: members.map(member => ({
              teamId: id,
              userId: member.user.id,
              role: member.role
            }))
          });
        }
      }

      // Return updated team with all relationships
      return prisma.team.findUnique({
        where: { id },
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
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      });
    });

    // Transform the response to maintain backward compatibility
    const formattedTeam = {
      ...updatedTeam,
      projects: updatedTeam.projects.map(pt => pt.project)
    };

    res.json(formattedTeam);
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: `Error updating team: ${error.message}` });
  }
};

exports.deleteTeam = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check if user has permission to delete team
    const userTeamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
        role: 'ADMIN'
      }
    });

    if (!userTeamMember) {
      return res.status(403).json({ message: 'Only team admins can delete teams' });
    }

    // Delete team and all related data
    await prisma.$transaction([
      // Remove team members
      prisma.teamMember.deleteMany({
        where: { teamId: id }
      }),
      // Remove team-project associations
      prisma.team.update({
        where: { id },
        data: {
          projects: {
            set: []
          }
        }
      }),
      // Delete the team
      prisma.team.delete({
        where: { id }
      })
    ]);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: `Error deleting team: ${error.message}` });
  }
};

// Get team details
exports.getTeamDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const team = await prisma.team.findUnique({
      where: {
        id: id
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
          include: {
            project: {
              include: {
                owner: true,
                manager: true
              }
            }
          }
        },
        invites: {
          where: {
            status: "PENDING"
          },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            expiresAt: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Transform the response to maintain backward compatibility
    const formattedTeam = {
      ...team,
      projects: team.projects.map(pt => ({
        ...pt.project,
        teamId: pt.teamId
      }))
    };

    res.json(formattedTeam);
  } catch (error) {
    console.error('Error getting team details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Join team with invite code
exports.joinTeamWithCode = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.user.userId;

  try {
    // Find team by invite code
    const team = await prisma.team.findUnique({
      where: { inviteCode },
      include: {
        members: true
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: userId,
          teamId: team.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Find the invitation if it exists
    const invitation = await prisma.teamInvite.findFirst({
      where: {
        teamId: team.id,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // Create team member with appropriate role
    const teamMember = await prisma.teamMember.create({
      data: {
        userId,
        teamId: team.id,
        role: invitation?.role || 'USER'
      },
      include: {
        team: true,
        user: true
      }
    });

    // Update invitation status if it exists
    if (invitation) {
      await prisma.teamInvite.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });
    }

    // Notify team members about new join
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: team.id,
        NOT: {
          userId: userId
        }
      },
      include: {
        user: true
      }
    });

    for (const member of teamMembers) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          type: 'TEAM_MEMBER_JOINED',
          message: `A new member has joined the team ${team.name}`,
        }
      });
    }

    res.json(teamMember);
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: 'Failed to join team' });
  }
};

// Create team invite
exports.createTeamInvite = async (req, res) => {
  const { teamId } = req.params;  // Get teamId from URL params
  const { email, role } = req.body;
  const creatorId = req.user.userId;

  try {
    // Check if user has permission to invite
    const userTeamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: creatorId,
        role: {
          in: ['ADMIN', 'MANAGER']
        }
      },
      include: {
        team: true,
        user: true
      }
    });

    if (!userTeamMember) {
      return res.status(403).json({ error: 'No permission to invite members' });
    }

    // Check if invite already exists
    const existingInvite = await prisma.teamInvite.findUnique({
      where: {
        teamId_email: {
          teamId: teamId,
          email: email
        }
      }
    });

    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already sent to this email' });
    }

    // Create invite with a unique code
    const invite = await prisma.teamInvite.create({
      data: {
        teamId,
        email,
        role: role || 'USER',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        status: 'PENDING'
      },
      include: {
        team: true
      }
    });

    // Generate or update team's invite code if not exists
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        inviteCode: invite.id // Using the invite ID as the invite code
      }
    });

    // Send email invitation
    const emailSent = await sendTeamInvitation(
      email,
      userTeamMember.team.name,
      userTeamMember.user,
      team.inviteCode
    );

    // Create notification for the invited user if they already exist
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      await prisma.notification.create({
        data: {
          userId: existingUser.id,
          type: 'TEAM_INVITATION',
          message: `You've been invited to join the team "${userTeamMember.team.name}" by ${userTeamMember.user.name}`,
        }
      });
    }

    res.json({
      ...invite,
      emailSent,
      inviteCode: team.inviteCode
    });
  } catch (error) {
    console.error('Create team invite error:', error);
    res.status(500).json({ error: 'Failed to create team invite' });
  }
};

// Get team invite code
exports.getTeamInviteCode = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.userId;

  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
            role: {
              in: ['ADMIN', 'MANAGER']
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        inviteCode: true
      }
    });

    if (!team) {
      return res.status(403).json({ error: 'No permission to view invite code' });
    }

    if (!team.inviteCode) {
      // Generate a new invite code if one doesn't exist
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          inviteCode: `${teamId}-${Date.now()}`
        },
        select: {
          inviteCode: true
        }
      });
      return res.json({ inviteCode: updatedTeam.inviteCode });
    }

    res.json({ inviteCode: team.inviteCode });
  } catch (error) {
    console.error('Get team invite code error:', error);
    res.status(500).json({ error: 'Failed to get team invite code' });
  }
};

// Update team member role
exports.updateTeamMemberRole = async (req, res) => {
  const { teamId, userId } = req.params;
  const { role } = req.body;
  const requestingUserId = req.user.userId;

  try {
    // Check if requesting user is admin
    const userTeamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: requestingUserId,
        role: 'ADMIN'
      }
    });

    if (!userTeamMember) {
      return res.status(403).json({ message: 'Only team admins can update member roles' });
    }

    // Update member role
    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId
        }
      },
      data: { role },
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

    res.json(updatedMember);
  } catch (error) {
    console.error('Update team member role error:', error);
    res.status(500).json({ message: `Error updating team member role: ${error.message}` });
  }
};
