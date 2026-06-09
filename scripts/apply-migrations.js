require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const requiresSsl =
	process.env.DATABASE_SSL === 'true' ||
	process.env.NODE_ENV === 'production' ||
	(connectionString?.includes('render.com') ?? false)

const pool = new Pool({
	connectionString,
	ssl: requiresSsl ? { rejectUnauthorized: false } : false,
})

async function main() {
	const migrationsDir = path.join(__dirname, '..', 'database', 'migrations')
	const migrationFiles = fs
		.readdirSync(migrationsDir)
		.filter(file => file.endsWith('.sql'))
		.sort((a, b) => a.localeCompare(b))

	for (const file of migrationFiles) {
		const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
		await pool.query(sql)
		console.log(`Applied migration: ${file}`)
	}

	console.log('Migrations applied successfully')
}

main()
	.catch(error => {
		console.error('Migration failed:', error.message)
		process.exit(1)
	})
	.finally(() => pool.end())
