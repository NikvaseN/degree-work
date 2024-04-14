import React, { useEffect, useState, useContext } from 'react'
import axios from '../../axios.js'
import '../../components/admin.css'
import '../../components/courier.css'
import orders from '../../img/icons/orders.png'
import support from '../../img/icons/support.png'
import default_profile from '../../img/icons/default_profile.jpg'
import AuthBlock from '../authBlock.jsx'
import arrow from '../../img/icons/two-rev-arrow.png'
import { Link} from 'react-router-dom'
// import { io } from 'socket.io-client'
import History from '../../components/staff_history.jsx'
import Profile from '../../components/staff_profile.jsx'
import Support from '../../components/staff_support.jsx'
import Swal from 'sweetalert2'
import { Context } from '../../Context.jsx'
import { checkStaffRole } from '../../config/roles.js'
import imgProducts from '../../img/icons/Cheesecake.png'
import '../../styles/checkbox.css'
import './confectioner.css'
import { Toast } from '../../components/swal.js'
import imgUser from '../../img/icons/user.png'
import Confectioner_orders from './confectioner_orders.jsx'
import Recipes_create from './confectioner_recipes_create.jsx'
import Recipes from './confectioner_recipes.jsx'

export default function Confectioner() {
	const [pageIsLoad, setPageIsLoad] = React.useState(false)
	const [socket, setSocket] = React.useState()
	const [activeOrder, setActiveOrder] = React.useState([])
	const [isSecureMode, setIsSecureMode] = React.useState(true)
	const [secureChecked, setSecureChecked] = React.useState(false)
	const [user, setUser] = useState()
	const [secureUser, setSecureUser] = useState()

	const start = async() =>{
		try{
			await axios.get('/staff/access').then(res =>{
				setUser(res.data)
				setSecureUser(res.data)
				setPageIsLoad(true)
				checkRolled()
			})
		}
		catch{
			setUser(false)
			setPageIsLoad(true)
			checkRolled()
		}
	}

	React.useEffect(() =>{
		start()
		// return () =>{
		// 	socket && socket.close(user)
		// }
	}, [])

	const [targetComp, setTargetComp] = React.useState('orders')

	const changeTarget = (e, com) => {
		let btns = document.getElementsByClassName('sidebar-item');
		setTargetComp(com);
		for (let i = 0; i < btns.length; i++) {
			btns[i].classList.remove("focus");
		}
		e.classList.add("focus");
	};

	const onLogout = () =>{
		Swal.fire({
			title: 'Выход',
			text: "Вы действительно хотите выйти?",
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да',
		}).then(async (res) =>{
			if(res.isConfirmed){
				try{
					window.localStorage.removeItem('token')
					window.location.reload()
					Swal.fire('Успешно!','Вы успешно вышли','success')
				} catch {
					Swal.fire('Ошибка!','Что-то пошло не так','error'
				)
				}
			}
		})		
	}
	const [mobile, setMobile] =  React.useState()

	React.useEffect(()=>{
		const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
		const lk_body = document.getElementById('lk-body')
		if(lk_body && mobile){
			lk_body.classList.add('mobile')
		}
		setMobile(mobile)
	}, [pageIsLoad])

	// Вызывает перезагрузку компонента
	const [refresh, setRefresh] = React.useState(false);
	const reloadComponent = () => {
		setRefresh(prevRefresh => !prevRefresh);
	};

	// Свернуть (развернуть) sidebar
	const checkRolled = () =>{	
		if (JSON.parse(window.localStorage.getItem('roll')) === true){
			setRolled(true)
		}
	}
	const [rolled, setRolled] = React.useState(false)
	const roll = () =>{
		if(rolled){
			setRolled(false)
		}
		else{
			setRolled(true)
		}
	}

	React.useEffect(()=>{
		if(pageIsLoad && user && !mobile){
			const sidebar = document.getElementById('sidebar')
			const lk_body = document.getElementById('lk-body')
			if(rolled){
				sidebar.classList.add('rolled')
				lk_body.classList.add('rolled')
				window.localStorage.setItem('roll', true)
			}
			else{
				sidebar.classList.remove('rolled')
				lk_body.classList.remove('rolled')
				window.localStorage.setItem('roll', false)
			}
		}
	}, [rolled, pageIsLoad])

	/// Свернуть (развернуть) sidebar

	const handleToggleSecureMode = async (e) => {
		// setIsSecureMode(!isSecureMode)
		setSecureChecked(!secureChecked)
		if(!secureChecked){
			const { value: formValues } = await Swal.fire({
				title: 'Введите свой пароль',
				html:
				//   '<label for="swal-password" style="margin: 0px 15px">Пароль</label>' +
				  `<input id="swal-password" type="password" class="swal2-input"> <br>`,
				focusConfirm: false,
				preConfirm: () => {
					return {
						password: document.getElementById('swal-password').value,
					}
				}
			})
			
			if(!formValues){
				setSecureChecked(false)
				return
			}

			const password = formValues.password
			
			await axios.post('/staff/auth', {password}).then((res) =>{
				setUser(res.data)
				setIsSecureMode(false)
			}).catch((err) =>{
				setSecureChecked(false)
				const msg = err.response.data?.msg
				Toast.fire({
					icon: "error",
					title: msg ? msg : "Что-то пошло не так."
				})
			})
		}
		else{
			setIsSecureMode(true)
			setUser(secureUser)
			setTargetComp('orders')
		}
		
	}

	const handleChangeFocus = (e, name) =>{
		const targetBlock = e.currentTarget;
    	changeTarget(targetBlock, name);
	}
	
	return(
		pageIsLoad &&(
		(user && (user.role === 'confectioner' || user.role === 'admin'))? (
		// Основной блок

		!mobile ?
		// Блок для пк
		<div className='container'>
			<div className="lk">
				<div className="sidebar" id="sidebar">
					<div className="logo-block" style={{marginTop: 50}}>
						{user.imageUrl ? 
							<img src={`${import.meta.env.VITE_IMG_URL}${user.imageUrl}`}/>:
							<img src={default_profile} className='lk-circle'/>
						}
						<h3 className="lk-name">{user.name ? user.name : (user.fullName && user.fullName)}</h3>
					</div>
					{/* <div className="lk-hr"></div> */}
					<div className="sidebar-items-block" style={{marginTop: isSecureMode ? 50 : 0}}>
						{/* <div className="sidebar-item focus" onClick={(e) => changeTarget(e, 'orders')}>
							<img src={home} alt=""/>
							<p>Главная</p>
						</div> */}
						<div className="sidebar-item focus" onClick={(e) => handleChangeFocus(e, 'orders')}>
							<img src={orders} alt=""/>
							<p>Заказы</p>
						</div>
						<div className="sidebar-item" onClick={(e) => handleChangeFocus(e, 'recipes')}>
							<img src={imgProducts} alt="" style={{filter: 'invert(100%)'}}/>
							<p>Рецепты</p>
						</div>
						{!isSecureMode &&
							<>
								<div className="sidebar-item" onClick={(e) => handleChangeFocus(e, 'profile')}>
									<img src={imgUser} alt=""/>
									<p>Профиль</p>
								</div>
								<div className="sidebar-item" onClick={(e) => handleChangeFocus(e, 'support')}>
									<img src={support} alt=""/>
									<p>Поддержка</p>
								</div>
							</>
						}
						
						<div className="sidebar-item" onClick={roll} style={{marginTop: isSecureMode ? 60 : 40}}>
							<img src={arrow} alt=""/>
							<p>Свернуть</p>
						</div>

						<div className='toggle-checkbox-block' style={{marginTop: isSecureMode ? 60 : 30}}>
							<p>Личный режим</p>
							<input type="checkbox" className='toggle-checkbox' id="toggleSecureMode" checked={secureChecked} onChange={handleToggleSecureMode}/>
						</div>

					</div>
					{/* <div className="sidebar-footer">© Candy Store</div> */}
				</div>

				<div className="lk-body" id='lk-body'>
					<div className="header-admin">
						<div className="header-admin-navbar">
							<button className='header-link'><Link to='/'><h3 className='header-links'>Главная</h3></Link></button>
						</div>
						<div className="header-admin-title" style={{fontSize: 20}}>Candy Store</div>
						<div className="admin-links">
							<button><h3 className='header-links' onClick={onLogout}>Выйти</h3></button>
						</div>
					</div>
					<div className="lk-section">
						{pageIsLoad && (
							targetComp === 'orders' ? (
								<Confectioner_orders user={user}  key={refresh} mobile={mobile} reloadComponent={reloadComponent}/>
							):
							targetComp === 'recipes' ? (
								<Recipes key={refresh} setTargetComp={setTargetComp} user={user} mobile={mobile} reloadComponent={reloadComponent}/>
							):
							targetComp === 'recipes_create' ? (
								<Recipes_create key={refresh} goBack={() => setTargetComp('recipes')} user={user} mobile={mobile} reloadComponent={reloadComponent}/>
							):
							targetComp === 'profile' ? (
								<Profile key={refresh} user={user} mobile={mobile} reloadComponent={reloadComponent}/>
							):
							targetComp === 'support' && (
								<Support key={refresh} user={user} mobile={mobile} reloadComponent={reloadComponent}/>
							)
						)}
					</div>
				</div>
			</div>
		</div>
		:
		// Блок для мобильных устройств
		<>
		<div className="botton-menu">
			<div className="sidebar-item focus" onClick={(e) => changeTarget(e, 'orders')}>
				<img src={orders} alt=""/>
				<p>Заказы</p>
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'products')}>
				<img src={imgProducts} alt="" style={{filter: 'invert(100%)'}}/>
				<p>Рецепты</p>
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'profile')}>
				<img src={imgUser} alt=""/>
				<p>Профиль</p>
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'support')}>
				<img src={support} alt=""/>
				<p>Поддержка</p>
			</div>
		</div>
		<div className="lk-body" id='lk-body'>
			{/* <div className="header-admin">
				<div className="header-admin-navbar">
					<button className='header-link'><Link to='/'><h3 className='header-links'>Главная</h3></Link></button>
				</div>
				<div className="header-admin-title" style={{fontSize: 20}}>Candy Store</div>
				<div className="admin-links">
					<button><h3 className='header-links' onClick={onLogout}>Выйти</h3></button>
				</div>
			</div> */}
			<div className="lk-section">
				{section}
			</div>
		</div>
		</>
		)
		:
		(<AuthBlock/>)
		)
		
	)
}