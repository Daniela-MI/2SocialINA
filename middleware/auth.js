import jwt from 'jsonwebtoken';
import config from 'config';

const auth = (request, response, next) => {
	const token = request.header('x-auth-token');

	if (!token) {
		return response.status(401).json({ msg: 'No toke, authorization denied' });
	}

	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));
		request.user = decoded.user;
		console.log(request.user);
		next();
	} catch (error) {
		response.status(401).json({ msg: 'Invalid token!' });
	}
};

export default auth;
