import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { FavoritesService } from './favorites.service'

export class FavoritesController {
	constructor(private readonly favoritesService: FavoritesService) {}

	public addFavorite = async (
		req: Request<{ venueId: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			if (user.role !== 'customer')
				throw new AppError('Only customers can add favorites', 403)

			const venueId = Number(req.params.venueId)
			if (Number.isNaN(venueId)) throw new AppError('Invalid venue id', 400)

			const favorite = await this.favoritesService.addFavorite(
				user.id,
				venueId,
			)
			sendSuccess(res, 201, 'Venue added to favorites', favorite)
		} catch (error) {
			next(error)
		}
	}

	public removeFavorite = async (
		req: Request<{ venueId: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			if (user.role !== 'customer')
				throw new AppError('Only customers can remove favorites', 403)

			const venueId = Number(req.params.venueId)
			if (Number.isNaN(venueId)) throw new AppError('Invalid venue id', 400)

			await this.favoritesService.removeFavorite(user.id, venueId)
			sendSuccess(res, 200, 'Venue removed from favorites')
		} catch (error) {
			next(error)
		}
	}

	public getFavorites = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			if (user.role !== 'customer')
				throw new AppError('Only customers can view favorites', 403)

			const favorites = await this.favoritesService.getUserFavorites(
				user.id,
			)
			sendSuccess(res, 200, 'Favorites fetched', favorites)
		} catch (error) {
			next(error)
		}
	}
}
