import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
	_id:{
		type: mongoose.Schema.Types.ObjectId,
	},
	name: {
		type: String,
		required: true
	}
},{
	timestamps: true,

})
export default mongoose.model('Category', CategorySchema)
