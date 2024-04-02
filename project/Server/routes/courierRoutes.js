import {staffCreateValidation, accountUpdateValidation} from '../validations.js';
import checkAuth from '../utils/checkAuth.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import express from 'express';
import * as CourierController from '../controlers/CourierController.js';
import {checkCourier, checkModerator, checkStaff} from '../utils/checkRole.js';

const app = express();

// Курьеры: администратор
app.get('/couriers/count', checkAuth, checkModerator, CourierController.getAllCount)
app.post('/couriers', checkAuth, checkModerator, staffCreateValidation, handleValidationErrors, CourierController.create)

// Статистика курьера
app.get('/courier/stats', checkAuth, checkCourier, CourierController.stats)

// Обновление фото профиля
app.patch('/courier/avatar', checkAuth, checkStaff, CourierController.avatar)

// История заказов
app.get('/courier/history', checkAuth, checkCourier, CourierController.history)

// Список заказов для доставки
app.get('/courier/orders', checkAuth, checkCourier, CourierController.orders)

// Получение активного (для доставки) заказа
app.get('/courier/working', checkAuth, checkCourier, CourierController.working)

// Принять заказ
app.post('/courier/take/:id', checkAuth, checkCourier, CourierController.take)

// Отменить заказ
app.post('/courier/cancel/:id', checkAuth, checkCourier, CourierController.cancel)

// Завершить заказ
app.post('/courier/finish/:id', checkAuth, checkCourier, CourierController.finish)

export default app