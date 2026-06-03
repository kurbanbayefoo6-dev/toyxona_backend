import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	UpdateSelfRequestBody,
	UpdateUserByAdminRequestBody,
	UserEntity,
} from './users.types'

const USER_SELECT = `
  id,
  first_name,
  last_name,
  username,
  email,
  phone,
  role,
  is_verified,
  created_at
`

export class UsersRepository {
	public async findById(userId: number): Promise<UserEntity | null> {
		const query = `
      SELECT ${USER_SELECT}
      FROM users
      WHERE id = $1
      LIMIT 1
    `

		const result: QueryResult<UserEntity> = await pool.query(query, [userId])
		return result.rows[0] || null
	}

	public async listAll(): Promise<UserEntity[]> {
		const query = `
      SELECT ${USER_SELECT}
      FROM users
      ORDER BY created_at DESC
    `

		const result: QueryResult<UserEntity> = await pool.query(query)
		return result.rows
	}

	public async updateSelf(
		userId: number,
		payload: UpdateSelfRequestBody,
	): Promise<UserEntity | null> {
		const fields: string[] = []
		const values: Array<string | number> = []
		let index = 1

		if (payload.firstName !== undefined) {
			fields.push(`first_name = $${index}`)
			values.push(payload.firstName)
			index += 1
		}

		if (payload.lastName !== undefined) {
			fields.push(`last_name = $${index}`)
			values.push(payload.lastName)
			index += 1
		}

		if (payload.phone !== undefined) {
			fields.push(`phone = $${index}`)
			values.push(payload.phone)
			index += 1
		}

		if (fields.length === 0) {
			return this.findById(userId)
		}

		const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING ${USER_SELECT}
    `

		values.push(userId)

		const result: QueryResult<UserEntity> = await pool.query(query, values)
		return result.rows[0] || null
	}

	public async updateByAdmin(
		userId: number,
		payload: UpdateUserByAdminRequestBody,
	): Promise<UserEntity | null> {
		const fields: string[] = []
		const values: Array<string | number | boolean> = []
		let index = 1

		if (payload.firstName !== undefined) {
			fields.push(`first_name = $${index}`)
			values.push(payload.firstName)
			index += 1
		}

		if (payload.lastName !== undefined) {
			fields.push(`last_name = $${index}`)
			values.push(payload.lastName)
			index += 1
		}

		if (payload.phone !== undefined) {
			fields.push(`phone = $${index}`)
			values.push(payload.phone)
			index += 1
		}

		if (payload.role !== undefined) {
			fields.push(`role = $${index}`)
			values.push(payload.role)
			index += 1
		}

		if (payload.isVerified !== undefined) {
			fields.push(`is_verified = $${index}`)
			values.push(payload.isVerified)
			index += 1
		}

		if (fields.length === 0) {
			return this.findById(userId)
		}

		const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING ${USER_SELECT}
    `

		values.push(userId)

		const result: QueryResult<UserEntity> = await pool.query(query, values)
		return result.rows[0] || null
	}

	public async deleteById(userId: number): Promise<boolean> {
		const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `

		const result = await pool.query<{ id: number }>(query, [userId])
		return (result.rowCount ?? 0) > 0
	}

	public async getUserPasswordHash(userId: number): Promise<string | null> {
		const result = await pool.query<{ password_hash: string }>(
			'SELECT password_hash FROM users WHERE id = $1 LIMIT 1',
			[userId],
		)
		return result.rows[0]?.password_hash || null
	}

	public async updateUserPassword(
		userId: number,
		passwordHash: string,
	): Promise<void> {
		await pool.query(
			'UPDATE users SET password_hash = $1 WHERE id = $2',
			[passwordHash, userId],
		)
	}
}
