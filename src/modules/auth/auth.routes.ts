import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'

const router = Router()

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const authController = new AuthController(authService)

router.post('/register/customer', authController.registerCustomer)
router.post('/register/owner', authController.registerOwner)
router.post('/verify-otp', authController.verifyOtp)
router.post('/resend-otp', authController.resendOtp)
router.post('/login', authController.login)
router.post('/logout', authenticate, authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

export default router
