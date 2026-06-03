require('dotenv').config()
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
	const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)

	const columns = await pool.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `)

	const constraints = await pool.query(`
    SELECT tc.table_name, tc.constraint_type, kcu.column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type
  `)

	console.log(
		JSON.stringify(
			{
				tables: tables.rows.map(r => r.table_name),
				columns: columns.rows,
				constraints: constraints.rows,
			},
			null,
			2,
		),
	)
}

main()
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
	.finally(() => pool.end())
