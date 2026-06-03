import { NextFunction, Request, Response } from 'express'

import { AppError } from './error.middleware'

export const validateIdParam = (
	paramName: string = 'id',
): ((req: Request, res: Response, next: NextFunction) => void) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		try {
			const paramValue = req.params[paramName]

			if (!paramValue) {
				throw new AppError(`${paramName} parameter is required`, 400)
			}

			const id = Number(paramValue)

			if (Number.isNaN(id) || id <= 0 || !Number.isInteger(id)) {
				throw new AppError(`Invalid ${paramName} parameter`, 400)
			}

			next()
		} catch (error) {
			next(error)
		}
	}
}

export const validateVenueIdParam = validateIdParam('venueId')
export const validateImageIdParam = validateIdParam('imageId')
export const validateBookingIdParam = validateIdParam('bookingId')
