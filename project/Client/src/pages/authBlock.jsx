import React, { useContext, useRef } from "react";
import axios from "../axios.js";
import '../components/courier.css'
import { Context } from "../Context.jsx";
import InputMask from 'react-input-mask';

export default function AuthBlock() {
	const [errors, setErrors] = React.useState()

	const phoneRef = useRef()
	const passwordRef = useRef()

	const submitInput = (e) =>{
		e.preventDefault();
		login()
	}
	
	const {user, setUser} = useContext(Context);

	const login = async () => {
		try {
			const fields = {
				phone: phoneRef.current.value.replace(/\D/g, ""), 
				password: passwordRef.current.value
			}
			await axios.post('/auth/login', fields).then(res =>{
				window.localStorage.setItem('token', res.data.token)
				setUser(res.data.token)
				window.location.reload()
			}).catch(err => setErrors(err.response.data))
			
		} catch (err) {
			console.warn(err);
		}
		
	}
	return (
		<div className="auth-block">
			<div className="popup-item">
				<p className='header-popup__title'>Авторизация</p>
				{errors &&
				<div className="errors-block">
					{errors[0] ? errors?.map((obj, i) => (
						<p key={obj.msg} className='incorrect'>{obj.msg}</p>
					))
					:
					<p className='incorrect'>{errors.msg}</p>
				}
				</div>
				}
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='phone-input' style={{fontSize : 20, marginBottom: 10, marginTop: 30}}><p>Телефон</p></label>
					<InputMask mask="8(999) 999-99-99" class="header-input" type="text" id="phone-input" placeholder="Введите номер телефона" ref={phoneRef}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='password-input' style={{fontSize : 20, marginBottom: 10, marginTop: -40}}><p>Пароль</p></label>
					<input type="password" id='password-input' className='header-input' placeholder="Введите пароль" ref={passwordRef}/>
				</form>
				<button className='btn-login'  style={{marginTop: -20}} onClick={login}>Войти</button>
			</div>
		</div>
	);
  };
