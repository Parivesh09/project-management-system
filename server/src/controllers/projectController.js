const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('../services/auditLog');

const prisma = new PrismaClient();

exports.getProjects = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: currentUserId },
          { managerId: currentUserId },
          {
            teams: {
              some: {
                team: {
                  members: {
                    some: { userId: currentUserId }
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        teams: {
          include: {
            team: {
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
                }
              }
            }
          }
        },
        tasks: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      owner: project.owner,
      manager: project.manager,
      teams: project.teams.map(pt => ({
        ...pt.team,
        members: pt.team.members.map(member => ({
          id: member.id,
          role: member.role,
          user: member.user
        }))
      })),
      tasks: project.tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        assignee: task.assignee,
        creator: task.creator
      }))
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        teams: {
          include: {
            team: {
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
                }
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: true,
            creator: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Transform the response to maintain backward compatibility
    const formattedProject = {
      ...project,
      teams: project.teams.map(pt => ({
        ...pt.team,
        members: pt.team.members.map(member => ({
          id: member.id,
          role: member.role,
          user: member.user
        }))
      }))
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Get project by id error:', error);
    res.status(500).json({ message: `Error retrieving project: ${error.message}` });
  }
};

exports.createProject = async (req, res) => {
  const { name, description, startDate, endDate, teamIds, ownerId, managerId } = req.body;
  const currentUserId = req.user.userId;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (isNaN(startDateObj) || isNaN(endDateObj)) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDateObj,
        endDate: endDateObj,
        owner: {
          connect: { id: ownerId }
        },
        manager: managerId ? {
          connect: { id: managerId }
        } : undefined,
        teams: {
          create: teamIds?.map(teamId => ({
            team: {
              connect: { id: teamId }
            }
          })) || []
        }
      },
      include: {
        owner: true,
        manager: true,
        teams: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      currentUserId,
      'PROJECT_CREATED',
      {
        projectId: newProject.id,
        projectName: newProject.name,
        details: `Created project: ${newProject.name}`
      }
    );

    // Transform the response to maintain backward compatibility
    const formattedProject = {
      ...newProject,
      teams: newProject.teams.map(pt => ({
        ...pt.team,
        members: pt.team.members.map(member => ({
          id: member.id,
          role: member.role,
          user: member.user
        }))
      }))
    };

    res.status(201).json(formattedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: `Error creating project: ${error.message}` });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId;
  const projectToCheck = await prisma.project.findUnique({ where: { id }, select: { ownerId: true, managerId: true } });
  if (!projectToCheck || (projectToCheck.ownerId !== currentUserId && projectToCheck.managerId !== currentUserId)) {
    return res.status(403).json({ message: 'Only project owner or manager can update this project' });
  }
  const { name, description, startDate, endDate, teamIds, ownerId, managerId } = req.body;

  try {
    const updatedProject = await prisma.$transaction(async (prisma) => {
      // First update the project details
      const project = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          startDate,
          endDate,
          ownerId,
          managerId
        }
      });

      // Then handle team assignments if provided
      if (teamIds !== undefined) {
        // Remove all existing project-team relationships
        await prisma.projectTeam.deleteMany({
          where: {
            projectId: id
          }
        });

        // Create new project-team relationships
        if (teamIds.length > 0) {
          await prisma.projectTeam.createMany({
            data: teamIds.map(teamId => ({
              projectId: id,
              teamId
            }))
          });
        }
      }

      // Return updated project with all relationships
      return prisma.project.findUnique({
        where: { id },
        include: {
          owner: true,
          manager: true,
          teams: {
            include: {
              team: {
                include: {
                  members: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    });

    // Create audit log
    await createAuditLog(
      currentUserId,
      'PROJECT_UPDATED',
      {
        projectId: updatedProject.id,
        projectName: updatedProject.name,
        details: `Updated project: ${updatedProject.name}`
      }
    );

    // Transform the response to maintain backward compatibility
    const formattedProject = {
      ...updatedProject,
      teams: updatedProject.teams.map(pt => ({
        ...pt.team,
        members: pt.team.members.map(member => ({
          id: member.id,
          role: member.role,
          user: member.user
        }))
      }))
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: `Error updating project: ${error.message}` });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId;
  
  try {
    // Get project details before deletion for audit log
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true, ownerId: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to delete
    if (project.ownerId !== currentUserId) {
      return res.status(403).json({ message: 'Only project owner can delete the project' });
    }

    await prisma.project.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      currentUserId,
      'PROJECT_DELETED',
      {
        projectId: id,
        projectName: project.name,
        details: `Deleted project: ${project.name}`
      }
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: `Error deleting project: ${error.message}` });
  }
};
