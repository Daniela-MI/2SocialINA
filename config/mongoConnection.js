import mongoose from 'mongoose';
import config from 'config';

const mongoURI = config.get('mongoURI');
mongoose.set('strictQuery', true);

const connectToDB = async () => {
	try {
		mongoose.connect(mongoURI, { useNewUrlParser: true }, () =>
			console.log('Connection to MongoDB successfull!')
		);
	} catch (error) {
		console.error(error);
	}
};

export default connectToDB;
