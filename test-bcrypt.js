// Simple Node.js script to test BCrypt hashes
const bcrypt = require('bcryptjs');

const passwords = ['admin123', 'password123', 'Parmar123@'];
const existingHash = '$2a$10$N.wmSLQW7zV4p7kGvFNxCuQG5kLpJ6mKH8pX7xY5jZ3dQ4wH6mKFy';

console.log('Testing existing hash:', existingHash);
console.log('');

passwords.forEach(password => {
    const matches = bcrypt.compareSync(password, existingHash);
    console.log(`Password "${password}": ${matches ? '✓ MATCHES' : '✗ does not match'}`);
});

console.log('\nGenerating new hashes:');
passwords.forEach(password => {
    const hash = bcrypt.hashSync(password, 10);
    console.log(`\n"${password}":`);
    console.log(`  ${hash}`);
});
