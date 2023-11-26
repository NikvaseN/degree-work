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
		required: true
	},
	balance:{
		type: Number,
	},
	imageUrl:{
		type: String,
	},
},{
	timestamps: true,

})
export default mongoose.model('User', UserSchema)