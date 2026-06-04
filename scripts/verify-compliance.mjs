/**
 * Compliance smoke test: customer payment + admin create owner.
 * Usage: node scripts/verify-compliance.mjs [API_BASE_URL]
 */
const BASE = (process.argv[2] || 'https://toyxona-backend-1.onrender.com').replace(
	/\/$/,
	'',
)

const ADMIN = { identifier: 'admin@toyxona.uz', password: 'admin123' }
const OTP = '111111'

async function request(path, options = {}) {
	const url = `${BASE}${path}`
	const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
	})
	const text = await res.text()
	let body
	try {
		body = text ? JSON.parse(text) : null
	} catch {
		body = text
	}
	return { status: res.status, body }
}

function tokenFrom(body) {
	return body?.data?.accessToken || body?.data?.token || body?.accessToken
}

async function main() {
	const stamp = Date.now()
	console.log('API:', BASE)

	// --- Admin login ---
	const adminLogin = await request('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(ADMIN),
	})
	const adminToken = tokenFrom(adminLogin.body)
	if (!adminToken) {
		console.error('ADMIN LOGIN FAIL', adminLogin.status, adminLogin.body)
		process.exit(1)
	}
	console.log('OK admin login', adminLogin.status)

	// --- Create owner ---
	const ownerUser = `owner_${stamp}`
	const ownerEmail = `owner_${stamp}@test.toyxona.uz`
	const ownerPass = 'OwnerTest123'
	const createOwner = await request('/api/admin/owners', {
		method: 'POST',
		headers: { Authorization: `Bearer ${adminToken}` },
		body: JSON.stringify({
			firstName: 'Test',
			lastName: 'Owner',
			email: ownerEmail,
			username: ownerUser,
			password: ownerPass,
			isVerified: true,
		}),
	})
	if (createOwner.status !== 201 && createOwner.status !== 200) {
		console.error('CREATE OWNER FAIL', createOwner.status, createOwner.body)
		process.exit(1)
	}
	console.log('OK create owner', createOwner.status, createOwner.body?.data?.username)

	const ownerLogin = await request('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify({ identifier: ownerUser, password: ownerPass }),
	})
	if (ownerLogin.status !== 200 || !tokenFrom(ownerLogin.body)) {
		console.error('OWNER LOGIN FAIL', ownerLogin.status, ownerLogin.body)
		process.exit(1)
	}
	console.log('OK owner login', ownerLogin.status)

	// --- Customer register + verify ---
	const custUser = `cust_${stamp}`
	const custEmail = `cust_${stamp}@test.toyxona.uz`
	const custPass = 'CustTest123'
	const reg = await request('/api/auth/register/customer', {
		method: 'POST',
		body: JSON.stringify({
			firstName: 'Test',
			lastName: 'Customer',
			email: custEmail,
			username: custUser,
			password: custPass,
			phone: `+99890${String(stamp).slice(-7)}`,
		}),
	})
	if (reg.status !== 201 && reg.status !== 200) {
		console.error('REGISTER FAIL', reg.status, reg.body)
		process.exit(1)
	}
	const verify = await request('/api/auth/verify-otp', {
		method: 'POST',
		body: JSON.stringify({ email: custEmail, otpCode: OTP }),
	})
	const customerToken = tokenFrom(verify.body)
	if (!customerToken) {
		console.error('VERIFY FAIL', verify.status, verify.body)
		process.exit(1)
	}
	console.log('OK customer verified', verify.status)

	// --- Venue ---
	const venues = await request('/api/venues?page=1&limit=5')
	const venue = venues.body?.data?.items?.find(v => v.status === 'approved') ||
		venues.body?.data?.items?.[0]
	if (!venue?.id) {
		console.error('NO VENUE', venues.status, venues.body)
		process.exit(1)
	}
	const venueId = Number(venue.id)
	console.log('OK venue', venueId)

	// --- Booking (future date) ---
	const d = new Date()
	d.setMonth(d.getMonth() + 2)
	const bookingDate = d.toISOString().slice(0, 10)
	const booking = await request('/api/bookings', {
		method: 'POST',
		headers: { Authorization: `Bearer ${customerToken}` },
		body: JSON.stringify({
			venueId,
			bookingDate,
			guestCount: 50,
			selectedSingerIds: [],
			selectedCarIds: [],
			selectedKarnayIds: [],
		}),
	})
	if (booking.status !== 201 && booking.status !== 200) {
		console.error('BOOKING FAIL', booking.status, booking.body)
		process.exit(1)
	}
	const bookingId = Number(booking.body?.data?.id)
	const customerId = Number(booking.body?.data?.customerId)
	console.log('OK booking', bookingId, 'customerId', customerId, typeof customerId)

	// --- Payment ---
	const payment = await request('/api/payments', {
		method: 'POST',
		headers: { Authorization: `Bearer ${customerToken}` },
		body: JSON.stringify({ bookingId, paymentType: 'advance' }),
	})
	if (payment.status !== 201) {
		console.error('PAYMENT FAIL', payment.status, payment.body)
		process.exit(1)
	}
	console.log('OK payment', payment.status, payment.body?.data)
	console.log('\nAll compliance checks passed.')
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
