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

describe('Заказы', () => {

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
    
	it('Ошибка валидации (пустой запрос)', (done) => {
		chai.request(server)
			.post('/orders')
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(400);
				expect(res.body).to.be.a('array');   
				done();
		});
	});
	
	it('Ошибка валидации (без имени)', (done) => {
		chai.request(server)
			.post('/orders')
			.send({
				"phone": user.phone,
				// "username": user.fullName,
				'methodDelivery': 'delivery',
				"products" : [{value: 1, product: '6377987a6359d93c2c7e31ca'}]
			})
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(400);
				expect(res.body).to.be.a('array');
				expect(res.body[0].msg === 'Укажите имя заказчика');
				done();
		});
    });
    
	it('Ошибка валидации (без товаров)', (done) => {
		chai.request(server)
			.post('/orders')
			.send({
				"phone": user.phone,
				"username": user.fullName,
				'methodDelivery': 'delivery',
				// "products" : [{value: 1, product: '6377987a6359d93c2c7e31ca'}]
			})
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(400);
				expect(res.body).to.be.a('array');
				expect(res.body[0].msg === 'Выберите товары');
				done();
		});
    });
    
	it('Ошибка валидации (без способа доставки)', (done) => {
		chai.request(server)
			.post('/orders')
			.send({
				"phone": user.phone,
				"username": user.fullName,
				'methodDelivery': 'delivery',
				// "products" : [{value: 1, product: '6377987a6359d93c2c7e31ca'}]
			})
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(400);
				expect(res.body).to.be.a('array');
				expect(res.body[0].msg === 'Выберите способ доставки');
				done();
		});
    });
    
    it('Ошибка валидации (без номера телефона)', (done) => {
		chai.request(server)
			.post('/orders')
			.send({
				"phone": user.phone,
				"username": user.fullName,
				// 'methodDelivery': 'delivery',
				"products" : [{value: 1, product: '6377987a6359d93c2c7e31ca'}]
			})
			.set('Authorization', `Bearer ${token}`)
			.end((err, res) => {             
				expect(res.status).to.be.equal(400);
				expect(res.body).to.be.a('array');
				expect(res.body[0].msg === 'Укажите номер, не менее 11 символов');
				done();
		});
    });
});