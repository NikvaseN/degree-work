import userModel from '../models/user.js';
import orderModel from '../models/order.js';

export default async (req,res,next) =>{
    try{
		const orderId = req.params.id;
		const order = await orderModel.findById(orderId);

		let user = await userModel.findById(req.userId);

		if (!user){
			return res.status(404).json({
				message:'Пользователь не найден'
			})
		}
		
		let userID = (user._id).toString()

		let authorId = order.user
		authorId = (authorId).toString()


		
		if(userID === authorId){
			next()
		}
		else{
			res.status(500).json({
				message:"Нет доступа"
			})
		}
	} catch(err) {
		console.log(err)
		res.status(500).json({
			message:"Нет доступа"
		})
	}
;}