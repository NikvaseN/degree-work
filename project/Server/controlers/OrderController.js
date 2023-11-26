import OrderModel from '../models/order.js';
import crypto from 'crypto'

export const getAll = async (req,res) =>{
	try{
		const orders = await OrderModel.find().exec();
		res.json(orders)
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти заказы"
		})
	}
}

export const getUser = async (req,res) =>{
	try{
		const userId = req.body.user;
		const nonAuthUser = req.body.nonAuthUser;
		let query = {
			user: userId
		};
		if (!userId) {
			query = {
				nonAuthUser: nonAuthUser
			};
		}

		OrderModel.find(query,
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
				message:"Не удалось вернуть заказ"
				});
			}
			if (!doc){
				return res.status(404).json({
					message:'Заказ не найден'
				});
			}
			res.json(doc)
		}).populate('products.product');
		
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти заказ"
		})
	}
}

export const getActive = async (req,res) =>{
	try{

		OrderModel.find({
			$or:[ {'status':'new'}, {'status':'pending'}]
		},
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
				message:"Не удалось вернуть заказ"
				});
			}
			if (!doc){
				return res.status(404).json({
					message:'Заказ не найден'
				});
			}
			res.json(doc)
		}).populate('products.product').populate('user');
		
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти заказ"
		})
	}
}

export const remove = async (req,res) =>{
	try{
		const orderId = req.params.id;
		
		OrderModel.findOneAndRemove({
			_id: orderId,
		}, (err, doc) =>{
			if (err){
				console.log(err)
				res.status(500).json({
				message:"Не удалось удалить заказ"
				})
			}
			
			if (!doc){
				return res.status(404).json({
					message:'Заказ не найден'
				});
			}

			res.json({
				success: true,
			})
		});

	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти заказ"
		})
	}

	
}

export const create = async (req,res) =>{
	try {
		const count = async () => {
			return new Promise(async(res, rej) => {
				const orders = await OrderModel.find()
				if(orders.length >= 1){
					OrderModel.findOne().sort({ number: -1 }).exec(function(err, doc) {
						if (err) {
							res(rej)
						} else {
							res(doc.number + 1)
						}
					})
				}
				else{
					res(1)
				}
				
				}
			)
		}

		const quantity = await count();
		const currentTime = new Date().toISOString();

		const doc = new OrderModel({
			number: quantity,
			user: req.body.user,
			products: req.body.products,
			fullPrice: req.body.fullPrice,
			username: req.body.username,
			phone: req.body.phone,
			city: req.body.city,
			street: req.body.street,
			house: req.body.house,
			apartment: req.body.apartment,
			coordinates: req.body.coordinates,
			methodDelivery: req.body.methodDelivery,
			status: 'new',
			nonAuthUser: req.body.nonAuthUser
		})

		const order = await doc.save()

		OrderModel.findOne({
			_id: doc._id
		},
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
				message:"Не удалось вернуть заказ"
				});
			}
			if (!doc){
				return res.status(404).json({
					message:'Заказ не найден'
				});
			}
			res.json(doc)
		}).populate('products.product').populate('user');
		
		// res.json(order)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать заказ"
		})
	}
}

export const setStatus = async (req,res) =>{
	try {
		const orderId = req.params.id;
		const status = req.body.status;
		await OrderModel.updateOne({
			_id: orderId 
		},
		{
			status: status,
		})
		res.json({
			success: true
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось обновить статью"
		})
	}
}


export const getEnded = async (req,res) =>{
	try {
		const limit = req.body.limit;
		const skip = req.body.skip;
		OrderModel.find({
			$or:[ {'status':'ended'}, {'status':'canceled'}]
		},
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
				message:"Не удалось вернуть заказ"
				});
			}
			if (!doc){
				return res.status(404).json({
					message:'Заказ не найден'
				});
			}
			res.json(doc)
		}).limit(limit).skip(skip).sort({ _id: -1 }).populate('products.product').populate('user');

	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось обновить статью"
		})
	}
}
