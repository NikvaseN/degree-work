import userModel from '../models/user.js';
import orderModel from '../models/order.js';
import jwt from "jsonwebtoken";

export default async (req,res,next) =>{
    try{
		const orderId = req.params.id;
		const order = await orderModel.findById(orderId);

		let userID = req.body.nonAuthUser
		let authorId
		authorId = (order.nonAuthUser).toString()
		if(userID === authorId){
			next()
		}
		else{
			res.status(403).json({
				message:"Нет доступа"
			})
		}
	} catch(err) {
		console.log(err)
		res.status(403).json({
			message:"Нет доступа"
		})
	}
;}