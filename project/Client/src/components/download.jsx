import React from 'react';
import * as XLSX from 'xlsx';
import { formatDate } from './functions.jsx';
export function downloadTable (data) {
		try {
			// Создание новой таблицу Excel
			const workbook = XLSX.utils.book_new();

			const accounts = {
				'user': [],
				'courier': [],
				'admin': [],
			};

			data.map(user => {
				const role = user.role
				let userData;
				if(role === 'admin'){
					userData = [user.fullName, user.phone, formatDate(user.createdAt, 'D-M-Y')]
				}
				if(role === 'courier'){
					userData = [user.fullName, user.surname, user.patronymic, user.phone, user.city, user.street, user.house, formatDate(user.createdAt, 'D-M-Y')]
				}
				else{
					userData = [user.fullName, user.phone, user.orderCount, formatDate(user.createdAt, 'D-M-Y')]
				}
				accounts[role].push(userData);
			});

			// Создание нового листа (пользователи)
			const usersList = XLSX.utils.aoa_to_sheet([
			// Данные для заполнения таблицы
			['Имя', 'Телефон', 'Кол-во заказов', 'Дата присоединения'],
				...accounts['user'].map(user => [...user])
			]);
			// Добавление листа в книгу
			XLSX.utils.book_append_sheet(workbook, usersList, 'Пользователи');
			
			// Курьеры
			const couriersList = XLSX.utils.aoa_to_sheet([
			['Имя', 'Фамилия', 'Отчество', 'Телефон', 'Город', 'Улица', 'Дом', 'Дата присоединения'],
				...accounts['courier'].map(user => [...user])
			]);
			XLSX.utils.book_append_sheet(workbook, couriersList, 'Курьеры');

			// Администраторы
			const adminsList = XLSX.utils.aoa_to_sheet([
			['Имя', 'Телефон', 'Дата присоединения'],
				...accounts['admin'].map(user => [...user])
			]);
			XLSX.utils.book_append_sheet(workbook, adminsList, 'Администраторы');

			// Сохранение книги в формате Excel
			const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

			// Преобразование буфера в объект Blob
			const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

			// Создание URL-адреса для Blob
			const url = URL.createObjectURL(blob);

			// Создание ссылки на загрузку файла
			const link = document.createElement('a');
			link.href = url;

			// Установка имени файла для загрузки
			link.download = 'accounts.xlsx';

			// Добавление ссылкы на страницу
			document.body.appendChild(link);

			link.click();

			// Удаление ссылки после загрузки файла
			document.body.removeChild(link);

			// Освобождение URL-адреса Blob
			URL.revokeObjectURL(url);
		} catch (error) {
		  console.error('Ошибка при формировании и загрузке файла:', error);
		}
}