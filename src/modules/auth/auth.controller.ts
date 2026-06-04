import { NextFunction, Request, Response } from 'express'

import { sendSuccess } from '../../utils/response'
import { AuthService } from './auth.service'
import {
	ForgotPasswordRequestBody,
	LoginRequestBody,
	RegisterRequestBody,
	ResendOtpRequestBody,
	ResetPasswordRequestBody,
	VerifyOtpRequestBody,
} from './auth.types'

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	public registerCustomer = async (
		req: Request<unknown, unknown, RegisterRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.registerCustomer(req.body)
			sendSuccess(res, 201, 'Customer registered successfully', result)
		} catch (error) {
			next(error)
		}
	}

	public registerOwner = async (
		req: Request<unknown, unknown, RegisterRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.registerOwner(req.body)
			sendSuccess(res, 201, 'Owner registered successfully', result)
		} catch (error) {
			next(error)
		}
	}

	public verifyOtp = async (
		req: Request<unknown, unknown, VerifyOtpRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.verifyOtp(req.body)
			sendSuccess(res, 200, 'OTP verified successfully', result)
		} catch (error) {
			next(error)
		}
	}

	public resendOtp = async (
		req: Request<unknown, unknown, ResendOtpRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.resendOtp(req.body)
			sendSuccess(res, 200, 'OTP resent successfully', result)
		} catch (error) {
			next(error)
		}
	}

	public login = async (
		req: Request<unknown, unknown, LoginRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.login(req.body)
			sendSuccess(res, 200, 'Login successful', result)
		} catch (error) {
			next(error)
		}
	}

	public logout = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.logout()
			sendSuccess(res, 200, result.message)
		} catch (error) {
			next(error)
		}
	}

	public forgotPassword = async (
		req: Request<unknown, unknown, ForgotPasswordRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.forgotPassword(req.body)
			sendSuccess(res, 200, result.message, result)
		} catch (error) {
			next(error)
		}
	}

	public resetPassword = async (
		req: Request<unknown, unknown, ResetPasswordRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.authService.resetPassword(req.body)
			sendSuccess(res, 200, result.message)
		} catch (error) {
			next(error)
		}
	}
}
