import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { MenuItemsService } from './menu-items.service'
import {
	CreateMenuItemRequestBody,
	UpdateMenuItemRequestBody,
} from './menu-items.types'

export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	public create = async (
		req: Request<unknown, unknown, CreateMenuItemRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const item = await this.menuItemsService.createItem(
				user.id,
				role,
				req.body,
			)
			sendSuccess(res, 201, 'Menu item created successfully', item)
		} catch (error) {
			next(error)
		}
	}

	public getAll = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const venueId = req.query.venueId ? Number(req.query.venueId) : undefined
			const user = getUserFromRequest(req)
			const items = await this.menuItemsService.getItems(
				user?.role,
				user?.id,
				venueId,
			)
			sendSuccess(res, 200, 'Menu items fetched successfully', items)
		} catch (error) {
			next(error)
		}
	}

	public getById = async (
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid menu item id', 400)
			const user = getUserFromRequest(req)
			const item = await this.menuItemsService.getItemById(
				user?.role,
				user?.id,
				id,
			)
			sendSuccess(res, 200, 'Menu item fetched successfully', item)
		} catch (error) {
			next(error)
		}
	}

	public update = async (
		req: Request<{ id: string }, unknown, UpdateMenuItemRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid menu item id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const item = await this.menuItemsService.updateItem(
				user.id,
				role,
				id,
				req.body,
			)
			sendSuccess(res, 200, 'Menu item updated successfully', item)
		} catch (error) {
			next(error)
		}
	}

	public delete = async (
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid menu item id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			await this.menuItemsService.deleteItem(user.id, role, id)
			sendSuccess(res, 200, 'Menu item deleted successfully')
		} catch (error) {
			next(error)
		}
	}
}
