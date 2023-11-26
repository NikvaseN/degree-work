import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import checkModerator from '../utils/checkModerator.js';
import OrderModel from '../models/order.js';
import * as CourierController from '../controlers/CourierController.js';

const app = express();

// !!! Файл должен быть доступен только при разработке !!!

// Удалить N - количество заказов
app.delete('/dev/orders/:quantity', checkAuth, checkModerator, async (req,res) =>{
	try {
		let quantity = req.params.quantity;
		const data = await OrderModel.find().limit(quantity);
		data.map((obj) => (obj.remove()))
		res.send(`${data.length} закаазов удалено.`)
	} catch (error) {
		res.status(500).send(`Ошибка при удалении заказов: ${error}`);
	}
})


export default app