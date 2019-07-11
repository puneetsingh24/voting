const mongoose = require("mongoose"),
	ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

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

	is_active: {
		type: Boolean,
		default: true
	},

	// flag to check if user voted or not
	is_voted: {
		type: Boolean,
		default: false
	},

	// reset_token will be sent in reset password email in encryt format and will be used
	// to verify the user
	reset_token: {
		type: String
	}
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

//make this available to our users in Node applications
module.exports.User = mongoose.model('User', UserSchema);