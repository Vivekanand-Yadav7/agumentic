require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding Real Estate Management Portal database...');

  // Passwords
  const adminPass = await bcrypt.hash('admin123', 10);
  const empPass = await bcrypt.hash('123', 10);
  const employerPass = await bcrypt.hash('123', 10);

  // 1. Users
  const employer = await prisma.user.upsert({
    where: { email: 'abhi@gmail.com' },
    update: { password: employerPass, role: 'employer' },
    create: {
      name: 'Abhishek Sharma (Employer)',
      email: 'abhi@gmail.com',
      password: employerPass,
      phone: '9876543210',
      role: 'employer',
      department: 'Executive Management',
      designation: 'Managing Director',
      salary: 150000,
      status: 'active'
    }
  });

  const emp1 = await prisma.user.upsert({
    where: { email: 'employee@gmail.com' },
    update: { password: empPass },
    create: {
      name: 'Rajesh Verma',
      email: 'employee@gmail.com',
      password: empPass,
      phone: '9876543211',
      role: 'employee',
      department: 'Site Management',
      designation: 'Senior Project Engineer',
      salary: 65000,
      status: 'active'
    }
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'sarah@gmail.com' },
    update: { password: empPass },
    create: {
      name: 'Sarah Jenkins',
      email: 'sarah@gmail.com',
      password: empPass,
      phone: '9876543212',
      role: 'employee',
      department: 'Architecture & Design',
      designation: 'Lead Architect',
      salary: 80000,
      status: 'active'
    }
  });

  const emp3 = await prisma.user.upsert({
    where: { email: 'vikram@gmail.com' },
    update: { password: empPass },
    create: {
      name: 'Vikram Singh',
      email: 'vikram@gmail.com',
      password: empPass,
      phone: '9876543213',
      role: 'employee',
      department: 'Sales & Marketing',
      designation: 'Property Consultant',
      salary: 50000,
      status: 'active'
    }
  });

  // 2. Real Estate Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Green Valley Luxury Heights',
      description: 'Ultra-luxurious 3 & 4 BHK apartments with modern amenities, clubhouse and solar power.',
      location: 'Sector 62, Gurgaon',
      type: 'residential',
      status: 'ongoing',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-12-30'),
      budget: 45000000,
      clientName: 'DLF Builders & Developers',
      clientPhone: '9988776655',
      priority: 'high',
      progress: 65
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'CyberTech Commercial Hub',
      description: 'State-of-the-art office spaces and retail shops with smart parking and glass facade.',
      location: 'Whitefield, Bangalore',
      type: 'commercial',
      status: 'ongoing',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-06-30'),
      budget: 82000000,
      clientName: 'Prestige Group Holdings',
      clientPhone: '9876123456',
      priority: 'high',
      progress: 40
    }
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'Sunrise Eco Villas',
      description: 'Gated community of 25 eco-friendly independent villas near the lake.',
      location: 'ECR, Chennai',
      type: 'residential',
      status: 'planning',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-09-30'),
      budget: 28000000,
      clientName: 'Casagrand Constructions',
      clientPhone: '9123456789',
      priority: 'medium',
      progress: 15
    }
  });

  // 3. Project Assignments
  await prisma.projectAssignment.createMany({
    data: [
      { projectId: project1.id, employeeId: emp1.id, role: 'lead' },
      { projectId: project1.id, employeeId: emp2.id, role: 'member' },
      { projectId: project2.id, employeeId: emp2.id, role: 'lead' },
      { projectId: project2.id, employeeId: emp3.id, role: 'member' },
      { projectId: project3.id, employeeId: emp1.id, role: 'member' }
    ],
    skipDuplicates: true
  });

  // 4. Leave Requests
  await prisma.leave.createMany({
    data: [
      {
        employeeId: emp1.id,
        type: 'casual',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-12'),
        days: 3,
        reason: 'Family function in hometown',
        status: 'approved',
        approverId: employer.id,
        reviewedAt: new Date('2024-08-05')
      },
      {
        employeeId: emp2.id,
        type: 'sick',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-08-16'),
        days: 2,
        reason: 'Fever and doctor appointment',
        status: 'pending'
      },
      {
        employeeId: emp3.id,
        type: 'annual',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-05'),
        days: 5,
        reason: 'Personal vacation',
        status: 'pending'
      }
    ],
    skipDuplicates: true
  });

  // 5. Payroll Records
  await prisma.payroll.createMany({
    data: [
      {
        employeeId: emp1.id,
        month: 7,
        year: 2024,
        basicSalary: 45000,
        hra: 15000,
        allowances: 8000,
        deductions: 3000,
        tax: 2000,
        netSalary: 63000,
        status: 'paid',
        paidAt: new Date('2024-07-31'),
        remarks: 'Salary credited to HDFC bank account'
      },
      {
        employeeId: emp2.id,
        month: 7,
        year: 2024,
        basicSalary: 55000,
        hra: 18000,
        allowances: 10000,
        deductions: 5000,
        tax: 3000,
        netSalary: 75000,
        status: 'paid',
        paidAt: new Date('2024-07-31'),
        remarks: 'Salary credited to ICICI bank account'
      },
      {
        employeeId: emp3.id,
        month: 7,
        year: 2024,
        basicSalary: 35000,
        hra: 12000,
        allowances: 5000,
        deductions: 2000,
        tax: 1000,
        netSalary: 49000,
        status: 'pending',
        remarks: 'Pending employer approval'
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Real Estate Management Portal Seeded Successfully!');
  console.log('\n🔑 Test Accounts:');
  console.log('  Employer: abhi@gmail.com / 123');
  console.log('  Employee: employee@gmail.com / 123');
  console.log('  Employee 2: sarah@gmail.com / 123');

  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
