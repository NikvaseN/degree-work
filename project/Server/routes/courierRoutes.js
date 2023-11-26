import {courierCreateValidation, accountUpdateValidation} from '../validations.js';
import checkAuth from '../utils/checkAuth.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import checkModerator from '../utils/checkModerator.js';
import express from 'express';
import * as CourierController from '../controlers/CourierController.js';
const app = express();

// Курьеры: администратор
app.get('/couriers/count', checkAuth, checkModerator, CourierController.getAllCount)
app.post('/couriers', checkAuth, checkModerator, courierCreateValidation, handleValidationErrors, CourierController.create)


// Статистика курьера
app.get('/courier/stats', checkAuth, CourierController.stats)

// Редактирование профиля
app.patch('/courier/profile', checkAuth, accountUpdateValidation, handleValidationErrors, CourierController.update)

// Обновление фото профиля
app.patch('/courier/avatar', checkAuth, CourierController.avatar)

// История заказов
app.get('/courier/history', checkAuth, CourierController.history)

// Список заказов для доставки
app.get('/courier/orders', checkAuth, CourierController.orders)

// Получение активного (для доставки) заказа
app.get('/courier/working', checkAuth, CourierController.working)


// Принять заказ
app.post('/courier/take/:id', checkAuth, CourierController.take)

// Отменить заказ
app.post('/courier/cancel/:id', checkAuth, CourierController.cancel)

// Завершить заказ
app.post('/courier/finish/:id', checkAuth, CourierController.finish)

export default app