import { NextFunction, Request, Response } from 'express'
import multer from 'multer'

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

	if (error instanceof multer.MulterError) {
		const message =
			error.code === 'LIMIT_FILE_SIZE'
				? 'Image file is too large (max 10MB)'
				: error.message
		res.status(400).json({
			success: false,
			message,
		})
		return
	}

	if (error instanceof Error && error.message === 'Only image files are allowed') {
		res.status(400).json({
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
