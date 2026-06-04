import express from 'express'

import { UPLOADS_DIR } from '../config/uploads'

/** CORP value for embeddable venue images (cross-origin <img>, canvas, etc.). */
export const UPLOADS_CROSS_ORIGIN_RESOURCE_POLICY = 'cross-origin'

export function setUploadsCrossOriginHeaders(
	_req: express.Request,
	res: express.Response,
	next: express.NextFunction,
): void {
	res.setHeader(
		'Cross-Origin-Resource-Policy',
		UPLOADS_CROSS_ORIGIN_RESOURCE_POLICY,
	)
	res.removeHeader('Cross-Origin-Embedder-Policy')
	next()
}

/**
 * Serves /uploads before helmet so API security headers do not override image CORP.
 */
export function createUploadsStatic(): express.RequestHandler[] {
	return [
		setUploadsCrossOriginHeaders,
		express.static(UPLOADS_DIR, {
			setHeaders(res) {
				res.setHeader(
					'Cross-Origin-Resource-Policy',
					UPLOADS_CROSS_ORIGIN_RESOURCE_POLICY,
				)
				res.removeHeader('Cross-Origin-Embedder-Policy')
			},
		}),
	]
}
