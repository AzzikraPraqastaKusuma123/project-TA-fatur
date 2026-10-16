const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schema);
        console.log('Schema created successfully.');

        // Simple seeder for roles and test users
        await connection.query('USE household_meal_planner');
        
        const bcrypt = require('bcrypt');
        const defaultPassword = await bcrypt.hash('password123', 10);
        
        await connection.query(`
            INSERT IGNORE INTO users (name, email, password, role) VALUES 
            ('Admin Demo', 'admin@demo.com', ?, 'ADMIN'),
            ('User Demo', 'user@demo.com', ?, 'USER')
        `, [defaultPassword, defaultPassword]);
        
        console.log('Demo users created. user@demo.com & admin@demo.com (password: password123)');

        await connection.end();
        console.log('Database setup complete.');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase();
