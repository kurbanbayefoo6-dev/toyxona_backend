require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const connectionString = process.env.DATABASE_URL
const requiresSsl =
	process.env.DATABASE_SSL === 'true' ||
	process.env.NODE_ENV === 'production' ||
	(connectionString?.includes('render.com') ?? false)

const pool = new Pool({
	connectionString,
	ssl: requiresSsl ? { rejectUnauthorized: false } : false,
})

async function seedAdmin() {
	const adminEmail = 'admin@toyxona.uz'
	const adminUsername = 'admin'
	const adminPassword = 'admin123'
	const firstName = 'Admin'
	const lastName = 'User'
	const phone = '+998901234567'

	// Check if admin already exists
	const existingAdmin = await pool.query(
		'SELECT id FROM users WHERE email = $1 OR username = $2',
		[adminEmail, adminUsername]
	)

	if (existingAdmin.rows.length > 0) {
		console.log('Admin user already exists')
		return
	}

	// Hash password
	const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
	const passwordHash = await bcrypt.hash(adminPassword, saltRounds)

	// Insert admin user
	const result = await pool.query(
		`INSERT INTO users (first_name, last_name, username, email, phone, password_hash, role, is_verified)
		 VALUES ($1, $2, $3, $4, $5, $6, 'admin', TRUE)
		 RETURNING id, email, username`,
		[firstName, lastName, adminUsername, adminEmail, phone, passwordHash]
	)

	console.log('Admin user created successfully:')
	console.log('Email:', adminEmail)
	console.log('Username:', adminUsername)
	console.log('Password:', adminPassword)
	console.log('User ID:', result.rows[0].id)
}

seedAdmin()
	.catch(error => {
		console.error('Error seeding admin:', error.message)
		process.exit(1)
	})
	.finally(() => pool.end())
