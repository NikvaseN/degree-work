import userModel from '../models/user.js';

export default async (req,res,next) =>{
    try{
		const user = await userModel.findById(req.userId);
		if (!user){
			return res.status(404).json({
				message:'Пользователь не найден'
			})
		}
		// const {passwordHash, ...userData} = user._doc;
		if(user.role === 'courier'){
			next()
		}
		else{
			res.status(403).json({
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