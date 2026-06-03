import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { PaymentsService } from './payments.service'
import { CreatePaymentRequestBody, PaymentListFilters } from './payments.types'

export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	public create = async (
		req: Request<unknown, unknown, CreatePaymentRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const result = await this.paymentsService.createPayment(
				user.id,
				user.role,
				req.body,
			)
			sendSuccess(res, 201, result.message, {
				transactionId: result.transactionId,
				amount: result.amount,
				success: true,
			})
		} catch (error) {
			next(error)
		}
	}

	public list = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const filters = this.parseFilters(req.query)
			const payments = await this.paymentsService.listPayments(
				user.role,
				user.id,
				filters,
			)
			sendSuccess(res, 200, 'Payments fetched successfully', payments)
		} catch (error) {
			next(error)
		}
	}

	private parseFilters(query: Request['query']): PaymentListFilters {
		const toNumber = (value: unknown): number | undefined => {
			if (value === undefined) return undefined
			const parsed = Number(value)
			return Number.isNaN(parsed) ? undefined : parsed
		}
		return {
			search: typeof query.search === 'string' ? query.search : undefined,
			page: toNumber(query.page),
			limit: toNumber(query.limit),
			sortBy: typeof query.sortBy === 'string' ? query.sortBy : undefined,
			sortOrder:
				query.sortOrder === 'asc'
					? 'asc'
					: query.sortOrder === 'desc'
						? 'desc'
						: undefined,
		}
	}
}
