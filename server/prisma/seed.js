const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Delete existing data in the correct order to respect foreign key constraints
  console.log('Cleaning up existing data...');
  
  // First, delete tables that reference other tables
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.teamInvite.deleteMany({});
  await prisma.projectTeam.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating new users...');
  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: managerPassword,
      name: 'Manager User',
      role: 'MANAGER'
    }
  });

  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: 'USER'
    }
  });

  console.log('Creating team...');
  // Create a team
  const team = await prisma.team.create({
    data: {
      name: 'Development Team',
      description: 'Main development team',
      members: {
        create: [
          {
            userId: admin.id,
            role: 'ADMIN'
          },
          {
            userId: manager.id,
            role: 'MANAGER'
          },
          {
            userId: user.id,
            role: 'USER'
          }
        ]
      }
    }
  });

  console.log('Creating project...');
  // Create a project
  const project = await prisma.project.create({
    data: {
      name: 'Project Management System',
      description: 'Building a project management system',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      ownerId: admin.id,
      managerId: manager.id,
      teams: {
        create: [
          {
            teamId: team.id
          }
        ]
      },
      tasks: {
        create: [
          {
            title: 'Setup Project Structure',
            description: 'Initial project setup and configuration',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            assigneeId: user.id,
            creatorId: manager.id,
            isRecurring: false
          },
          {
            title: 'Weekly Team Meeting',
            description: 'Regular team sync-up',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            assigneeId: manager.id,
            creatorId: admin.id,
            isRecurring: true,
            frequency: 'WEEKLY'
          }
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
  console.log({
    users: { admin, manager, user },
    team,
    project
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 