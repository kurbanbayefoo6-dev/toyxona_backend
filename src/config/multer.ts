import multer from 'multer'

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
	if (!file.mimetype.startsWith('image/')) {
		cb(new Error('Only image files are allowed'))
		return
	}

	cb(null, true)
}

export const upload = multer({
	storage: multer.memoryStorage(),
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 },
})
