const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.name = user.name;
		this.url = url;
		this.from = `Shop admin <${process.env.EMAIL_FROM}>`;
	}

	newTransport() {
		if (process.env.NODE_ENV === "production") {
			//create transporter for sendgrid
			return nodemailer.createTransport({
				//service: 'gmail',
				host: "smtp.gmail.com",
				port: 587,
				secure: false, // secure:true for port 465, secure:false for port 587
				auth: {
					user: process.env.GMAIL_USER,
					pass: process.env.GMAIL_PASS,
				},
			});
		}

		//in development
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	//Send the actual email
	async send(template, subject) {
		// 1) render html based
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
			name: this.name,
			url: this.url,
			subject,
		});

		// 2) define the mail options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			text: htmlToText.fromString(html),
			html,
			//html
		};

		// 3) create a transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send("welcome", "Welcome to our shop");
	}

	async sendPasswordReset() {
		await this.send(
			"passwordReset",
			"Your password reset token (valid for only 10 minutes)"
		);
	}

	async sendVerifyEmail() {

		const html = pug.renderFile(`${__dirname}/../views/email/verify.pug`, {
			name: this.name,
			url: this.url,
			subject: "Welcome to our shop",
		});

		const mailOptions = {
			from: this.from,
			to: this.to,
			subject: "Welcome to our shop",
			text: htmlToText.fromString(html),
			html,
			//html
		};
		try {
			await this.newTransport().sendMail(mailOptions);
		} catch(error) {
			console.log(error);
		}
	}
};
