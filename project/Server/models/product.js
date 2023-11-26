import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
	// _id:{
	// 	type: mongoose.Schema.Types.ObjectId,
	// },
	name: {
		type: String,
		required: true
	},
	price:{
		type: Number,
		required: true,
		unique: false,
	},
	category:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		unique: false,
	},
	imageUrl: String,
	composition: String,
	
},{
	timestamps: true,

})
export default mongoose.model('Product', ProductSchema)