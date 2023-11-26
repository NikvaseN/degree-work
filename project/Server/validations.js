import { body } from 'express-validator'

export const registerValidation = [
	body('adress','Ошибка в адресе').optional(),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
	body('fullName', 'Укажите имя, не менее 2 символов').isLength({min: 2}),
	body('phone', 'Укажите номер, не менее 11 символов').isLength({min: 11}),
	body('avatarUrl','Неверная ссылка на аватарку').optional().isURL(),
];

export const orderCreateValidation = [
	body('products', 'Выберите товары'),
	body('methodDelivery', 'Выберите способ доставки').isLength({min: 2}),
	body('username', 'Укажите имя заказчика').isLength({min: 1}),
	body('phone', 'Укажите номер, не менее 11 символов').isLength({min: 11, max: 11}),
];

export const loginValidation = [
	body('phone','Неверный формат номера телефона').isLength({min: 11}),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
];

export const productCreateValidation = [
	body('name', 'Введите название товара').isLength({ min: 3 }).isString(),
	body('price', 'Введите цену').isLength({ min: 1 }),
	body('category', 'Введите категорию').isString().isLength({ min: 1 }),
	body('composition', 'Введите состав товара').isString().isLength({ min: 1 }),
	body('imageUrl', 'Неверная ссылка на изображение').isString().isLength({ min: 10 })
];

export const courierCreateValidation = [
	body('fullName', 'Введите имя').isLength({ min: 1 }).isString(),
	body('surname', 'Введите фамилию').isLength({ min: 1 }),
	body('patronymic', 'Введите отчество').isString().isLength({ min: 1 }),
	body('phone', 'Введите номер телефона').isString().isLength({ min: 11, max: 11 }),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
	body('birthday', 'Введите дату рождения').isDate(),
	body('city', 'Введите город проживания').isString().isLength({ min: 1}),
	body('street', 'Введите улицу проживания').isString().isLength({ min: 1}),
	body('house', 'Введите дом проживания').isString().isLength({ min: 1}),
	body('apartment', 'Введите квартиру проживания').isString().isLength({ min: 1}),
];

export const accountUpdateValidation = [
	body('fullName', 'Введите имя').isLength({ min: 1 }).isString().optional(),
	body('surname', 'Введите фамилию').isLength({ min: 1 }).optional(),
	body('patronymic', 'Введите отчество').isString().isLength({ min: 1 }).optional(),
	body('phone', 'Введите номер телефона (11 цифр)').isString().isLength({ min: 11, max: 11 }).optional(),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}).optional(),
	body('birthday', 'Введите дату рождения').isDate().optional(),
	body('city', 'Введите город проживания').isString().isLength({ min: 1}).optional(),
	body('street', 'Введите улицу проживания').isString().isLength({ min: 1}).optional(),
	body('house', 'Введите дом проживания').isString().isLength({ min: 1}).optional(),
	body('apartment', 'Введите квартиру проживания').isString().isLength({ min: 1}).optional(),
];