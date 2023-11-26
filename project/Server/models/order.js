import mongoose from "mongoose";
const product =  new mongoose.Schema({
	_id: false,
	value: {
		type: Number,
		required: true, 
	},
	product: {
		type : mongoose.Schema.Types.ObjectId, 
		ref: 'Product',
		unique: false,
		required: true,
	},
});
const OrderSchema = new mongoose.Schema({
	number:{
		type: Number,
		unique: true,
		required: true
	},
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: false,
	},
	nonAuthUser: {
		type: String,
		unique: false,
	},
	products: {
		type: [product],
		required: true,
	},
	fullPrice: {
		type: Number,
		default: 0,
	},
	methodDelivery:{
		type: String,
		required: true,
	},
	courier:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: false,
	},
	username:{
		type: String,
		required: true,
	},
	phone:{
		type: Number,
		required: true,
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
	coordinates:{
		type: Array,
	},
	status:{
		type: String,
		required: true,
	},
},{
	timestamps: true,

})
export default mongoose.model('Order', OrderSchema)