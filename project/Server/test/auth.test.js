import mongoose from "mongoose";
import product from '../models/product.js'
import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../index.js'
// import * as dotenv from 'dotenv-flow';

const expect = chai.expect;
chai.use(chaiHttp);

let token;
const user = {
	fullName: "Name",
	phone: "88005553535",
	password: "12345"
};

describe('Авторизация', () => {

	it('Регистрация аккаунта', (done) => {
		chai.request(server)
			.post('/auth/register')
			.send(user)
			.end((err, res) => {
				expect(res.status).to.be.equal(200);
				expect(res.body).to.be.a('object');
				expect(res.body.error).to.be.equal(null || undefined);   
				// expect(res.body.error).to.be.equal(null || undefined);
				done();
		});
	});

    it('Авторизация', (done) => {
		chai.request(server)
			.post('/auth/login')
			.send({
				"phone": user.phone,
				"password": user.password
			})
			.end((err, res) => {             
				expect(res.status).to.be.equal(200);
				expect(res.body).to.be.a('object');
				expect(res.body.error).to.be.equal(null || undefined);    
				token = res.body.token;   
				done();
		});
	});

    it('Получение пользователя', (done) => {
		chai.request(server)
			.get('/auth/me')
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(200);
				expect(res.body).to.be.a('object');
				expect(res.body.error).to.be.equal(null || undefined);    
				done();
		});
	});
});

describe('Middleware', () => {

	it('Запрос для авторизованных пользователей', (done) => {
		chai.request(server)
			.get('/auth/me')
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(200);
				expect(res.body).to.be.a('object');
				expect(res.body.error).to.be.equal(null || undefined);       
				done();
		});
	});

    it('Ошибка при запросе на защищенный ресус', (done) => {
		chai.request(server)
			.get('/orders/active')
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(403);
				expect(res.body.message).to.be.equal('Нет доступа');
				done();
		});
	});
});