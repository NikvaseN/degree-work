import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import userModel from '../models/user.js';
import orderModel from '../models/order.js';

// Регистрация
export const register =  async (req,res) =>{
	try {
		const errors = validationResult(req);
	if (!errors.isEmpty()){
		return res.status(400).json(errors.array());
	}

	const existingUser = await userModel.findOne({ phone: req.body.phone });
    if (existingUser) {
      return res.status(403).json({
        msg: 'Аккаунт с таким номером телефона уже существует'
      });
    }
	
	const password = req.body.password;
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);

	const doc = new userModel({
		fullName:req.body.fullName,
		phone:req.body.phone,
		passwordHash: hash,
		adress:req.body.adress,
		role:"user"
	});

	const user = await doc.save();

	const token = jwt.sign({
		_id: user._id,
	}, process.env.HASH,{
		expiresIn: '3d'
	})
 
	const {passwordHash, ...userData} = user._doc

	res.json({
		...userData,
		token
	});
	} catch (err) {
		console.log(err)
		res.status(500).json({
			msg:"Не удалось зарегистрироваться"
		})
	}
}

// Авторизация
export const login =  async (req,res) =>{
	try {
		const user = await userModel.findOne({phone: req.body.phone});
		if (!user){
			return res.status(403).json({
				msg:"Пользователь не найден"
			});
		}
	
		const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
		if (!isValidPass){
			return res.status(400).json({
				msg:"Неверный логин или пароль"
			})
		}

		const token = jwt.sign({
			_id: user._id,
		}, process.env.HASH,{
			expiresIn: '30d'
		})
		const {passwordHash, ...userData} = user._doc

		res.json({
			...userData,
			token
		});
	} catch (err){
		console.log(err)
		res.status(500).json({
			msg:"Не получилось авторизоваться"
		})
	}
}

// Получение пользователя
export const getMe = async (req,res) =>{
	try{
		const user = await userModel.findById(req.userId)
		if (!user){
			return res.status(404).json({
				msg:'Пользователь не найден'
			})
		}
		const {passwordHash, ...userData} = user._doc;
		res.json(userData);
	} catch(err) {
		console.log(err)
		res.status(500).json({
			msg:"Нет доступа"
		})
	}
}

// // Получить все аккаунты
// export const getAll = async (req,res) => {
// 	try{
// 		const users = await userModel.find({}, {passwordHash: 0});
// 		res.json(users);
// 	} catch(err) {
// 		console.log(err)
// 		res.status(500).json({
// 			msg:"Не удалось найти"
// 		})
// 	}
// }

// Поиск
export const search = async (req,res) => {
	try{
		const search = req.body.name;
		const role = req.body.role;

		const query = {
			$or: [
			  { fullName: { $regex: search, $options: 'i' } },
			  { surname: { $regex: search, $options: 'i' } },
			  { phone: { $regex: search, $options: 'i' } },
			  { patronymic: { $regex: search, $options: 'i' } }
			]
		};
		  
		if (role) {
			query.role = role;
		}
		const accounts = await userModel.find(query, {passwordHash: 0});

		if (!accounts){
			return req.status(404).json({
				msg:'Аккаунты не найдены'
			})
		}

		// Список id всех пользователей
		const userIds = accounts
				// .filter(account => account.role === 'user')
				.map(account => account._id);

		// Список количества заказов пользователя
		const orderCounts = await orderModel.aggregate([
			// Фильтр
			{ $match: { user: { $in: userIds } } },
			// Групировка в один объект (_id обязытальное свойство) 
			{ $group: { _id: '$user', count: { $sum: 1 }} }
		]);
		const accountsWithOrderCount = accounts.map(account => {
			  const orderCount = orderCounts.find(order => order._id.toString() === account._id.toString());
			  return { ...account._doc, orderCount: orderCount ? orderCount.count : 0 };
		});

		res.json(accountsWithOrderCount);
	} catch(err) {
		console.log(err)
		res.status(500).json({
			msg:"Не удалось найти аккаунты"
		})
	}
}

// Обновить аккаунт
export const account_update = async (req,res) => {
	try {
		const accountId = req.params.id;

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

		await userModel.updateOne(
			{
				_id: accountId
			},
			updateFields
		);
	  
		res.status(200).json({
			message:"Аккаунт успешно обновлен"
		})

	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось обновить аккаунт"
		})
	}
}

// Обновить фото для админа
export const photoUpdate = async (req,res) => {
	try {
		const accountId = req.userId;

		await userModel.updateOne(
			{
				_id: accountId
			},
			{
				imageUrl: req.body.imageUrl
			}
		);
	  
		res.status(200).json({
			message:"Фото успешно обновлен"
		})

	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось обновить фото"
		})
	}
}

// Удалить аккаунт
export const remove = async (req,res) =>{
	try{
		const accountId = req.params.id;
		userModel.findOneAndRemove({
			_id: accountId,
			role: { $ne: 'admin' }
		}, (err, doc) =>{
			if (err){
				console.log(err)
				res.status(500).json({
				msg:"Не удалось удалить аккаунт"
				})
			}
			
			if (!doc){
				return res.status(404).json({
					msg:'Аккаунт не найден'
				});
			}

			res.status(200).json({
				msg:"Аккаунт успешно удален"
			})
		});

	} catch (err){
		console.log(err)
		res.status(500).json({
			msg:"Не удалось удалить аккаунт"
		})
	}
}

// Получить пользователя
export const getOne = async (req,res) =>{
	try{
		const userId = req.params.id;

		userModel.findOneAndUpdate({
			_id: userId
		}, 
		{
			returnDocument: 'after',
		},
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
					msg:"Не удалось вернуть пользователя"
				});
			}
			if (!doc){
				return res.status(404).json({
					msg:'Пользователь не найдена'
				});
			}
			res.json(doc)
		});

	} catch (err){
		console.log(err)
		res.status(500).json({
			msg:"Не удалось найти пользователя"
		})
	}
}