import { AppError } from '../../middleware/error.middleware'
import { AdminRepository } from './admin.repository'
import { AdminQueryFilters, DashboardSummary } from './admin.types'

export class AdminService {
	constructor(private readonly adminRepository: AdminRepository) {}

	public async getDashboard(role: 'admin'): Promise<DashboardSummary> {
		if (role !== 'admin') throw new AppError('Forbidden', 403)
		return this.adminRepository.getDashboardSummary()
	}

	public async listUsers(role: 'admin', filters: AdminQueryFilters) {
		if (role !== 'admin') throw new AppError('Forbidden', 403)
		return this.adminRepository.listUsers(filters)
	}

	public async listOwners(role: 'admin', filters: AdminQueryFilters) {
		if (role !== 'admin') throw new AppError('Forbidden', 403)
		return this.adminRepository.listUsers(filters, 'owner')
	}

	public async listVenues(role: 'admin', filters: AdminQueryFilters) {
		if (role !== 'admin') throw new AppError('Forbidden', 403)
		return this.adminRepository.listVenues(filters)
	}

	public async listBookings(role: 'admin', filters: AdminQueryFilters) {
		if (role !== 'admin') throw new AppError('Forbidden', 403)
		return this.adminRepository.listBookings(filters)
	}
}
