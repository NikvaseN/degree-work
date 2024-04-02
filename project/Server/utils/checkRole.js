import userModel from '../models/user.js';

export const checkConfectioner = (req, res, next) => checkRole(req, res, next, 'confectioner')
export const checkCourier = (req, res, next) => checkRole(req, res, next, 'courier')
export const checkModerator = (req, res, next) => checkRole(req, res, next, 'moderator')

export async function checkRole  (req, res, next, role) {
    try{
		const user = await userModel.findById(req.userId);
		if (!user){
			return res.status(404).json({
				message:'Пользователь не найден'
			})
		}
		if(user.role == role || user.role == 'admin'){
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
}

export const checkStaff = async (req,res,next) =>{
    try{
		const user = await userModel.findById(req.userId);
		const roles = [
			'moderator',
			'admin',
			'courier',
			'confectioner',
		]
		if (!user){
			return res.status(404).json({
				message:'Пользователь не найден'
			})
		}

		if(roles.includes(user.role)){
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
}