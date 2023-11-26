import React from "react";
import axios from "../axios.js";
import { Navigate, useNavigate } from "react-router-dom";
import '../components/courier.css'

export default function AuthBlock() {
	const [phone, setPhone] = React.useState()
	const [password, setPassword] = React.useState()
	const [errors, setErrors] = React.useState()

	const navigate = useNavigate()

	const submitInput = (e) =>{
		e.preventDefault();
		login()
	}

	const login = async () => {
		try {
			const fields = {
				phone, password
			}
			await axios.post('/auth/login', fields).then(res =>{
				window.localStorage.setItem('token', res.data.token)
				navigate(0)
			}).catch(err => setErrors(err.response.data))
			
		} catch (err) {
			console.warn(err);
		}
		
	}
	console.log(errors)
	return (
		<div className="auth-block">
			<div className="popup-item">
				<p className='header-popup__title'>Авторизация</p>
				{errors &&
				<div className="errors-block">
					{errors[0] ? errors?.map((obj, i) => (
					<p className='incorrect'>{obj.msg}</p>
					))
					:
					<p className='incorrect'>{errors.msg}</p>
				}
				</div>
				}
				<form className='cart-form' onSubmit={submitInput}>
					<label for='phone-input' style={{fontSize : 20, marginBottom: 10, marginTop: 30}}><p>Введите номер телефона</p></label>
					<input type="phone" id='phone-input' className='header-input' onChange ={(e) => setPhone(e.target.value)}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label for='password-input' style={{fontSize : 20, marginBottom: 10, marginTop: -40}}><p>Введите пароль</p></label>
					<input type="password" id='password-input' className='header-input' onChange ={(e) => setPassword(e.target.value)}/>
				</form>
				<button className='btn-login'  style={{marginTop: -20}} onClick={login}>Войти</button>
			</div>
		</div>
	);
  };
