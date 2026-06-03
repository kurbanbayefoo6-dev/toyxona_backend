import type { Request } from 'express'

import type { UserContext } from '../types/user-context'

export type { UserContext, UserRole } from '../types/user-context'

export const getUserFromRequest = (
	req: Pick<Request, 'user'>,
): UserContext | undefined => {
	return req.user
}
