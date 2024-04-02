export const staffRoles = ['moderator', 'admin', 'courier', 'confectioner']

export const checkStaffRole = (role) =>{
	return staffRoles.includes(role)
}

export const ruRole = (obj) =>{
	const roles = {
		'courier': 'Курьер',
		'user': 'Пользователь',
		'admin': 'Администратор',
		'confectioner': 'Кондитер',
	}
	return roles[obj]
}

export const checkStaffExtAdmin = (obj) => {
	const roles = [
		'courier',
		'confectioner',
	]
	return roles.includes(obj)
}