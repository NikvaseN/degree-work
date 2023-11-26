import LikeModel from '../models/like.js';

export const getAll = async (req,res) =>{
	try{
		const orders = await LikeModel.find().exec();
		res.json(orders)
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти избранное"
		})
	}
}

export const getUser = async (req,res) =>{
	try{

		LikeModel.find({
			user: req.userId,
		},
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
				message:"Не удалось вернуть избранное"
				});
			}
			if (!doc){
				return res.status(404).json({
					message:'Избранное не найдено'
				});
			}
			res.json(doc)
		}).populate('product');
		
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти избранное"
		})
	}
}

const remove = async (req,res) =>{
	try{

		LikeModel.findOneAndRemove({
			user: req.userId,
			product: req.body.product,
		}, (err, doc) =>{
			if (err){
				console.log(err)
				res.status(500).json({
				message:"Не удалось удалить избранное"
				})
			}
			
			if (!doc){
				return res.status(404).json({
					message:'Избранное не найдено'
				});
			}

			res.json({
				success: true,
			})
		});

	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти избранное"
		})
	}
}

const create = async (req,res) =>{
	try {
		const doc = new LikeModel({
			user: req.userId,
			product: req.body.product,
		})
		const like = await doc.save()
		res.json(doc)

	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать избранное"
		})
	}
}

export const change = async (req,res) =>{
	try {
		LikeModel.findOne({ user: req.userId, product: req.body.product }, (err, like) => {
			if (like) {
			  remove(req,res);
			} else {
			  create(req,res);
			}
		  });
		  
		  
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать или удалить избранное"
		})
	}
}
