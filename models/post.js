import mongoose from 'mongoose';

const schema = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	text: { type: String, required: true },
	name: { type: String },
	avatar: { types: String },
	likes: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
		},
	],
	comments: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
			text: { type: String, required: true },
			name: { type: String },
			avatar: { types: String },
			date: {
				type: Date,
				default: Date.now,
			},
		},
	],
});

const post = mongoose.model('post', schema);

export default post;
