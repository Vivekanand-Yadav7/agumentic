const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Enquiry = require('../models/Enquiry');
const Fee = require('../models/Fee');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/shilabs?authSource=admin');
  console.log('Connected to MongoDB');
};

const seedData = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany({});
  await Course.deleteMany({});
  await Batch.deleteMany({});
  await Student.deleteMany({});
  await Enquiry.deleteMany({});
  await Fee.deleteMany({});

  console.log('Cleared existing data...');

  // Create users
  const users = await User.create([
    {
      name: 'Abhi Admin',
      email: 'abhi@gmail.com',
      password: '123',
      role: 'admin',
      phone: '9876543210',
      status: 'active'
    },
    {
      name: 'Rahul Trainer',
      email: 'rahul@shilabs.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '9876543211',
      expertise: ['React', 'Node.js', 'MongoDB'],
      status: 'active'
    },
    {
      name: 'Priya Trainer',
      email: 'priya@shilabs.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '9876543212',
      expertise: ['Python', 'Data Science', 'ML'],
      status: 'active'
    }
  ]);

  console.log('Users seeded...');

  // Create courses
  const courses = await Course.create([
    {
      title: 'Full Stack Web Development',
      slug: 'full-stack-web-development',
      description: 'Complete MERN Stack development course covering HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB.',
      duration: '6 months',
      fees: 25000,
      category: 'Web Development',
      status: 'active',
      createdBy: users[0]._id
    },
    {
      title: 'Python & Data Science',
      slug: 'python-data-science',
      description: 'Learn Python programming and Data Science including NumPy, Pandas, Matplotlib and Machine Learning basics.',
      duration: '4 months',
      fees: 20000,
      category: 'Data Science',
      status: 'active',
      createdBy: users[0]._id
    },
    {
      title: 'Digital Marketing',
      slug: 'digital-marketing',
      description: 'Complete digital marketing course covering SEO, SEM, Social Media Marketing, Email Marketing and Analytics.',
      duration: '3 months',
      fees: 15000,
      category: 'Marketing',
      status: 'active',
      createdBy: users[0]._id
    },
    {
      title: 'UI/UX Design',
      slug: 'ui-ux-design',
      description: 'Learn UI/UX design using Figma, Adobe XD. User research, wireframing, prototyping and design systems.',
      duration: '3 months',
      fees: 18000,
      category: 'Design',
      status: 'active',
      createdBy: users[0]._id
    }
  ]);

  console.log('Courses seeded...');

  // Create batches
  const batches = await Batch.create([
    {
      name: 'MERN Batch July 2024',
      batchCode: 'BATCH001',
      course: courses[0]._id,
      trainer: users[1]._id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      timing: '9:00 AM - 12:00 PM',
      days: ['Mon', 'Wed', 'Fri'],
      maxStudents: 20,
      status: 'ongoing'
    },
    {
      name: 'Python Batch Aug 2024',
      batchCode: 'BATCH002',
      course: courses[1]._id,
      trainer: users[2]._id,
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-11-30'),
      timing: '2:00 PM - 5:00 PM',
      days: ['Tue', 'Thu', 'Sat'],
      maxStudents: 15,
      status: 'ongoing'
    },
    {
      name: 'Digital Marketing Sep 2024',
      batchCode: 'BATCH003',
      course: courses[2]._id,
      trainer: users[1]._id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-11-30'),
      timing: '10:00 AM - 1:00 PM',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      maxStudents: 25,
      status: 'upcoming'
    }
  ]);

  console.log('Batches seeded...');

  // Create students sequentially so pre-save hook assigns unique IDs
  const studentData = [
    {
      name: 'Amit Sharma',
      email: 'amit@example.com',
      phone: '9800000001',
      gender: 'male',
      course: courses[0]._id,
      batch: batches[0]._id,
      totalFees: 25000,
      paidFees: 25000,
      feeStatus: 'paid',
      status: 'active',
      city: 'Mumbai',
      qualification: 'B.Tech'
    },
    {
      name: 'Sneha Patel',
      email: 'sneha@example.com',
      phone: '9800000002',
      gender: 'female',
      course: courses[0]._id,
      batch: batches[0]._id,
      totalFees: 25000,
      paidFees: 15000,
      feeStatus: 'partial',
      status: 'active',
      city: 'Pune',
      qualification: 'BCA'
    },
    {
      name: 'Raj Kumar',
      email: 'raj@example.com',
      phone: '9800000003',
      gender: 'male',
      course: courses[1]._id,
      batch: batches[1]._id,
      totalFees: 20000,
      paidFees: 0,
      feeStatus: 'pending',
      status: 'active',
      city: 'Delhi',
      qualification: 'BSc'
    },
    {
      name: 'Pooja Singh',
      email: 'pooja@example.com',
      phone: '9800000004',
      gender: 'female',
      course: courses[1]._id,
      batch: batches[1]._id,
      totalFees: 20000,
      paidFees: 20000,
      feeStatus: 'paid',
      status: 'active',
      city: 'Bangalore',
      qualification: 'MCA'
    },
    {
      name: 'Vikram Reddy',
      email: 'vikram@example.com',
      phone: '9800000005',
      gender: 'male',
      course: courses[0]._id,
      batch: batches[0]._id,
      totalFees: 25000,
      paidFees: 10000,
      feeStatus: 'partial',
      status: 'active',
      city: 'Hyderabad',
      qualification: 'B.Sc IT'
    }
  ];

  const students = [];
  for (const data of studentData) {
    const s = new Student(data);
    await s.save();
    students.push(s);
  }

  // Update batches with students
  await Batch.findByIdAndUpdate(batches[0]._id, {
    $push: { students: { $each: [students[0]._id, students[1]._id, students[4]._id] } }
  });
  await Batch.findByIdAndUpdate(batches[1]._id, {
    $push: { students: { $each: [students[2]._id, students[3]._id] } }
  });

  console.log('Students seeded...');

  // Create fees sequentially so pre-save hook assigns unique receipt numbers
  const feeData = [
    {
      student: students[0]._id,
      batch: batches[0]._id,
      course: courses[0]._id,
      amount: 25000,
      paymentMode: 'online',
      purpose: 'Course Fee',
      status: 'paid',
      collectedBy: users[0]._id
    },
    {
      student: students[1]._id,
      batch: batches[0]._id,
      course: courses[0]._id,
      amount: 15000,
      paymentMode: 'cash',
      purpose: 'Course Fee (Partial)',
      status: 'paid',
      collectedBy: users[0]._id
    },
    {
      student: students[3]._id,
      batch: batches[1]._id,
      course: courses[1]._id,
      amount: 20000,
      paymentMode: 'upi',
      purpose: 'Course Fee',
      status: 'paid',
      collectedBy: users[0]._id
    },
    {
      student: students[4]._id,
      batch: batches[0]._id,
      course: courses[0]._id,
      amount: 10000,
      paymentMode: 'cash',
      purpose: 'Course Fee (Partial)',
      status: 'paid',
      collectedBy: users[0]._id
    }
  ];
  for (const data of feeData) {
    const f = new Fee(data);
    await f.save();

  console.log('Fees seeded...');


  // Create enquiries
  await Enquiry.create([
    {
      name: 'Rohit Verma',
      phone: '9900000001',
      email: 'rohit@example.com',
      course: 'Full Stack Web Development',
      source: 'walk-in',
      status: 'interested',
      message: 'Interested in full stack course, wants to know fee structure'
    },
    {
      name: 'Meena Kapoor',
      phone: '9900000002',
      email: 'meena@example.com',
      course: 'Python & Data Science',
      source: 'social_media',
      status: 'new',
      message: 'Saw your Instagram ad, interested in Python course'
    },
    {
      name: 'Suresh Babu',
      phone: '9900000003',
      course: 'Digital Marketing',
      source: 'referral',
      status: 'follow_up',
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Anjali Mishra',
      phone: '9900000004',
      email: 'anjali@example.com',
      course: 'UI/UX Design',
      source: 'phone',
      status: 'contacted'
    }
  ]);

  console.log('Enquiries seeded...');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin: abhi@gmail.com / 123');
  console.log('  Trainer: rahul@shilabs.com / trainer123');
  process.exit(0);
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
