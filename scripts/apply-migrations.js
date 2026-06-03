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
	const migrationPath = path.join(
		__dirname,
		'..',
		'database',
		'migrations',
		'001_missing_tables.sql',
	)
	const sql = fs.readFileSync(migrationPath, 'utf8')

	await pool.query(sql)
	console.log('Migrations applied successfully')
}

main()
	.catch(error => {
		console.error('Migration failed:', error.message)
		process.exit(1)
	})
	.finally(() => pool.end())
