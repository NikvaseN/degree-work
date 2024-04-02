import RecipeModel from '../models/recipe.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Предложить рецепт
export const suggest = async (req,res) =>{
	try {
		const user = req.userId
		const doc = new RecipeModel({
			user: user,
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

// Создать рецепт
export const create = async (req,res) =>{
	try {
		const user = req.userId

		if(!user){
			res.status(403).json({
				message:"Нет доступа"
			})
		}

		const doc = new RecipeModel({
			user: user,
			name: req.body.name,
			steps: req.body.steps,
			ingredients: req.body.ingredients,
			verified: true
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

// Получить все рецепты
export const show = async (req,res) =>{
	try {		
		res.json(await RecipeModel.find())
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось добавить рецепт"
		})
	}
}

// Получить подтвержденные рецепты
export const verified = async (req,res) =>{
	try {		
		res.json(await RecipeModel.find({'verified': true}))
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось добавить рецепт"
		})
	}
}

// Получить подтвержденные рецепты
export const unverified = async (req,res) =>{
	try {		
		res.json(await RecipeModel.find({'verified': false}))
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось добавить рецепт"
		})
	}
}

// Удалить рецепт
export const remove = async (req,res) =>{
	try {
		const id = req.params.id
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({
			  	message: 'Некорректный тип идентификатора',
			});
		}
		await RecipeModel.findByIdAndDelete(id)
		res.status(200).json({
			message:"Рецепт успешно удален"
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось добавить рецепт"
		})
	}
}

// Редактировать рецепт
export const update = async (req,res) =>{
	try {
		const id = req.params.id
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({
			  	message: 'Некорректный тип идентификатора',
			});
		}
		const recipe = await RecipeModel.findById(id)
		res.status(200).json(recipe)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось добавить рецепт"
		})
	}
}

// Найти рецепт по поиску
export const search = async (req,res) =>{
	try {
		const search = req.body.name;
		await RecipeModel.find({
			// $and: [
				// { verified: true },
				// {
					$or: [
						{ name: { $regex: search, $options: 'i' } },
						{ ingredients: {
							$elemMatch: {
								$elemMatch: { $regex: search, $options: 'i' }
							}
						} }
					]
				// }
			// ]
		}).then(items =>{
			res.json(items)
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти продукт"
		})
	}
}
