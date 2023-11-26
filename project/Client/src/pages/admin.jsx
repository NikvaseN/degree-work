import '../components/normalize.css'
import '../components/admin.css'
import '../components/courier.css'
import React, {useRef, useState} from 'react';
import axios from '../axios.js';
import orders from '../img/icons/orders.png'
import imgProducts from '../img/icons/Cheesecake.png'
import support from '../img/icons/support.png'
import home from '../img/icons/home.png'
import imgUser from '../img/icons/user.png'
import arrow from '../img/icons/two-rev-arrow.png'
import settings from '../img/icons/settings.png'
import { useNavigate, Link} from 'react-router-dom';
import default_profile from '../img/icons/default_profile.jpg'
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import plus from '../img/icons/plus.png'

import Admin_section_main from '../components/admin_section_main.jsx'
import Admin_account_create from '../components/admin_account_create.jsx'
import List_orders from './list-orders';
import Admin_products from './admin_products.jsx'
import Item_change from './item_change.jsx'
import Item_add from './item_add.jsx'
import Accounts from './accounts.jsx'
import Support from '../components/admin_support.jsx'

export default function Admin() {
	const [isLoad, setIsLoad] = React.useState(false)
    const [user, setUser] = React.useState('')
    const [socket, setSocket] = React.useState('')
	const navigate = useNavigate()

	const getUser = async () =>{
		try{
			await axios.get('/auth/me').then(res =>{
				setUser(res.data)
				setIsLoad(true)
				cheackRolled()
			})
		}
		catch{
			setUser(false)
			setIsLoad(true)
			cheackRolled()
		}
	}
	const [appeales, setAppeales] = React.useState([])

	React.useEffect(() =>{
		getUser()
		const socket = io(process.env.REACT_APP_API_HOST)

		socket.on('appeales', (arr, id) => {
			console.log(appeales)
			if(!id){
				setAppeales(arr)
			}
			else{
				socket.emit('appeales-get');
			}
		});

		socket.on('connect', () => {
			socket.emit('appeales-get');
			socket.emit('join-room', 'admin');
		});
		
		setSocket(socket)

		return () =>{
			socket && socket.close()
		}
	}, [])

	// Аватар
	const inputFileRef = useRef(null)
	const [imageUrl, setImageUrl] = useState();
	const handleChangeFule = async (event) => {
		try{
			const formData = new FormData();
			const file = event.target.files[0]
			formData.append('image', file);
			const { data } = await axios.post('/uploads', formData); 
			await axios.patch('/admin/photo', {imageUrl: data.url})
			window.location.reload();
		} catch (err) {
			console.warn(err);
			Swal.fire(
				'Ошибка!',
				'Допустимы только файлы типов JPEG, JPG, PNG, GIF',
				'error'
			)
		}
	}

	const [target, setTarget] = React.useState('main')
	const changeTarget = (e, com) =>{
		let btns = document.getElementsByClassName('sidebar-item')
		setTarget(com)
		for(let i=0; i<btns.length; i++){
			btns[i].classList.remove("focus");
		}
		e.target.classList.add("focus");
	}

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
		if(isLoad){
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
			target === 'main' ? (
				<Admin_section_main/>
			):
			target === 'orders' ? (
				<List_orders/>
			):
			target === 'products' ? (
				<Admin_products setTarget={setTarget}/>
			):
			target === 'addProducts' ? (
				<Item_add key={refresh}/>
			): 
			target === 'changeProducts' ? (
				<Item_change setTarget={setTarget} reloadComponent={reloadComponent} key={refresh}/>
			):
			target === 'accounts' ? (
				<Accounts setTargetComponent={setTarget} user={user} reloadComponent={reloadComponent} key={refresh}/>
			):
			target === 'support' ? (
				<Support appeales={appeales} setTargetComponent={setTarget} user={user} reloadComponent={reloadComponent} key={refresh}/>
			):
			target === 'accountsCreate' && (
				<Admin_account_create/>
			)
		)
	)
    return (
            isLoad && (user.role === 'moderator' || user.role === 'admin' ?(
                <div className='container'>
				<div className="lk">
					<div className="sidebar" id='sidebar'>
						<div onClick={() => inputFileRef.current.click()} className="logo-block">
							{user.imageUrl ? 
								<img src={`${process.env.REACT_APP_IMG_URL}${user.imageUrl}`} className='lk-circle'/>
								:
								<img src={default_profile} className='lk-circle'/>
							}
							<input ref={inputFileRef} hidden type="file" id="upload" onChange={handleChangeFule}/>
							<img className="profile-logo" src={plus} alt="" style={ rolled ? {width: 40, height: 40, marginTop: 120} :  {width: 80, height: 80}}/>
							<h3 className="lk-name">{user.fullName}</h3>
						</div>
						{/* <div className="lk-hr"></div> */}
						<div className="sidebar-items-block">
							<div className="sidebar-item focus" onClick={(e) => changeTarget(e, 'main')}>
								<img src={home} alt=""/>
								<p>Главная</p>
							</div>
							<div className="sidebar-item" onClick={(e) => changeTarget(e, 'orders')}>
								<img src={orders} alt=""/>
								<p>Заказы</p>
							</div>
							<div className="sidebar-item" onClick={(e) => changeTarget(e, 'products')}>
								<img src={imgProducts} alt="" style={{filter: 'invert(100%)'}}/>
								<p>Товары</p>
							</div>
							<div className="sidebar-item" onClick={(e) => changeTarget(e, 'accounts')}>
								<img src={imgUser} alt=""/>
								<p>Аккаунты</p>
							</div>
							<div className="sidebar-item" onClick={(e) => changeTarget(e, 'support')}>
								<img src={support} alt=""/>
								<p>Поддержка</p>
								{appeales.length > 0 && 
									<div className="appeales-amount">
										{appeales.length}
									</div>
								}
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
								<button className='header-link category cakes'><Link to='/cakes'><h4 className='header-links'>Торты</h4></Link></button>
								<button className='header-link category candies'><Link to='/candies'><h4 className='header-links'>Конфеты</h4></Link></button>
								<button className='header-link category ice-cream'><Link to='/ice-cream'><h4 className='header-links'>Мороженое</h4></Link></button>
								<button className='header-link category desserts'><Link to='/desserts'><h4 className='header-links'>Десерты</h4></Link></button>
							</div>
							<div className="admin-links">
								<Link to='/admin' className='settings-link settings'><img src={settings} alt="" width='40px' height='40px'/></Link>
							</div>
						</div>
						<div className="lk-section">
							{section}
						</div>
					</div>
					
				</div>
			</div>
		)
		:
		navigate('/')
		)
	);
  };