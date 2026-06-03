export interface DashboardSummary {
	totalUsers: number
	totalOwners: number
	totalCustomers: number
	totalVenues: number
	approvedVenues: number
	pendingVenues: number
	totalBookings: number
	completedBookings: number
	upcomingBookings: number
	cancelledBookings: number
	totalRevenue: number
}

export interface AdminListFilters {
	search?: string
	page?: number
	limit?: number
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
	status?: string
}

export interface AdminQueryFilters extends AdminListFilters {}
