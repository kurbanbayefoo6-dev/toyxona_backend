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

async function resetAdminPassword() {
	const newEmail = 'admin@toyxona.uz'
	const newUsername = 'admin'
	const newPassword = 'admin123'
	const firstName = 'Admin'
	const lastName = 'User'
	const phone = '+998901234567'

	// Check if admin exists
	const existingAdmin = await pool.query(
		'SELECT id, email, username FROM users WHERE role = $1',
		['admin']
	)

	if (existingAdmin.rows.length === 0) {
		console.log('No admin user found, creating one...')
		
		// Hash password
		const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
		const passwordHash = await bcrypt.hash(newPassword, saltRounds)

		// Insert admin user
		const result = await pool.query(
			`INSERT INTO users (first_name, last_name, username, email, phone, password_hash, role, is_verified)
			 VALUES ($1, $2, $3, $4, $5, $6, 'admin', TRUE)
			 RETURNING id, email, username`,
			[firstName, lastName, newUsername, newEmail, phone, passwordHash]
		)

		console.log('Admin user created successfully:')
		console.log('Email:', newEmail)
		console.log('Username:', newUsername)
		console.log('Password:', newPassword)
		console.log('User ID:', result.rows[0].id)
	} else {
		const admin = existingAdmin.rows[0]
		console.log('Found existing admin user:')
		console.log('Email:', admin.email)
		console.log('Username:', admin.username)
		
		// Hash new password
		const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
		const passwordHash = await bcrypt.hash(newPassword, saltRounds)

		// Update password
		await pool.query(
			'UPDATE users SET password_hash = $1, email = $2, username = $3 WHERE id = $4',
			[passwordHash, newEmail, newUsername, admin.id]
		)

		console.log('Password updated successfully!')
		console.log('New Email:', newEmail)
		console.log('New Username:', newUsername)
		console.log('New Password:', newPassword)
	}
}

resetAdminPassword()
	.catch(error => {
		console.error('Error resetting admin password:', error.message)
		process.exit(1)
	})
	.finally(() => pool.end())
