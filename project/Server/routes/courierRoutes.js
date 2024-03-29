import {courierCreateValidation, accountUpdateValidation} from '../validations.js';
import checkAuth from '../utils/checkAuth.js';
import checkCourier from '../utils/checkCourier.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import checkModerator from '../utils/checkModerator.js';
import express from 'express';
import * as CourierController from '../controlers/CourierController.js';
const app = express();

// Курьеры: администратор
app.get('/couriers/count', checkAuth, checkModerator, CourierController.getAllCount)
app.post('/couriers', checkAuth, checkModerator, courierCreateValidation, handleValidationErrors, CourierController.create)

// Статистика курьера
app.get('/courier/stats', checkAuth, checkCourier, CourierController.stats)

// Обновление фото профиля
app.patch('/courier/avatar', checkAuth, checkCourier, CourierController.avatar)

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