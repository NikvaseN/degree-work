import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: false,
		required: true
	},
	canCall: {
		type: Boolean,
		default: true,
	},
	name: {
		type: String,
		required: true,
	},
	composition: {
		type: String,
	},
	method: {
		type: String,
	},
	steps: {
		type: [String],
	},
	ingredients : {
		// [['Название', 'кол-во'=]]
		type: [
            [{
                type: String,
                required: true
            }, {
                type: String,
                required: true
            }]
        ],
	},
	time: {
		type: String,
	},
	verified: {
		type: Boolean,
		default: false
	}
},{
	timestamps: true,
})

export default mongoose.model('Recipe', RecipeSchema)
