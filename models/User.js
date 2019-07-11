const mongoose = require("mongoose"),
	ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const MODALFUNC = require('./model_functions').functions;

var UserSchema = new Schema({

	// Role type to seprate admin and users
	role_type: {
		type: String,
		default: "user"
	},

	// Basic details of user name, email
	full_name: {
		type: String,
		required: true
	},

	email: {
		type: String
	},

	password: {
		type: String,
		select: false
	},

	// flag to define if user is active or not, admin can manage this flag from admin panel
	is_active: {
		type: Boolean,
		default: true
	},

	// reset_token will be sent in reset password email in encryt format and will be used
	// to verify the user
	reset_token: {
		type: String
	},
}, {
	timestamps: {
		createdAt: 'created',
		updatedAt: 'updated'
	},
	id: false,
	toJSON: {
		getters: true,
		virtuals: true
	},
	toObject: {
		getters: true,
		virtuals: true
	}
});


UserSchema.path('created').get(MODALFUNC.string_ts);
UserSchema.path('updated').get(MODALFUNC.string_ts);

//make this available to our users in Node applications
module.exports.User = mongoose.model('User', UserSchema);