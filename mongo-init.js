// MongoDB initialization script
db = db.getSiblingDB('shilabs');

// Create admin user for the database
db.createUser({
  user: 'shilabs_user',
  pwd: 'shilabs_pass',
  roles: [{ role: 'readWrite', db: 'shilabs' }]
});

// Seed initial admin account
db.users.insertOne({
  name: 'Abhi Admin',
  email: 'abhi@gmail.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 123
  role: 'admin',
  status: 'active',
  phone: '9876543210',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
