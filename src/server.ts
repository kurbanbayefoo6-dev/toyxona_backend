import 'dotenv/config'
import './types/express-request'

import app from './app'
import { pool } from './config/db'
import { ensureUploadsDir } from './config/uploads'

const PORT = Number(process.env.PORT || 5000)
const HOST = process.env.HOST || '0.0.0.0'

ensureUploadsDir()

async function start(): Promise<void> {
	try {
		await pool.query('SELECT NOW()')

		console.log('Database connected successfully')

		const server = app.listen(PORT, HOST, () => {
			console.log(`Server is running on http://${HOST}:${PORT}`)
		})

		const shutdown = async (signal: string): Promise<void> => {
			console.log(`Received ${signal}, shutting down gracefully`)
			server.close(() => {
				void pool.end().finally(() => process.exit(0))
			})
		}

		process.on('SIGTERM', () => {
			void shutdown('SIGTERM')
		})
		process.on('SIGINT', () => {
			void shutdown('SIGINT')
		})
	} catch (error: unknown) {
		console.error('Failed to start server', error)
		process.exit(1)
	}
}

void start()
