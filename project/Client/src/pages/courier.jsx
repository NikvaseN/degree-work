import React, { useEffect, useState } from 'react'
import axios from '../axios.js'
import '../components/admin.css'
import '../components/courier.css'
import orders from '../img/icons/orders.png'
import history from '../img/icons/order_history.png'
import profile from '../img/icons/courier_profile.png'
import support from '../img/icons/support.png'
import default_profile from '../img/icons/default_profile.jpg'
import home from '../img/icons/home.png'
import AuthBlock from './authBlock.jsx'
import arrow from '../img/icons/two-rev-arrow.png'
import { useNavigate, Link} from 'react-router-dom'
import { io } from 'socket.io-client'
import Orders from '../components/Courier_Orders.jsx'
import History from '../components/courier_history.jsx'
import Profile from '../components/courier_profile.jsx'
import Support from '../components/courier_support.jsx'

export default function Courier() {
	const [isLoad, setIsLoad] = React.useState(false)
	const [user, setUser] = React.useState()
	// const [user, setUser] = React.useState({role : 'courier'})
	const [socket, setSocket] = React.useState()
	const [activeOrder, setActiveOrder] = React.useState([])
	const navigate = useNavigate()

	const start = async() =>{
		document.title = "Личный кабинет"
		await axios.get('/auth/me').then(res =>{
			setUser(res.data)
			const socket = io(process.env.REACT_APP_API_HOST)
			if(res.data.role === 'courier'){
				socket.emit('join-as-courier', res.data)
			}
			setSocket(socket)
			cheackRolled()
		}).catch(() =>{
			setIsLoad(true)
		})

		await axios.get('/courier/working').then(res =>{
			setActiveOrder(res.data)
			setIsLoad(true)
		}).catch(() => {
			setIsLoad(true)
		})

	}

	React.useEffect(() =>{
		start()
		return () =>{
			socket && socket.close(user)
		}
	}, [])

	const [targetComp, setTargetComp] = React.useState('orders')
	const changeTarget = (e, com) =>{
		let btns = document.getElementsByClassName('sidebar-item')
		setTargetComp(com)
		for(let i=0; i<btns.length; i++){
			btns[i].classList.remove("focus");
		}
		e.target.classList.add("focus");
	}

	const onLogout = () =>{
		if(window.confirm('Вы действительно хотите выйти?')){
			window.localStorage.removeItem('token')
			navigate(0)
		}	
	}
	const [mobile, setMobile] =  React.useState()

	React.useEffect(()=>{
		const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
		const lk_body = document.getElementById('lk-body')
		if(lk_body && mobile){
			lk_body.classList.add('mobile')
		}
		setMobile(mobile)
	}, [isLoad])

	// Вызывает перезагрузку компонента
	const [refresh, setRefresh] = React.useState(false);
	const reloadComponent = () => {
		setRefresh(prevRefresh => !prevRefresh);
	};

	// Свернуть (развернуть) sidebar
	const cheackRolled = () =>{	
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
		if(isLoad && !mobile){
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
	}, [rolled])
	/// Свернуть (развернуть) sidebar

	let section = []
	section.push(
		isLoad && (
			targetComp === 'orders' ? (
					<Orders key={refresh} rolled={rolled} mobile={mobile} reloadComponent={reloadComponent}/>
			):
			targetComp === 'history' ? (
					<History key={refresh} rolled={rolled} mobile={mobile} reloadComponent={reloadComponent}/>
			):
			targetComp === 'profile' ? (
					<Profile key={refresh} user={user} rolled={rolled} mobile={mobile} reloadComponent={reloadComponent}/>
			):
			targetComp === 'support' && (
					<Support key={refresh} user={user} rolled={rolled} mobile={mobile} reloadComponent={reloadComponent}/>
			)
		)
	)
	return(
		isLoad &&(
		(user && (user.role === 'courier' || user.role === 'admin'))? (
		// Основной блок

		!mobile ?
		// Блок для пк
		<div className='container'>
			<div className="lk">
				<div className="sidebar" id="sidebar">
					<div className="logo-block">
						{user.imageUrl ? 
						<img src={`${process.env.REACT_APP_IMG_URL}${user.imageUrl}`}/>:
						<img src={default_profile} className='lk-circle'/>
						}
						
						<h3 className="lk-name">{user.name ? user.name : (user.fullName && user.fullName)}</h3>
					</div>
					{/* <div className="lk-hr"></div> */}
					<div className="sidebar-items-block">
						<div className="sidebar-item focus" onClick={(e) => changeTarget(e, 'orders')}>
							<img src={home} alt=""/>
							<p>Главная</p>
						</div>
						<div className="sidebar-item" onClick={(e) => changeTarget(e, 'history')}>
							<img src={history} alt=""/>
							<p>История</p>
						</div>
						<div className="sidebar-item" onClick={(e) => changeTarget(e, 'profile')}>
							<img src={profile} alt=""/>
							<p>Профиль</p>
						</div>
						<div className="sidebar-item" onClick={(e) => changeTarget(e, 'support')}>
							<img src={support} alt=""/>
							<p>Поддержка</p>
						</div>
						<div className="sidebar-item" onClick={roll} style={{marginTop: 40}}>
							<img src={arrow} alt=""/>
							<p>Свернуть</p>
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
						{section}
					</div>
				</div>
			</div>
		</div>
		:
		// Блок для мобильных устройств
		<>
		<div className="botton-menu">
			<div className="sidebar-item  focus" onClick={(e) => changeTarget(e, 'main')}>
				<img src={home} alt=""/>
				Главная
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'history')}>
				<img src={history} alt=""/>
				История
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'orders')}>
				<img src={orders} alt=""/>
				Заказы
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'profile')}>
				<img src={profile} alt=""/>
				Профиль
			</div>
			<div className="sidebar-item" onClick={(e) => changeTarget(e, 'support')}>
				<img src={support} alt=""/>
				Поддержка
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