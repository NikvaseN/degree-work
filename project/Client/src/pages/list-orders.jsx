import Header from '../components/header.jsx';
import '../components/normalize.css'
import '../components/history.css'
import load from "../img/icons/load.gif"
import imgUndefined from "../img/icons/undefined.webp"
import axios from '../axios.js';
import {Link} from "react-router-dom";
import React, { useEffect, useState, useContext} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Context } from '../Context.jsx';
import imgRefresh from '../img/icons/refresh.png'
import { formatDate } from '../components/functions.jsx';
import { ruRole } from '../config/roles.js';
import { ruStatus } from '../config/statuses.js';
import Swal from 'sweetalert2';

// import {useNavigate } from 'react-router-dom';
// import close from '../img/icons/close.png'
export default function List_orders({reloadComponent}) {
	const [pageLoad, setPageLoad] = React.useState(false)
	const navigate = useNavigate()
	const [orders, setOrders] = React.useState([])
	const {user} = useContext(Context);

	const getData = async () =>{
		await axios.get('/orders/active').then(res =>{
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
		alert()
		getData()
	}, [])

	React.useEffect(()=>{
		return () =>{
			socket && socket.close()
		}
	}, [socket])

	const alert = () =>{
		let socket = io(import.meta.env.VITE_API_HOST)
		
		// const socket = io(import.meta.env.VITE_API_HOST)
		socket.on('update-orders-list', (action, obj) =>{
			alertSound()
			action === 'add' && setOrders(prev => prev.some(item => item._id !== obj._id) && [obj, ...prev]);
			action === 'remove' && setOrders(prev => prev.map(item => item._id === obj ? {...item, status: 'canceled'} : item));
		})

		socket.on('change-status', () =>{	
			setTimeout(() => getData(), 1000);
		})

		socket.on('connect', () => {
			socket.emit('join-room', 'admin');
		});

		setSocket(socket)
	}

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

	const [target, setTarget] = React.useState('new')

	// Бесконечная прокрутка
	const [skip, setSkip] = React.useState(0)

	let limit = 5

	const getEndedOrders = async (skip) =>{
		let fields = {
			limit, skip
		}
		setPageLoad(false)
		await axios.post('/orders/ended', fields).then(res =>{
			if (skip !== 0){
				setOrders((prevData) => [...prevData, ...res.data]);
			}
			else{
				setOrders([...res.data])
			}
			setPageLoad(true)
		}).catch(() => setPageLoad(true))
	}

	const addEndedOrders = () =>{
		setSkip((e) => e + limit)
		getEndedOrders(skip + limit)
	}

	//

	const changeTarget = async (status, e) =>{
		if(status !== target){
			setOpenItems([])
			let btns = document.getElementsByClassName('favorites-btn')

			setTarget(status)

			for(let i=0; i<btns.length; i++){
				btns[i].classList.remove("focus");
			}
	
			e.target.classList.add("focus");
			
			if(status === 'ended'){
				getEndedOrders(0)
			}
			
			if(target === 'ended'){
				setPageLoad(false)
				await axios.get('/orders/active').then(res =>{
					setOrders(res.data.reverse())
					setPageLoad(true)
				})
				.catch(() => setPageLoad(true))
			}	
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
		if(target === 'ended'){
			if (status === target || status === 'canceled'){
				return true
			}
		}
		if(target === 'new'){
			if (status === target || status === 'canceled'){
				return true
			}
		}
		if (status === target){
			return true
		}
		if(target === 'active'){
			if(status !== 'new' && status !== 'ended' && status !== 'canceld'){
				return true
			}
		}
		return false
	}
	
	const changeStatus = (e, obj) =>{
		e.stopPropagation();
		if (target === 'new'){
			changeOrderStatus('accept', obj)	
		}
		// if(target === 'accept'){
		// 	setEnded(obj);
		// }
	}

	const setCancel = async (e, obj) =>{
		e.stopPropagation();
		Swal.fire({
			title: 'Отменить',
			text: "Вы хотите отменить заказ ?",
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да'
		}).then(async (res) => {
			if (res.isConfirmed) {
				changeOrderStatus('canceled', obj)
			}
		})
	}

	const setEnded = async (e, obj) =>{
		e.stopPropagation();
		Swal.fire({
			title: 'Завершить',
			text: "Вы хотите завершить заказ ?",
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да'
		}).then(async (res) => {
			if (res.isConfirmed) {
				changeOrderStatus('ended', obj)
			}
		})
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
		await axios.patch(`/orders/setStatus/${id}`, fields)
	}


	const changeActiveStatus = async (e, id) => {
		e.stopPropagation()
		const { value } = await Swal.fire({
			title: "Изменить статус заказа",
			input: "select",
			inputOptions: {
				Админ: {
					new: "Проверка",
					accept: "Принят",
				},
				Кондитер: {
					cooking: "Готовится",
					ready: "Готов",
				},
				Итог: {
					canceled: 'Отменен',
					ended: 'Завершен',
				}
			},
			inputPlaceholder: "Выберите статус",
			showCancelButton: true,
			inputValidator: (value) => {
				changeOrderStatus(value, id)
			}
		});
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
							{target !== 'ended' && 
								(obj.status !== 'canceled' ?
									<>
										{target === 'new' ? 
											<>
												<div className="repeat admin-accept" onClick={(e) => changeStatus(e, obj)}>Подтвердить</div>
												<div className="repeat admin-cancel " onClick={(e) => setCancel(e, obj)}>Отменить</div>
											</>
											:
											<>
												<div className="repeat admin-accept" onClick={(e) => changeActiveStatus(e, obj)}>Изменить</div>
												<div className="repeat admin-cancel " onClick={(e) => setEnded(e, obj)} style={{backgroundColor: '#323232'}}>Завершить</div>
											</>
										}
										
									</>
									:
									<div className="">Заказ отменен</div>
								)
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
									{/* <div className="hr-medium" style={{marginTop: 0}}></div> */}
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
				<div className="btn-add-cart favorites-btn focus" onClick={(e) => changeTarget('new', e)}>Новые</div>
				<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('active', e)}>Активные</div>
				<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('ended', e)}>Завершенные</div>
			</div>
			{
			user && (user.role === 'moderator' || user.role === 'admin') ? (
			pageLoad ? 
			(
				!orders?.length ?
				(<>
					<p style={{fontSize : 30, textAlign: 'center'}}>Список заказов пуст<br /></p>
				</>) 
				:
				<>	
					{main}

					{target === 'ended' &&
						<button className="btn-repeat" style={{backgroundColor:'#2F2F2F', width:'200px', borderRadius:'3em', marginBottom:40}} onClick={() => addEndedOrders()}>Загрузить ещё</button>
					}
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
