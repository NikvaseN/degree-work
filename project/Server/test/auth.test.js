import mongoose from "mongoose";
import user from '../models/user.js'
import product from '../models/product.js'
import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../index.js'
// import * as dotenv from 'dotenv-flow';

const expect = chai.expect;
chai.use(chaiHttp);

describe('Авторизация', () => {
	let user = {
		fullName: "Name",
		phone: "88005553535",
		password: "12345"
	}
	let userRegisted = false
	let token;

	beforeEach((done) => {
		if(!userRegisted){
			chai.request(server)
				.post('/auth/register')
				.send(user)
				.end((err, res) => {
					expect(res.status).to.be.equal(200);    
					expect(res.body).to.be.a('object');
					expect(res.body.error).to.be.equal(null || undefined);
					
					// Авторизация
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
							userRegisted = true;
							token = res.body.token;
					});
			});
		}
		if(!token && userRegisted){
			// Авторизация
			chai.request(server)
			.post('/auth/login')
			.send({
				"phone": user.phone,
				"password": user.password``
			})
			.end((err, res) => {                    
				expect(res.status).to.be.equal(200);
				expect(res.body).to.be.a('object');
				expect(res.body.error).to.be.equal(null || undefined);       
				token = res.body.token;
			});
		}
		done();
	});

	// Повторная регистрация (первая была в before())
	it('Ошибка при регистрация существующего аккаунта', (done) => {
		chai.request(server)
			.post('/auth/register')
			.send(user)
			.end((err, res) => {
				expect(res.status).to.be.equal(403);    
				expect(res.body).to.be.a('object');
				expect(res.body.msg).to.be.equal('Аккаунт с таким номером телефона уже существует');
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
				done();
		});
	});

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
});