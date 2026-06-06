const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');

dotenv.config();

const sites = [
  {
    name: 'Metro Rail Extension Phase 3',
    code: 'SITE-001',
    address: '45 Guindy Industrial Estate, Guindy',
    city: 'Chennai',
    state: 'Tamil Nadu',
    location: { lat: 13.0067, lng: 80.2206 },
    geofenceRadius: 300,
    type: 'infrastructure',
    description: 'Underground metro rail construction project',
    startDate: new Date('2025-01-15')
  },
  {
    name: 'Skyline Towers Residential',
    code: 'SITE-002',
    address: '12 OMR Road, Sholinganallur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    location: { lat: 12.9010, lng: 80.2279 },
    geofenceRadius: 200,
    type: 'residential',
    description: 'High-rise residential complex - 3 towers',
    startDate: new Date('2025-03-01')
  },
  {
    name: 'Phoenix Tech Park',
    code: 'SITE-003',
    address: 'HITEC City, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    location: { lat: 17.4400, lng: 78.3489 },
    geofenceRadius: 250,
    type: 'commercial',
    description: 'IT park commercial building construction',
    startDate: new Date('2025-02-10')
  },
  {
    name: 'National Highway 44 Flyover',
    code: 'SITE-004',
    address: 'NH-44 Bypass, Electronic City',
    city: 'Bangalore',
    state: 'Karnataka',
    location: { lat: 12.8440, lng: 77.6568 },
    geofenceRadius: 500,
    type: 'infrastructure',
    description: 'Flyover construction at NH-44 junction',
    startDate: new Date('2025-04-01')
  },
  {
    name: 'Greenfield Industrial Complex',
    code: 'SITE-005',
    address: 'SIPCOT Industrial Area, Sriperumbudur',
    city: 'Sriperumbudur',
    state: 'Tamil Nadu',
    location: { lat: 12.9657, lng: 79.9414 },
    geofenceRadius: 400,
    type: 'industrial',
    description: 'Large-scale industrial manufacturing unit',
    startDate: new Date('2025-05-15')
  }
];

const workerNames = [
  'Rajesh Kumar', 'Suresh Patel', 'Manoj Singh', 'Vikram Reddy', 'Arun Sharma',
  'Deepak Yadav', 'Ramesh Iyer', 'Sanjay Gupta', 'Prakash Joshi', 'Naveen Raj',
  'Karthik Nair', 'Ganesh Babu', 'Ravi Shankar', 'Ajay Verma', 'Mohan Das',
  'Sunil Kumar', 'Venkat Rao', 'Ashok Pillai', 'Dinesh Murugan', 'Harish Menon',
  'Gopal Krishna', 'Mahesh Naidu', 'Pavan Kumar', 'Srikanth Reddy', 'Bala Subramanian',
  'Senthil Nathan', 'Anand Raj', 'Vijay Kumar', 'Prasad Rao', 'Murali Krishnan',
  'Saravanan P', 'Thangaraj K', 'Selvam M', 'Muthu Kumar', 'Pandian S',
  'Arjun Nair', 'Kishore Babu', 'Sathish R', 'Logesh V', 'Dhanush K',
  'Vignesh S', 'Bharath M', 'Kiran Reddy', 'Aakash Sharma', 'Rohit Singh',
  'Amit Patel', 'Saurabh Gupta', 'Nitin Verma', 'Rahul Joshi', 'Pradeep Yadav'
];

const inchargeNames = [
  'Sundar Rajan', 'Venkatesh Iyer', 'Nagesh Rao', 'Balaji Krishna', 'Jayaram Pillai'
];

const categories = ['skilled', 'unskilled', 'contractor', 'engineer'];
const leaveTypes = ['sick', 'casual', 'earned', 'emergency', 'personal'];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create Super Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'vijaybabuarumilli99@gmail.com',
      password: 'vijay@123',
      phone: '9876543210',
      role: 'super_admin',
      category: 'supervisor',
      designation: 'System Administrator'
    });
    console.log('✅ Super Admin created');



    console.log('\n🎉 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin: vijaybabuarumilli99@gmail.com / vijay@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
