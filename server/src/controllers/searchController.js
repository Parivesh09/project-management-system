const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.search = async (req, res) => {
  const { query } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    });

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        owner: true,
        manager: true,
        teams: {
          include: {
            team: true,
          }
        }
      },
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({ tasks, projects, users });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error performing search: ${error.message}` });
  }
};
