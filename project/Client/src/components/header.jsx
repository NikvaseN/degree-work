import React, {useContext, useRef} from 'react';
import axios from '../axios.js';
import close from '../img/icons/close.png'
import './header.css'
import './normalize.css'
import cart from '../img/icons/cart.png'
import settings from '../img/icons/settings.png'
import {Link} from "react-router-dom";
import {Context} from '../Context.jsx';
import Swal from 'sweetalert2';
import { checkStaffRole } from '../config/roles.js';
import InputMask from 'react-input-mask';

export default function Header() {

	const {quantityCart, setQuantityCart, user, isLoad} = useContext(Context);

	const phoneRef = useRef()
	const fullNameRef = useRef()
	const passwordRef = useRef()

	const setUpCart = async () =>{
		if(JSON.parse(localStorage.getItem ('cart')) !== null){
			let cart = JSON.parse(localStorage.getItem ('cart'))
			let quantity = cart.reduce((acc, obj) => acc + obj.value, 0);
			setQuantityCart(quantity)
		}
		else{
			setQuantityCart(0)
		}
	}

	React.useEffect(() =>{
		setUpCart()
	}, [])

	React.useEffect(() =>{
		isLoad && user && setAuth(true)
	}, [isLoad])

	const onClickLogout = () =>{
		Swal.fire({
			title: 'Выход',
			text: "Вы действительно хотите выйти?",
			icon: 'question',
			showCancelButton: true,
			// reverseButtons: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да',
		}).then(async (res) =>{
			if(res.isConfirmed){
				try{
					window.localStorage.removeItem('token')
					window.location.reload()
					Swal.fire(
						'Успешно!',
						'Вы успешно вышли',
						'success'
					)
				} catch {
					Swal.fire(
						'Ошибка!',
						'Что-то пошло не так',
						'error'
					)
				}
			}
		})	
	}

	const ids = window.location.href;
	const [auth, setAuth] = React.useState(false)
	// const [auth, setAuth] = React.useState(0)
	const [login, setLogin] = React.useState(false)
	const [register, setRegister] = React.useState(false)
	const loginClick = async () => {
		setErrors([])
		closeRegister()
		setLogin(true)
		document.body.style.overflowY = "hidden";
	}
	const closeLogin = async () =>{
		setErrors([])
		setLogin(false);
		document.body.style.overflowY = "visible";
		
	}
	const registerClick = async () => {
		setErrors([])
		closeLogin()
		setRegister(true)
		document.body.style.overflowY = "hidden";
	}
	const closeRegister = async () =>{
		setErrors([])
		setRegister(false);
		document.body.style.overflowY = "visible";
		
	}
	const closePopUp = async() =>{
		setRegister(false);
		setLogin(false);
		setErrors([])
		document.body.style.overflowY = "visible";
	}
	

	const [authAttempt, setAuthAttempt] = React.useState(0)
	const [incorrectLogin, setIncorrectLogin] = React.useState(false)
	const [incorrectRegister, setIncorrectRegister] = React.useState(false)
	const [errors, setErrors] = React.useState([])

	const onLogin = async () => {
		try {
			if(authAttempt > 3){
				Swal.fire('Вы ввели более 5 раз неверный телефон или пароль!', 'Перезапустите страницу!', 'warning')
				return false
			}
			const fields = {
				phone: phoneRef.current.value.replace(/\D/g, ""),
				password: passwordRef.current.value
			}
			await axios.post('/auth/login', fields).then(res =>{
				window.localStorage.setItem('token', res.data.token)
				window.location.reload()
			}).catch(err => {
				setErrors(err.response.data)
				setIncorrectRegister(true)
			})
		} catch (err) {
			console.warn(err);
			setAuthAttempt((attempt) => attempt + 1)
			setIncorrectLogin(true)
		}
		
	}
	const onRegister = async () => {
		try {
			const fields = {
				phone: phoneRef.current.value.replace(/\D/g, ""),
				password: passwordRef.current.value, 
				fullName: fullNameRef.current.value
			}
			await axios.post('/auth/register', fields).then(res =>{
				window.localStorage.setItem('token', res.data.token)
				window.location.reload()
			}).catch(err => {
				setErrors(err.response.data)
				setIncorrectRegister(true)
			})
			
		} catch (err) {
			setIncorrectRegister(true)
			console.warn(err);
		}
		
	}
	const submitInput = (e) =>{
		e.preventDefault();
		if (login) {
			onLogin()
		}
		if (register){
			onRegister()
		}
        return false;
	}

	return (
	<div className='container'>
		{true &&(
		// {auth === 1 || auth === 2 &&(
			<>
			<header>
			<div className="page-links">
				<button onClick={closePopUp} className='header-link'><Link to='/'><h3 className='header-links'>Главная</h3></Link></button>
					<button onClick={closePopUp} className='header-link category cakes'><Link to='/cakes'><h4 className='header-links'>Торты</h4></Link></button>
					<button onClick={closePopUp} className='header-link category candies'><Link to='/candies'><h4 className='header-links'>Конфеты</h4></Link></button>
					<button onClick={closePopUp} className='header-link category ice-cream'><Link to='/ice-cream'><h4 className='header-links'>Мороженое</h4></Link></button>
					<button onClick={closePopUp} className='header-link category desserts'><Link to='/desserts'><h4 className='header-links'>Десерты</h4></Link></button>
			</div>
			<div className="user-links">
			{auth ?(
				<>
				<button onClick={closePopUp}><Link to='/favorites'><h3 className='header-links favorites'>Избранное</h3></Link></button>
				<button onClick={closePopUp}><Link to='/history'><h3 className='header-links'>Заказы</h3></Link></button>
				<button onClick={closePopUp}><Link to='/profile'><h3 className='header-links'>{user.fullName}</h3></Link></button>
				<button onClick={closePopUp}><h3 className='header-links' onClick={onClickLogout}>Выйти</h3></button>
				{(checkStaffRole(user.role)) &&(
					<>
						<Link to='/staff' className='settings-link settings'><img src={settings} alt="" width='40px' height='40px'/></Link>
					</>
				)}
				</>
			):(
				<>
				<button onClick={closePopUp}><Link to='/history'><h3 className='header-links'>Заказы</h3></Link></button>
				<button className="header-links" onClick={loginClick}><h3>Войти</h3></button>
				</>
			)}
			<Link to='/cart'  onClick={closePopUp}>
				<div className="circle">
				<img src={cart} alt="" width='65%' height='65%'/>
				{quantityCart > 0 &&(
					<div className="circle-after">{quantityCart}</div>
				)}
				</div>
			</Link>
			</div>
		</header>
		{login&&(
			<>
			<div className="popup" onClick={closeLogin}/>
			<div className="popup-item">
				<button className='popup-close' onClick={closeLogin}><img src={close} alt="" width='28' height='28'/></button>
				<p className='header-popup__title'>Авторизация</p>
				{(incorrectRegister && errors) &&
				<div className="errors-block">
					{errors && Array.isArray(errors) ?(
						errors?.map((obj, i) => (
							<p key={obj.msg} className='incorrect'>{obj.msg}</p>
						))
					)
					:
					(
						<p className='incorrect'>{errors.msg}</p>
					)
					}
				</div>
				}
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='phone-input' style={{fontSize : 20, marginBottom: 10, marginTop: 30}}><p>Телефон</p></label>
					<InputMask mask="8(999) 999-99-99" class="header-input" type="text" id='phone-input' placeholder="Введите номер телефона" ref={phoneRef}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='password-input' style={{fontSize : 20, marginBottom: 10, marginTop: -40}}><p>Пароль</p></label>
					<input type="password" id='password-input' className='header-input' placeholder="Введите пароль" ref={passwordRef}/>
				</form>
				<button className='btn-login'  style={{marginTop: -20}} onClick={onLogin}>Войти</button>	
				<p className='header-links-black' onClick={registerClick}>Зарегистрироваться</p>
			</div>
			</>
		)	
		}
		{register&&(
			<>
			<div className="popup" onClick={closeRegister}/>
			<div className="popup-item">
				<button className='popup-close' onClick={closeRegister}><img src={close} alt="" width='28' height='28'/></button>
				<p className='header-popup__title'>Регистрация</p>
				{(incorrectRegister && errors) &&
				<div className="errors-block">
					{errors?.map((obj, i) => (
					<p className='incorrect'>{obj.msg}</p>
					))}
				</div>
				}
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='name-input' style={{fontSize : 20, marginBottom: 10, marginTop: 0}}><p>Имя</p></label>
					<input type="text" id='name-input' className='header-input' placeholder='Введитие имя' ref={fullNameRef}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='phone-input' style={{fontSize : 20, marginBottom: 10, marginTop: -50}}><p>Телефон</p></label>
					<InputMask mask="8(999) 999-99-99" class="header-input" type="text" id='phone-input' placeholder="Введите номер телефона" ref={phoneRef}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label htmlFor='password-input' style={{fontSize : 20, marginBottom: 10, marginTop: -50}}><p>Пароль</p></label>
					<input type="password" id='password-input' className='header-input' placeholder='Введите пароль' ref={passwordRef}/>
				</form>
				<button className='btn-login register' onClick={onRegister}>Зарегистрироваться</button>
				<p className='header-links-black' onClick={loginClick}>Войти</p>
			</div>
			</>
		)
		}
		</>
		)}
		
	</div>

	);
  };
