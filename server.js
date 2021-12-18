const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
	console.log('Uncaught Exception 🔥 Shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');

//show dotenv info
console.log('show dotenv info: \n' + process.env.NODE_ENV + '\n////');

//declare remote db string with username, password
const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

//connect db
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('db connection status:\nSuccessfully connect to DB\n////');
	});

//declare port for listening
const PORT = process.env.PORT || 8000;

//listen to port
const server = app.listen(PORT, () => {
	console.log(`PORT:\nApp running on port ${PORT}...\n////`);
});

process.on('unhandledRejection', (err) => {
	console.log('Unhandled Rejection 🔥 Shutting down...');
	console.log(err.name, err.message);
	console.log(err); ////
	server.close(() => {
		process.exit(1);
	});
});
