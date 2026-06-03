import dotenv from 'dotenv'
import { Pool, PoolConfig } from 'pg'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is required')
}

const requiresSsl =
	process.env.DATABASE_SSL === 'true' ||
	process.env.NODE_ENV === 'production' ||
	(connectionString?.includes('render.com') ?? false)

const poolConfig: PoolConfig = {
	connectionString,
}

if (requiresSsl) {
	poolConfig.ssl = { rejectUnauthorized: false }
}

export const pool = new Pool(poolConfig)
