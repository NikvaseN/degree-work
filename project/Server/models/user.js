import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	fullName: {
		type: String,
		required: true
	},
	surname:{
		type: String,
	},
	patronymic:{
		type: String,
	},
	phone:{
		type: String,
		required: true,
		unique:true,
		minLength: 11,
		maxLength: 11,
	},
	city:{
		type: String,
	},
	street:{
		type: String,
	},
	house:{
		type: String,
	},
	apartment:{
		type: String,
	},
	passwordHash:{
		type: String,
		required : true
	},
	birthday:{
		type: Date,
	},
	role:{
		type: String,
		required: true,
		default: 'user'
	},
	balance:{
		type: Number,
		default: 0
	},
	imageUrl:{
		type: String,
	},
},{
	timestamps: true,

})
export default mongoose.model('User', UserSchema)