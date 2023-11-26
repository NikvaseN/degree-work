import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: false,
	},
	product: {
		type : mongoose.Schema.Types.ObjectId, 
		ref: 'Product',
		unique: false,
		required: true
	},
},{
	timestamps: true,

})

export default mongoose.model('Like', LikeSchema)
