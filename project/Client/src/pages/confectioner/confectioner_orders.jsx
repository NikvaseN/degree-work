import Header from '../../components/header.jsx';
import '../../components/normalize.css'
import '../../components/history.css'
import load from "../../img/icons/load.gif"
import imgUndefined from "../../img/icons/undefined.webp"
import axios from '../../axios.js';
import {Link} from "react-router-dom";
import React, { useEffect, useState, useContext} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import imgRefresh from '../../img/icons/refresh.png'
import { formatDate } from '../../components/functions.jsx';
import { ruRole } from '../../config/roles.js';
import { ruStatus } from '../../config/statuses.js';
import Swal from 'sweetalert2';
import { Toast } from '../../components/swal.js';

// import {useNavigate } from 'react-router-dom';
// import close from '../img/icons/close.png'
export default function Confectioner_orders({user, reloadComponent}) {
	const [pageLoad, setPageLoad] = React.useState(false)
	const navigate = useNavigate()
	const [orders, setOrders] = React.useState([])

	const getData = async () =>{
		await axios.get('/confectioner/orders').then(res =>{
			setOrders(res.data.reverse())
			!pageLoad && setPageLoad(true)
		})
	}

	const audio = new Audio('/sounds/notification.mp3');
	
	const alertSound = () =>{
		audio.play()
	}

	const [socket, setSocket] = React.useState()

	React.useEffect(() =>{
		document.title = "Список заказов"
		getData()
	}, [])

	React.useEffect(()=>{
		const socket = io(import.meta.env.VITE_API_HOST)
		
		// socket.on('update-orders-list', (action, obj) =>{
		// 	alertSound()
		// 	action === 'add' && setOrders(prev => prev.some(item => item._id !== obj._id) && [obj, ...prev]);
		// 	action === 'remove' && setOrders(prev => prev.map(item => item._id === obj ? {...item, status: 'canceled'} : item));
		// })

		socket.on('change-status', () =>{	
			setTimeout(() => getData(), 1000);
		})

		socket.on('connect', () => {
			socket.emit('join-room', 'confectioner');
		});

		setSocket(socket)

		return () =>{
			socket && socket.close()
		}
	}, [])


	React.useEffect(() =>{
		setMain()
	}, [orders])

	const [openItems,setOpenItems] = React.useState([])
	const setOpenedItems = async (index) =>{
		let openItemsT = openItems
		let open = false
		for (let i=0; i < openItems.length; i++){
			if(openItems[i] === index){
				open = true
				openItemsT.splice(i,1);
			}
		}
		if(!open){
			openItemsT[openItemsT.length] = index
		}
		setOpenItems([...openItemsT])
		checkOpenItem()
	}
	const checkOpenItem = (index) =>{
		for (let i=0; i < openItems.length; i++){
			if(openItems[i] === index){
				return true
			}
		}
		return false
	}

	const quantity = (n) =>{
		n = Math.abs(n) % 100; 
		let n1 = n % 10;
		let str = ''
		if(n1 > 1 && n1 < 5){
			str = ' товара'
		}
		else if(n > 10 && n < 20){
			str = ' товаров'
		}
		else if(n1 === 1){
			str = ' товар'
		}
		else{
			str = ' товаров'
		}
		return (n + str)
	}

	const [target, setTarget] = React.useState('accept')

	const changeTarget = async (status, e) =>{
		if(status !== target){
			setOpenItems([])
			let btns = document.getElementsByClassName('favorites-btn')

			setTarget(status)

			for(let i=0; i<btns.length; i++){
				btns[i].classList.remove("focus");
			}
	
			e.target.classList.add("focus");
			
		}
	}

	let main = []
	let icon_status = []
	const checkStatus = (status) =>{
		icon_status = []
		let Class = 'icon_status admin ' + status

		icon_status.push(
			<div className={Class} ></div>
		)
	}

	const checkActive = (status) =>{
		if (status === target){
			return true
		}
		return false
	}
	
	const changeStatus = (e, obj) =>{
		e.stopPropagation();
		if (target === 'accept'){
			changeOrderStatus('cooking', obj)	
		}
		if (target === 'cooking'){
			changeOrderStatus('ready', obj)	
		}
	}

	const changeOrderStatus = async (status, obj) =>{
		let ordersT = orders
		let order
		let room
		let id = obj._id
		let prevStatus = obj.status

		ordersT.find((el, i) => {
			if (el._id === id) {
				ordersT[i].status = status
				order = ordersT[i]
				return true; // stop searching
			}
		});
		if (order.user){
			room = order.user._id
		}
		if (order.nonAuthUser){
			room = order.nonAuthUser
		}
		setOrders([...ordersT])
		const fields = {
			status
		}
		socket.emit('start-change-status', id, prevStatus, status, room)
		if(status === 'cooking'){
			await axios.get(`/confectioner/take/${id}`)
			.then(() => {
				Toast.fire({
					icon: "success",
					title: "Успешно."
				})
			})
			.catch(err =>{
				const msg = err.response.data?.msg
				Toast.fire({
					icon: "error",
					title: msg ? msg : 'Что-то пошло не так.'
				})
			})
		}
		if(status === 'ready'){
			await axios.get(`/confectioner/finish/${id}`)
			.then(() => {
				Toast.fire({
					icon: "success",
					title: "Успешно."
				})
			})
			.catch(err =>{
				const msg = err.response.data?.msg
				Toast.fire({
					icon: "error",
					title: msg ? msg : 'Что-то пошло не так.'
				})
			})
		}
	}

	const setMain = () =>{
		main.push(
			<>
				{(orders).map((obj, index) => (

				checkActive(obj.status) && (
					!checkOpenItem(index) ? (
						<div key={obj._id} className="history-item admin" onClick={() => setOpenedItems(index)}>
							{(target !== 'ended' && obj.status === 'canceled') ?

								<s>№ {obj.number}</s>
								:
								<p>№ {obj.number}</p>
							}
							
							<p style={{width: 130}}>{ruStatus(obj.status)}</p>
							<p>{formatDate(obj.createdAt, 'h:m')}</p>
							{checkStatus(obj.status)}
							{icon_status}
							<p style={{marginLeft:60,marginRight:60 }} className='header-links-black'>{quantity(obj.products.reduce((acc, obj) => acc + obj.value, 0))}</p>
							<p>Итого: <span style={{ marginLeft:18}}>{obj.fullPrice.toLocaleString()} ₽</span></p>
							{obj.status !== 'canceled' ?
									<>
										{/* <div className="repeat admin-cancel">Отменить</div> */}
										<div className="repeat admin-accept _full" onClick={(e) => changeStatus(e, obj)}>{obj.status === 'accept' ? 'Приянть' : obj.status === 'cooking' ? 'Завершить' : obj.status}</div>
										
									</>
									:
									<div className="">Заказ отменен</div>
								
							}
						</div>
					):(
						<div key={obj._id} className="history-item open" onClick={() => setOpenedItems(index)}>
							<div className="history-item-title">
								<p>№ {obj.number}</p>
								{obj.methodDelivery === 'delivery' ? (<><p>Доставка</p><p>{`${obj.street}, д. ${obj.house}, кв. ${obj.apartment}`}</p></>) : (<p>Самовывоз</p>) }
								<p>{formatDate(obj.createdAt, 'h:m')}</p>
								<p>{formatDate(obj.createdAt, 'D-M-Y')}</p>
							</div>
							<div className="hr-medium"></div>
							{(obj.products).map((obj, index) => (
								obj.product ? (
								<div key={obj._id} className="cart-item history">
									<img src={`${import.meta.env.VITE_IMG_URL}${obj.product.imageUrl}`} alt="" width={300} height={220}/>
									<div className="cart-item-text">
										<h2 style={{fontSize : 24, marginTop:15}}>{obj.product.name}</h2>
										<h5 style={{marginBottom : 60, marginTop: 45}}>Состав: <span>{obj.product.composition}</span> </h5>
										<div className="price-box">
											<p><span style={{color: 'grey'}}>{obj.value} x</span> {obj.product.price.toLocaleString()} ₽</p>
											<p>{(obj.value * obj.product.price).toLocaleString()} ₽</p>
										</div>
									</div>
								</div>
								) :
								(
									<div key={obj._id} className="cart-item history">
										<img src={imgUndefined} alt="" width={300} height={220}/>
										<div className="cart-item-text">
											<h2 style={{fontSize : 24, marginTop:15}}>Товар не найден</h2>
											<h5 style={{marginBottom : 60, marginTop: 45}}>Данный товар больше не продаётся</h5>
										</div>
									</div>
								)
								))
							}
							<div className="hr-medium"></div>
								{obj.user?
									<div className="history-item-title">
										<p>ФИО: {obj.user.fullName}</p>
										<p>Телефон: {obj.user.phone}</p>
										{ruRole(obj.user.role)}
									</div>
									:
									<div className="history-item-title">Гость</div>
								}		
							<div className="hr-medium"></div>
							{obj.status === 'delivering' &&
								<>
										{obj.courier &&
											<>
												<div className="history-item-title" style={{marginTop: 30}}>
													<p>Доставляет</p>
													<p>{obj.courier.fullName} {obj.courier?.patronymic}</p>
													<p>{obj.courier.phone}</p>
												</div>
												<div className="hr-medium"></div>
											</>
										}		
								</>
							}
							<div className="price-box">
								<h3>Итого: {obj.fullPrice.toLocaleString()}</h3>
								{target !== 'ended' && obj.status !== 'canceled' &&
									(target === 'new' ? 
										<button className="btn-repeat" onClick={(e) => changeStatus(e, obj)}>Подтвердить</button>
										:
										<button className="btn-repeat">Свернуть</button>
									)
									
								}	
								</div>
							
						</div>
					))
					
				))}
			</>
		)
	}
	setMain ()
	return (
		<div className='container'>
			<div className="empty-header-admin"></div>
			<button className='invert btn-component-refresh' onClick={reloadComponent}>
				<img src={imgRefresh} alt="" width={40} height={40}/>
			</button>
			<p style={{fontSize : 36}}>Заказы</p>
			<div className="hr list-orders"></div>
			<div className="favorites-navbar list">
				<div className="btn-add-cart favorites-btn focus" onClick={(e) => changeTarget('accept', e)}>Новые</div>
				<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('cooking', e)}>Готовятся</div>
			</div>
			{
			user && (user.role === 'confectioner' || user.role === 'admin') ? (
			pageLoad ? 
			(
				!orders?.length ?
				(<>
					<p style={{fontSize : 30, textAlign: 'center'}}>Список заказов пуст<br /></p>
				</>) 
				:
				<>	
					{main}
				</>
			)
			: 
			(
				<img src={load} alt="load" />
			)) :
			(navigate('/404')
			)
			 }
			
		</div>
	);
  };
