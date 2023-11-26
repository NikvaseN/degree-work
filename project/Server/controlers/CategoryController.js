import CategoryModel from '../models/category.js';

export const create = async (req,res) =>{
	try {
		const doc = new CategoryModel({
			name: req.body.name,
		})

		const category = await doc.save()
		res.json(category)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать категорию"
		})
	}
}