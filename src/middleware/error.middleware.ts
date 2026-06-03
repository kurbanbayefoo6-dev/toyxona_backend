import { NextFunction, Request, Response } from 'express'

interface ErrorResponse {
	success: false
	message: string
}

export class AppError extends Error {
	public readonly statusCode: number

	constructor(message: string, statusCode: number) {
		super(message)
		this.name = 'AppError'
		this.statusCode = statusCode
	}
}

export const errorMiddleware = (
	error: unknown,
	_req: Request,
	res: Response<ErrorResponse>,
	_next: NextFunction,
): void => {
	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			success: false,
			message: error.message,
		})
		return
	}

	const message =
		error instanceof Error ? error.message : 'Internal server error'

	res.status(500).json({
		success: false,
		message,
	})
}
