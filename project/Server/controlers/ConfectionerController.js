import OrderModel from '../models/order.js';
import UserModel from '../models/user.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Создание аккаунта кондитера
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
			role: 'confectioner',
			imageUrl: req.body.imageUrl,
			balance: 0,
		})

		const confectioner = await doc.save()
		
		res.json(confectioner)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать аккаунт"
		})
	}
}

// Получение не полного пользователя
export const access = async (req,res) =>{
	try{
		const user = await UserModel.findById(req.userId)
		if (!user){
			return res.status(403).json({
				msg:'Пользователь не найден'
			})
		}
		const { fullName, role, imageUrl} = user._doc;
		const userInfo = { fullName, role, imageUrl};
		res.json(userInfo);

	} catch(err) {
		console.log(err)
		res.status(500).json({
			msg:"Нет доступа"
		})
	}
}

// Получение пользователя
export const getMe = async (req,res) =>{
	try{
		const user = await UserModel.findById(req.userId)
		const password = req.body.password

		if (!user){
			return res.status(403).json({
				msg:'Пользователь не найден'
			})
		}

		/// Проверка пароля 
		const isValidPass = await bcrypt.compare(password, user._doc.passwordHash);
		if (!isValidPass){
			return res.status(403).json({
				msg:"Неверный пароль"
			})
		}

		const {passwordHash, ...userData} = user._doc
		res.json({
			...userData
		});

	} catch(err) {
		console.log(err)
		res.status(500).json({
			msg:"Нет доступа"
		})
	}
}

// Получение заказов для готовки
export const orders = async (req,res) =>{
	try{
		const orders = await OrderModel.find({$or:[ {'status':'accept'}, {'status':'cooking'}]}).populate('products.product').populate('user')
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

// Принятие заказа
export const take = async (req,res) =>{
	try {
		const order = req.params.id;

		if (!mongoose.isValidObjectId(order)) {
			return res.status(400).json({
			  	msg: 'Некорректный тип идентификатора',
			});
		}

		OrderModel.findByIdAndUpdate(order, 
			{'status': 'cooking'}, 
			(err, doc) =>{
				if (err){
					console.log(err)
					res.status(500).json({
					msg:"Не удалось принять заказ"
					})
				}
				
				if (!doc){
					return res.status(404).json({
						msg:'Заказ не найден'
					});
				}
	
				res.status(200).json({
					msg:"Заказ успешно принят"
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

// Завершение заказа
export const finish = async (req,res) =>{
	try {
		const orderId =  req.params.id;

		if (!mongoose.isValidObjectId(orderId)) {
			return res.status(400).json({
			  	msg: 'Некорректный тип идентификатора',
			});
		}

		OrderModel.findByIdAndUpdate(orderId, 
			{'status': 'ready'}, 
			(err, doc) =>{
				if (err){
					console.log(err)
					res.status(500).json({
					msg:"Не удалось завершить заказ"
					})
				}
				
				if (!doc){
					return res.status(404).json({
						msg:'Заказ не найден'
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
