import multer from 'multer'
import path from 'path'

import { ensureUploadsDir, UPLOADS_DIR } from './uploads'

ensureUploadsDir()

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, UPLOADS_DIR)
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
		const extension = path.extname(file.originalname) || '.jpg'
		cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`)
	},
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
	if (!file.mimetype.startsWith('image/')) {
		cb(new Error('Only image files are allowed'))
		return
	}

	cb(null, true)
}

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 },
})
