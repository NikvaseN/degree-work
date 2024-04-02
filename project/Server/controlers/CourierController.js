import OrderModel from '../models/order.js';
import UserModel from '../models/user.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Создание аккаунта курьера
export const create = async (req,res) =>{
	try {

		const existingUser = await UserModel.findOne({ phone: req.body.phone });
		if (existingUser) {
			return res.status(409).json({
				msg: 'Аккаунт с таким номером телефона уже существует'
			});
		}

		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const doc = new UserModel({
			fullName: req.body.fullName,
			surname: req.body.surname,
			patronymic: req.body.patronymic,
			phone: req.body.phone,
			passwordHash: hash,
			birthday: req.body.birthday,
			city: req.body.city,
			street: req.body.street,
			house: req.body.house,
			apartment: req.body.apartment,
			role: 'courier',
			imageUrl: req.body.imageUrl,
			balance: 0,
		})

		const courier = await doc.save()
		
		res.json(courier)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать аккаунт"
		})
	}
}

// Принятие заказа
export const take = async (req,res) =>{
	try {
		const courier = req.userId;
		const order = req.params.id;

		if (!mongoose.isValidObjectId(order)) {
			return res.status(400).json({
			  	msg: 'Некорректный тип идентификатора',
			});
		}

		const active = await OrderModel.find({status : 'delivering', courier: req.userId })
		if(active.length){
			res.status(403).json({
				msg:"У вас уже есть активный заказ"
			})
		}
		else{
			OrderModel.findByIdAndUpdate(order, 
				{'courier': courier, 'status': 'delivering'}, 
				(err, doc) =>{
					if (err){
						console.log(err)
						res.status(500).json({
						msg:"Не удалось принять заказ"
						})
					}
					
					if (!doc){
						return res.status(404).json({
							msg:'Заказ или курьер не найден'
						});
					}
		
					res.status(200).json({
						msg:"Заказ успешно принят"
					})
				}
			)
		}
		
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось принять заказ"
		})
	}
}

// Завершение заказа
export const finish = async (req,res) =>{
	try {
		const courier = req.userId;
		const orderId =  req.params.id;

		if (!mongoose.isValidObjectId(orderId)) {
			return res.status(400).json({
			  	msg: 'Некорректный тип идентификатора',
			});
		}

		const order = await OrderModel.find({ _id: orderId, courier: courier})
		OrderModel.findByIdAndUpdate(order, 
			{'status': 'ended'}, 
			(err, doc) =>{
				if (err){
					console.log(err)
					res.status(500).json({
					msg:"Не удалось завершить заказ"
					})
				}
				
				if (!doc){
					return res.status(404).json({
						msg:'Заказ или курьер не найден'
					});
				}
	
				res.status(200).json({
					msg:"Заказ успешно завершен"
				})
			}
		)
		
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось принять заказ"
		})
	}
}

// Отмена заказа
export const cancel = async (req,res) =>{
	try {
		const courier = req.userId;
		const order =  req.params.id;

		if (!mongoose.isValidObjectId(order)) {
			return res.status(400).json({
			  	msg: 'Некорректный тип идентификатора',
			});
		}

		OrderModel.findOneAndUpdate(
			{ _id: order, courier: courier},
			{ $unset: { courier: 1 }, $set: { status: 'ready' } },
			{ new: true },
			(err, result) => {
				if (err){
					console.log(err)
					res.status(500).json({
					msg:"Не удалось отменить заказ"
					})
				}
				if (!result){
					return res.status(404).json({
						msg:'Заказ не найден'
					});
				}
				res.status(200).json({
					msg:"Заказ успешно отменен"
				})
			}
		  );
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось отменить заказ"
		})
	}
}

// Получение заказов для доставки
export const orders = async (req,res) =>{
	try{
		const orders = await OrderModel.find({status : 'ready', courier: null, methodDelivery: 'delivery'}).populate('products.product').populate('user')
		res.json(
			orders
		);
	}
	catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось получить заказы"
		})
	}
}

// Получение активного (для доставки) заказа
export const working = async (req,res) =>{
	try{
		const order = await OrderModel.find({status : 'delivering', courier: req.userId }).populate('products.product').populate('user')
		res.json(
			order
		);
	}
	catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось получить заказ"
		})
	}
}

// Получение колличества курьеров и заказов
export const getAllCount = async (req, res) => {
	try{
		const orders = await OrderModel.countDocuments({});
		const ordersNew = await OrderModel.countDocuments({status: 'new'});
		const ordersAccept = await OrderModel.countDocuments({status: 'accept'});
		const ordersCooking = await OrderModel.countDocuments({status: 'cooking'});
		const ordersReady = await OrderModel.countDocuments({status: 'ready'});
		const ordersDelivering = await OrderModel.countDocuments({status: 'delivering'});
		const ordersCanceled = await OrderModel.countDocuments({status: 'canceled'});
		const ordersEnded = await OrderModel.countDocuments({status: 'ended'});

		const couriers = await UserModel.countDocuments({role: 'courier'});
		const working = await OrderModel.countDocuments({status:'delivering', courier: { $ne: null }});
		const ordersData = {
			orders: orders,
			new: ordersNew,
			accept: ordersAccept,
			cooking: ordersCooking,
			ready: ordersReady,
			delivering: ordersDelivering,
			canceled: ordersCanceled,
			ended: ordersEnded,
		}
		const couriersData = {
			couriers: couriers,
			working: working,
		}
		res.json({
			ordersData: ordersData,
			couriersData: couriersData
		});
	} 
	catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось получить статистику"
		})
	}
}

// Получение истории выполненных заказов
export const history = async (req, res) => {
	try{

		const orders = await OrderModel.find({courier: req.userId, status: 'ended'}).sort([['updatedAt', -1]]).populate('products.product').populate('user');
		res.json(
			orders
		);
	} 
	catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось получить статистику"
		})
	}
}

// Получение истории выполненных заказов
export const stats = async (req, res) => {
	try{
		const active = await OrderModel.countDocuments({courier: req.userId, status: 'delivering'});
		const ended = await OrderModel.countDocuments({courier: req.userId, status: 'ended'});
		res.json({active, ended});
	} 
	catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось получить статистику"
		})
	}
}

// Обновить фото профиля
export const avatar = async (req,res) => {
	try {
		const accountId = req.userId;

		await UserModel.updateOne(
			{
				_id: accountId
			},
			{
				imageUrl: req.body.imageUrl
			}
		);
	  
		res.status(200).json({
			msg:"Фото успешно обновлен"
		})

	} catch (err) {
		console.log(err)
		res.status(500).json({
			msg:"Не удалось обновить фото"
		})
	}
}
