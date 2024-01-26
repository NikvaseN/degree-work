import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: false,
		required: true
	},
	phone: {
		type : String, 
		unique: false,
		minLength: 11,
		maxLength: 11,
	},
	name: {
		type: String,
		required: true,
	},
	composition: {
		type: String,
		required: true
	},
	method: {
		type: String,
		required: true
	},
	verified: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		default: 'new'
	}
},{
	timestamps: true,
})

export default mongoose.model('Recipe', RecipeSchema)
