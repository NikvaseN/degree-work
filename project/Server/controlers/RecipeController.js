import RecipeModel from '../models/recipe.js';
import bcrypt from 'bcrypt';

// Предложить рецепт
export const suggest = async (req,res) =>{
	try {
		const doc = new RecipeModel({
			user: req.body.user,
			phone: req.body.phone,
			name: req.body.name,
			composition: req.body.composition,
			method: req.body.method,
		})

		const recipe = await doc.save()
		
		res.json(recipe)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось добавить рецепт"
		})
	}
}
