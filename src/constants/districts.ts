export const TASHKENT_DISTRICTS = [
	'Bektemir',
	'Chilonzor',
	'Mirobod',
	"Mirzo Ulug'bek",
	'Mirzo Ulug‘bek',
	'Olmazor',
	'Sergeli',
	'Shayxontohur',
	'Uchtepa',
	'Yakkasaroy',
	'Yashnobod',
	'Yunusobod',
	'Yangihayot',
] as const

const NORMALIZED_DISTRICTS = new Set(
	TASHKENT_DISTRICTS.map(district =>
		district.toLowerCase().replace(/[‘’`]/g, "'"),
	),
)

export function isTashkentDistrict(value: string): boolean {
	return NORMALIZED_DISTRICTS.has(value.trim().toLowerCase().replace(/[‘’`]/g, "'"))
}
