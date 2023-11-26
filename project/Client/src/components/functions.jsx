/**
 * Разбивает на части дату.
 * @param {string | Date} data - Дата в формате строки или объекта Date.
 * @returns {string} Объект с частями даты (Например date.day).
 */

export function parseDate (data) {
	let date;

	if (typeof data === 'string') {
		date = new Date(data);
	} else if (data instanceof Date) {
		date = data;
	} else {
		throw new Error('Invalid data type. Expected string or Date object.');
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	const result = {
		year,
		month,
		day,
		hours,
		minutes,
		seconds
	}
	
  	return result;
}

/**
 * Форматирует дату в соответствии с указанным форматом.
 * @param {string | Date} data - Дата в формате строки или объекта Date.
 * @param {string} format - Формат даты (например, "Y-M-D h:m:s").
 * @returns {string} Отформатированная дата в указанном формате.
*/

export function formatDate (data, format) {
	const date = parseDate(data)

	let formattedDate = format
    .replace("Y", date.year)
    .replace("y", String(date.year).slice(-2))
    .replace("M", date.month)
    .replace("D", date.day)
    .replace("h", date.hours)
    .replace("m", date.minutes)
    .replace("s", date.seconds);

  	return formattedDate;
}


/**
 * Форматирует телефон.
 * @param {string} string - Номер телефона в формате строки или объекта Date.
 * @returns {string} Отформатированный номер телефона.
 */

export function formatPhoneNumber(phoneNumber) {
	const phone = String(phoneNumber)
	const countryCode = phone.slice(0, 1); // Получаем первую цифру - код страны
	const areaCode = phone.slice(1, 4); // Получаем следующие три цифры - код региона
	const firstPart = phone.slice(4, 7); // Получаем трехзначную группу номера
	const secondPart = phone.slice(7, 9); // Получаем двухзначную группу номера
	const thirdPart = phone.slice(9); // Получаем последние две цифры номера
  
	return `${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
}