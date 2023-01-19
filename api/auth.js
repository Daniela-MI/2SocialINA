import express, { response } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/user.js';
import { check, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import UserModel from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

const router = express.Router();

router.get('/', auth, async (request, response) => {
	try {
		const user = await User.findById(request.user.id, 'name email').exec();

		response.json(user);
	} catch (err) {
		response.status(500).send('Server error');
	}
});

router.post(
	'/',
	[
		check('email', 'Please use a valid email').isEmail(),
		check('password', 'Enter the valid password').exists(),
	],
	async (request, response) => {
		const errors = validationResult(request);
		console.log('errors = ', errors);
		const hasErrors = !errors.isEmpty();
		if (hasErrors) {
			return response.status(400).json({ errors: errors.array() });
		}

		const { email, password } = request.body;

		try {
			let user = await User.findOne({ email: email });
			if (!user) {
				return response.status(400).json({ error: "User doesn't exist" });
			}

			const isPasswordValid = await bcrypt.compare(password, user.password);

			if (!isPasswordValid) {
				return response.status(400).json({ error: 'Invalid credentials' });
			}

			const payload = { user: { id: user.id } };

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 36000 },
				(error, token) => {
					if (error) throw error;
					response.json({ token });
				}
			);
		} catch (error) {
			console.log(error);
			response.status(500).send('Server error!');
		}
	}
);

export default router;
