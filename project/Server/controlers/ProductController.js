import ProductModel from '../models/product.js';

export const getAll = async (req,res) =>{
	try{
		const products = await ProductModel.find().populate('category').exec();
		res.json(products)
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти продукт"
		})
	}
}

export const getCategory = async (req,res) =>{
	try{
		const categoryId = req.params.id;

		ProductModel.find({
			category: categoryId,
		},
		(err,doc) =>{
			if (err){
				console.log(err)
				return res.status(500).json({
				message:"Не удалось вернуть продукт"
				});
			}
			if (!doc){
				return res.status(404).json({
					message:'Продукт не найден'
				});
			}
			res.json(doc)
		}).populate('category');
		
	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти продукт"
		})
	}
}

export const remove = async (req,res) =>{
	try{
		const productId = req.params.id;
		
		ProductModel.findOneAndRemove({
			_id: productId,
		}, (err, doc) =>{
			if (err){
				console.log(err)
				res.status(500).json({
				message:"Не удалось удалить продукт"
				})
			}
			
			if (!doc){
				return res.status(404).json({
					message:'Продукт не найдена'
				});
			}

			res.json({
				success: true,
			})
		});

	} catch (err){
		console.log(err)
		res.status(500).json({
			message:"Не удалось найти продукт"
		})
	}
}

export const create = async (req,res) =>{
	try {
		const doc = new ProductModel({
			name: req.body.name,
			price: req.body.price,
			imageUrl:req.body.imageUrl,
			category: req.body.category,
			composition: req.body.composition,
		})

		const product = await doc.save()
		res.json(product)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось создать продукт"
		})
	}
}

export const update = async (req,res) =>{
	try {
		const productId = req.params.id;
		await ProductModel.updateOne({
			_id: productId
		},
		{
			name: req.body.name,
			price: req.body.price,
			imageUrl:req.body.imageUrl,
			category: req.body.category,
			composition: req.body.composition,
		})
		res.json({
			success: true
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message:"Не удалось обновить продукт"
		})
	}
}

export const search = async (req,res) =>{
	try {
		const search = req.body.name;
		await ProductModel.find({
			$or:[
				{ name: { $regex: search, $options: 'i' } },
				{ composition: { $regex: search, $options: 'i' } }
			]
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