import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { corsOptions } from './config/cors'
import { ensureUploadsDir } from './config/uploads'
import { AppError, errorMiddleware } from './middleware/error.middleware'
import { createUploadsStatic } from './middleware/uploads-static.middleware'
import adminRoutes from './modules/admin/admin.routes'
import authRoutes from './modules/auth/auth.routes'
import bookingsRoutes from './modules/bookings/bookings.routes'
import carsRoutes from './modules/cars/cars.routes'
import favoritesRoutes from './modules/favorites/favorites.routes'
import karnaySurnayRoutes from './modules/karnay-surnay/karnay-surnay.routes'
import menuItemsRoutes from './modules/menu-items/menu-items.routes'
import paymentsRoutes from './modules/payments/payments.routes'
import reviewsRoutes from './modules/reviews/reviews.routes'
import singersRoutes from './modules/singers/singers.routes'
import usersRoutes from './modules/users/users.routes'
import venueImagesRoutes from './modules/venue-images/venue-images.routes'
import venuesRoutes from './modules/venues/venues.routes'

const app = express()

if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1)
}

ensureUploadsDir()

// Static uploads BEFORE helmet — embeddable from frontend origin (CORP cross-origin).
app.use('/uploads', ...createUploadsStatic())

app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginResourcePolicy: false,
		crossOriginEmbedderPolicy: false,
	}),
)
app.use(cors(corsOptions))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
	res.status(200).json({ success: true, message: 'API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/venues', venuesRoutes)
app.use('/api/venues', venueImagesRoutes)
app.use('/api/menu-items', menuItemsRoutes)
app.use('/api/singers', singersRoutes)
app.use('/api/cars', carsRoutes)
app.use('/api/karnay-surnay', karnaySurnayRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/admin', adminRoutes)

app.use((_req, _res, next) => {
	next(new AppError('Route not found', 404))
})

app.use(errorMiddleware)

export default app
