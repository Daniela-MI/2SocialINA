import express from 'express';
import { check, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import UserModel from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

const router = express.Router();

// create application/json parser
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', (request, response) => response.send('Test Users Route'));
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please use a valid email').isEmail(),
		check(
			'password',
			'The password must contain at least 6 characters'
		).isLength({ min: 6 }),
	],
	jsonParser,
	async (request, response) => {
		console.log(request.body);

		const { name, email, password } = request.body;

		try {
			// check if user already exists
			let user = await UserModel.findOne({ email: email });
			if (user) {
				return response.status(400).json({ error: 'User Already exists' });
			}

			const salt = (await bcrypt.genSalt(10)).toString();
			user = new UserModel({ name, email, password });
			user.password = await bcrypt.hash(password, salt);

			console.log('User.password = ', user.password, 'salt = ', salt);

			const errors = validationResult(request);
			console.log('errors = ', errors);
			const hasErrors = !errors.isEmpty();
			if (hasErrors) {
				return response.status(400).json({ errors: errors.array() });
			}

			await user.save();

			const payload = {
				user: { id: user.id, role: 'admin' },
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 36000 },
				(err, token) => {
					console.log('TOKEN');
					if (err) throw err;
					response.json({ token });
				}
			);
		} catch (error) {
			console.error(error);
			response.status(500).send('Server error');
		}
	}
);

export default router;
