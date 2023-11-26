import OrderModel from '../models/order.js';
import UserModel from '../models/user.js';
import bcrypt from 'bcrypt';

// Создание аккаунта курьера
export const create = async (req,res) =>{
	try {
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
			message:"Не удалось создать курьера"
		})
	}
}

// Принятие заказа
export const take = async (req,res) =>{
	try {
		const courier = req.userId;
		const order =  req.params.id;
		const active = await OrderModel.find({status : 'pending', courier: req.userId })
		if(active.length){
			res.status(403).json({
				msg:"У вас уже есть активный заказ"
			})
		}
		else{
			OrderModel.findByIdAndUpdate(order, 
				{'courier': courier}, 
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

// Принятие заказа
export const finish = async (req,res) =>{
	try {
		const courier = req.userId;
		const orderId =  req.params.id;
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

		OrderModel.findOneAndUpdate(
			{ _id: order, courier: courier},
			{ $unset: { courier: 1 } },
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
		const orders = await OrderModel.find({status : 'pending', courier: null, methodDelivery: 'delivery'}).populate('products.product').populate('user')
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
		const order = await OrderModel.find({status : 'pending', courier: req.userId }).populate('products.product').populate('user')
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
		const ordersPending = await OrderModel.countDocuments({status: 'pending'});
		const ordersCanceled = await OrderModel.countDocuments({status: 'canceled'});
		const ordersEnded = await OrderModel.countDocuments({status: 'ended'});

		const couriers = await UserModel.countDocuments({role: 'courier'});
		const working = await OrderModel.countDocuments({status:'pending', courier: { $ne: null }});
		const ordersData = {
			orders: orders,
			new: ordersNew, 
			pending: ordersPending,
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
		const active = await OrderModel.countDocuments({courier: req.userId, status: 'pending'});
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

// Редактировать профиль
export const update = async (req,res) => {
	try {
		const accountId = req.userId;
		const updateFields = {};
		const fieldsToUpdate = [
		  'fullName',
		  'surname',
		  'patronymic',
		  'phone',
		  'city',
		  'street',
		  'house',
		  'apartment',
		  'birthday',
		  'imageUrl',
		];

		/// Проверка пароля 
		const user = await UserModel.findById(accountId);
		if (!user){
			return res.status(403).json({
				msg:"Пользователь не найден"
			});
		}

		const isValidPass = await bcrypt.compare(req.body.prevPassword, user._doc.passwordHash);
		if (!isValidPass){
			return res.status(400).json({
				msg:"Неверный пароль"
			})
		}
		///

		// Проверяем какие поля нужно изменить
		fieldsToUpdate.map(field => {
			if (req.body[field]) {
				updateFields[field] = req.body[field];
			}
		});

		if (req.body.password) {
			const password = req.body.password;
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);
			updateFields.passwordHash = hash;
		}

		await UserModel.updateOne(
			{
				_id: accountId
			},
			updateFields
		);
	  
		res.status(200).json({
			msg:"Аккаунт успешно обновлен"
		})

	} catch (err) {
		console.log(err)
		res.status(500).json({
			msg:"Не удалось обновить аккаунт"
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
