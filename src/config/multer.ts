import fs from 'fs'
import path from 'path'

import multer from 'multer'

const uploadsDir = path.join(process.cwd(), 'uploads')

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadsDir)
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
		const extension = path.extname(file.originalname)
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
})
