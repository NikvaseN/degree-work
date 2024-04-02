export const statuses = {
	'new': 'Проверка',
	'accept': 'Принят',
	'canceled': 'Отменен',
	'cooking': 'Готовится',
	'ready': 'Готов',
	'delivering': 'Доставляется',
	'ended': 'Завершен',
}

export const ruStatus = (status) =>{
	return statuses[status]
}