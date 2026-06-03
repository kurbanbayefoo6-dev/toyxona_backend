import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import { FavoriteEntity } from './favorites.types'

export class FavoritesRepository {
	public async createFavorite(
		userId: number,
		venueId: number,
	): Promise<FavoriteEntity> {
		const result: QueryResult<FavoriteEntity> = await pool.query(
			'INSERT INTO favorites (user_id, venue_id) VALUES ($1, $2) RETURNING id, user_id, venue_id, created_at',
			[userId, venueId],
		)
		return result.rows[0]
	}

	public async deleteFavorite(
		userId: number,
		venueId: number,
	): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM favorites WHERE user_id = $1 AND venue_id = $2 RETURNING id',
			[userId, venueId],
		)
		return (result.rowCount ?? 0) > 0
	}

	public async getUserFavorites(
		userId: number,
	): Promise<FavoriteEntity[]> {
		const result: QueryResult<FavoriteEntity> = await pool.query(
			'SELECT id, user_id, venue_id, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
			[userId],
		)
		return result.rows
	}

	public async isFavorite(
		userId: number,
		venueId: number,
	): Promise<boolean> {
		const result = await pool.query(
			'SELECT id FROM favorites WHERE user_id = $1 AND venue_id = $2 LIMIT 1',
			[userId, venueId],
		)
		return (result.rowCount ?? 0) > 0
	}
}
