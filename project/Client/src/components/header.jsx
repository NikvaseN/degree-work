import React, {useContext} from 'react';
import axios from '../axios.js';
import close from '../img/icons/close.png'
import {useNavigate} from "react-router-dom";
import './header.css'
import './normalize.css'
import cart from '../img/icons/cart.png'
import settings from '../img/icons/settings.png'
import {Link} from "react-router-dom";
import {Context} from '../context.js';
export default function Header() {
	const [user, setUser] = React.useState('')
	const setUp = async () =>{
		
		
		if(JSON.parse(localStorage.getItem ('cart')) !== null){
			let cart = JSON.parse(localStorage.getItem ('cart'))
			let quantity = cart.reduce((acc, obj) => acc + obj.value, 0);
			setQuantityCart(quantity)
		}
		else{
			setQuantityCart(0)
		}

		await axios.get('/auth/me').then(res =>{
			setUser(res.data)
			setAuth(true)
		})
	}

	React.useEffect(() =>{
		setUp()
	}, [])

	const onClickLogout = () =>{
		if(window.confirm('Вы действительно хотите выйти?')){
			// dispatch(logout())
			window.localStorage.removeItem('token')
			navigate(0)
		}	
	}

	const [cartEmpty, setCartEmpty] = React.useState(true)

	const {quantityCart, setQuantityCart} = useContext(Context);


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
	const [phone, setPhone] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [fullName, setfullName] = React.useState('')
	const [errors, setErrors] = React.useState([])
	const navigate = useNavigate()

	const onLogin = async () => {
		try {
			if(authAttempt > 3){
				alert('Вы ввели более 5 раз неверный телефон или пароль!\n\nПерезапустите страницу!')
				return false
			}
			const fields = {
				phone, password
			}
			await axios.post('/auth/login', fields).then(res =>{
				window.localStorage.setItem('token', res.data.token)
				navigate(0)
			}).catch(err => setErrors(err.response.data)).then(setIncorrectRegister(true))
			
		} catch (err) {
			console.warn(err);
			setAuthAttempt((attempt) => attempt + 1)
			setIncorrectLogin(true)
		}
		
	}
	const onRegister = async () => {
		try {
			const fields = {
				phone, password, fullName
			}
			await axios.post('/auth/register', fields).then(res =>{
				window.localStorage.setItem('token', res.data.token)
				navigate(0)
			}).catch(err => setErrors(err.response.data)).then(setIncorrectRegister(true))
			
		} catch (err) {
			setIncorrectRegister(true)
			console.warn(err);
		}
		
	}
	console.log('errors', errors)
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
	<container>
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
				<button onClick={closePopUp}><Link to='/history'><h3 className='header-links'>{user.fullName}</h3></Link></button>
				<button onClick={closePopUp}><h3 className='header-links' onClick={onClickLogout}>Выйти</h3></button>
				{(user.role === 'moderator' || user.role === 'admin') &&(
					<>
						<Link to='/admin' className='settings-link settings'><img src={settings} alt="" width='40px' height='40px'/></Link>
					</>
				)}
				{(user.role === 'courier') &&(
					<>
						<Link to='/courier' className='settings-link settings'><img src={settings} alt="" width='40px' height='40px'/></Link>
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
				{/* {!cartEmpty &&( */}
				<div className="circle-after">{quantityCart}</div>
				{/* )} */}
				</div>
			</Link>
			</div>
		</header>
		{login&&(
			<>
			<div className="popup" onClick={closeLogin}>
				
			</div>
			<div className="popup-item">
				<button className='popup-close' onClick={closeLogin}><img src={close} alt="" width='28' height='28'/></button>
				<p className='header-popup__title'>Авторизация</p>
				{(incorrectRegister && errors) &&
				<div className="errors-block">
					{errors.length > 1 ?(
						errors?.map((obj, i) => (
						<p className='incorrect'>{obj.msg}</p>
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
					<label for='phone-input' style={{fontSize : 20, marginBottom: 10, marginTop: 30}}><p>Введите номер телефона</p></label>
					<input type="phone" id='phone-input' className='header-input' onChange ={(e) => setPhone(e.target.value)}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label for='password-input' style={{fontSize : 20, marginBottom: 10, marginTop: -40}}><p>Введите пароль</p></label>
					<input type="password" id='password-input' className='header-input' onChange ={(e) => setPassword(e.target.value)}/>
				</form>
				<button className='btn-login'  style={{marginTop: -20}} onClick={onLogin}>Войти</button>	
				<p className='header-links-black' onClick={registerClick}>Зарегистрироваться</p>
			</div>
			</>
		)	
		}
		{register&&(
			<>
			<div className="popup" onClick={closeRegister}>
				
			</div>
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
					<label for='name-input' style={{fontSize : 20, marginBottom: 10, marginTop: 0}}><p>Введите имя</p></label>
					<input type="text" id='name-input' className='header-input' onChange ={(e) => setfullName(e.target.value)}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label for='phone-input' style={{fontSize : 20, marginBottom: 10, marginTop: -50}}><p>Введите номер телефона</p></label>
					<input type="phone" id='phone-input' className='header-input' onChange ={(e) => setPhone(e.target.value)}/>
				</form>
				<form className='cart-form' onSubmit={submitInput}>
					<label for='password-input' style={{fontSize : 20, marginBottom: 10, marginTop: -50}}><p>Введите пароль</p></label>
					<input type="password" id='password-input' className='header-input' onChange ={(e) => setPassword(e.target.value)}/>
				</form>
				<button className='btn-login register' onClick={onRegister}>Зарегистрироваться</button>
				<p className='header-links-black' onClick={loginClick}>Войти</p>
			</div>
			</>
		)
		}
		</>
		)}
		
	</container>

	);
  };
