import Header from '../components/header.jsx';
import '../components/normalize.css'
import '../components/history.css'
import '../styles/statuses.css'
import load from "../img/icons/load.gif"
import undefined from "../img/icons/undefined.webp"
import imgWarning from '../img/icons/warning.png';
import axios from '../axios.js';
import sad from '../img/icons/sad-anxious.gif';
import {Link} from "react-router-dom";
import React, {useContext} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {Context} from '../Context.jsx';
import { formatDate } from '../components/functions.jsx';
import { ruStatus } from '../config/statuses.js';

export default function History() {
	const [historyEmpty, setHistoryEmpty] = React.useState(true)
	const [pageLoad, setPageLoad] = React.useState(false)
	const navigate = useNavigate()
	const [orders, setOrders] = React.useState([])
	const {setQuantityCart, user, isLoad} = useContext(Context);
	
	const getData = async (user) =>{
		if (user){
			await axios.post('/orders/history', {user}).then(res =>{
				if(res.data && res.data[0]){
					setHistoryEmpty(false)
					setOrders(res.data.reverse())
				}
				setPageLoad(true)
			})
		}
		else{
			if(window.localStorage.getItem('nonAuthUser')){
				const fields = {
					nonAuthUser: window.localStorage.getItem('nonAuthUser')
				}
				await axios.post('/orders/history', fields).then(res =>{
					if(res.data && res.data[0]){
						setOrders(res.data.reverse())
						setHistoryEmpty(false)
					}
					setPageLoad(true)
				})
			}
			else{
				const history = JSON.parse(window.localStorage.getItem('history'))
				if(history && history[0]){
					setHistoryEmpty(false)
					setOrders(JSON.parse(window.localStorage.getItem ('history')).reverse())
				}
				setPageLoad(true)
			}
		}
	}
	
	const [socket, setSocket] = React.useState()

	const start = () =>{
		document.title = "История заказов"
		if (user){
			let socket = io(import.meta.env.VITE_API_HOST)
			getData(user._id)
			socket.emit('join-room', user._id)
			socket.on('change-status', (id, status) =>{
				setOrders(prev => prev.map(item => item._id === id ? {...item, status: status} : item))
			})
			setSocket(socket)
		}
		else{
			getData(false)
			let nonAuthUserID = window.localStorage.getItem('nonAuthUser')
			if(nonAuthUserID){
				let socket = io(import.meta.env.VITE_API_HOST)
				socket.emit('join-room', nonAuthUserID)
				socket.on('change-status', (id, status) =>{
					setOrders(prev => prev.map(item => item._id === id ? {...item, status: status} : item))
				})
				setSocket(socket)
			}
		}
	}

	React.useEffect(() =>{
		if(isLoad){
			start()
		}
	}, [isLoad])

	React.useEffect(()=>{
		return () =>{
			socket && socket.close()
		}
	}, [socket])

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
		cheackOpenItem()
	}
	const cheackOpenItem = (index) =>{
		for (let i=0; i < openItems.length; i++){
			if(openItems[i] === index){
				return true
			}
		}
		return false
	}
	
	// Дата и время
	var date_day = [];
	var date_hour = [];
	var day_date = [];
	var hour_date = [];
	let day = function (text){
		date_day = []
		for (let i = 0; i < 10; i++){
			date_day += '' + text[i];
		  }
	}
	let hour = function (text){
		date_hour = []
		if ((Number(text[11]+text[12]) + 8) > 24){
			date_hour = '0' + (Number(text[11]+text[12]) + 8 - 24)
		}
		else {
			date_hour = '' + (Number(text[11]+text[12]) + 8)
		}
		for (let i = 13; i < 16; i++){
			date_hour +=  '' + text[i];
		}
	}
	let fullDate = function (index){
		day_date[index] = date_day;
		hour_date[index] = date_hour;
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
	
	const repeat = (products) =>{
		window.localStorage.setItem('cart', JSON.stringify(products))
		let quantity = products.reduce((acc, obj) => acc + obj.value, 0);
		setQuantityCart(quantity)
		navigate('/cart')
	}
	
	const cancel = async (e, id) =>{
		e.stopPropagation();
		let socket = io(import.meta.env.VITE_API_HOST)
		let ordersT = orders
		for (let i=0; i < ordersT.length; i++){
			if(ordersT[i]._id === id){
				ordersT.splice(i,1);
			}
		}
		setOrders([...ordersT])

		if(!user){
			// let historyString = window.localStorage.getItem('history');
			// let history = JSON.parse(historyString);
			// const updatedHistory = history.filter(item => item._id !== id);
			// const updatedHistoryString = JSON.stringify(updatedHistory);
			// window.localStorage.setItem('history', updatedHistoryString);

			let nonAuthUser = window.localStorage.getItem('nonAuthUser')
			let fields = {			
				nonAuthUser
			}
			await axios.post(`/orders/remove/${id}`, fields).then(res =>{
				socket.emit('order', 'remove', id)
			})
		}
		else{
			await axios.delete(`/orders/${id}`).then(res =>{
				socket.emit('order', 'remove', id)
			})
		}
		

		
	}

	let main = []
	let icon_status = []

	const cheackStatus = (status) =>{
		icon_status = []
		let Class = 'icon_status ' + status
		icon_status.push(
			<div className={Class} ></div>
		)
		return ruStatus(status)

	}

	const setMain = () =>{
		main.push(
			<>
				<p style={{fontSize : 36}}>Ваши заказы</p>
				<div className="hr"></div>
				{/* {(pageLoad && !user) && 
					<div className="warning-bloack">
						<div className="warning-title">
							<img src={imgWarning} alt="warning" width={50}/>
							<h3>Войдите или создайте аккаунт, чтобы получить следующие возможности:</h3>
						</div>
						<ul>
							<li>Сохранять историю заказов на аккаунт</li>
							<li>Получение различных бонусов</li>
							<li>Предлагать новые рецепты</li>
						</ul>
				</div>} */}
				{(orders).map((obj, index) => (
					!cheackOpenItem(index) ? (
						<div key={obj._id} className="history-item" onClick={() => setOpenedItems(index)}>
							<p>№ {obj.number}</p>
							<p style={{width:90}}>{cheackStatus(obj.status)}</p>
							{icon_status}
							<p className='history-order__date'>{formatDate(obj.createdAt, 'Y-M-D')}</p>
							{/* {!user && <p>{formatDate(obj.createdAt, 'h:m')}</p>} */}
							<p className='header-links-black'>{quantity(obj.products.reduce((acc, obj) => acc + obj.value, 0))}</p>
							<p className='history-item__total-price'>Итого: {obj.fullPrice.toLocaleString()}</p>
								{obj.status === 'new' ?
									(<div className="repeat cancel" onClick={(e) => cancel(e, obj._id)}>Отменить</div>)
									:
									(<div className="repeat" onClick={() => repeat(obj.products)}>Повторить</div>)
								}
						</div>
					):(
						<div key={obj._id} className="history-item open" onClick={() => setOpenedItems(index)}>
							<div className="history-item-title">
								<p>№ {obj.number}</p>
								{obj.methodDelivery === 'delivery' ? (<><p>Доставка</p><p>{`${obj.street}, д. ${obj.house}, кв. ${obj.apartment}`}</p></>) : (<p>Самовывоз</p>) }
								<p>{formatDate(obj.createdAt, 'Y-M-D')}</p>
								<p>{formatDate(obj.createdAt, 'h:m')}</p>
							</div>
							{/* {obj.methodDelivery === 'delivery' ? 
								(<>
								<div className="history-item-title user">
									<p>Доставка</p>
									<p>{obj.username}</p>
									<p>{obj.phone}</p>
								</div>
								<div className="hr-small"></div>
								<div className="history-item-title">
								<p>№ 123</p>
								<p>{`${obj.street}, д. ${obj.house}, кв. ${obj.apartment}`}</p>
								<p>{day_date[index]}</p>
								<p>{hour_date[index]}</p>
							</div>
								</>
								)	
								:(
									<>
									<div className="history-item-title center">
										<p>Самовывоз</p>
									</div>
									<div className="hr-small"></div>
									<div className="history-item-title user">
										<p>№ 123</p>
										<p>{day_date[index]}</p>
										<p>{hour_date[index]}</p>
									</div>
								</>
								)
							} */}
							<div className="hr-medium history"></div>
							{(obj.products).map((obj) => (
								obj.product ? (
								<div key={obj.product._id} className="cart-item history">
									<img src={`${import.meta.env.VITE_IMG_URL}${obj.product.imageUrl}`} alt="" width={300} height={220}/>
									<div className="cart-item-text">
										<h2 className='history-item__name'>{obj.product.name}</h2>
										<h5 className='history-item__composition' >Состав: <span>{obj.product.composition}</span> </h5>
										<div className="price-box item-price">
											<p><span style={{color: 'grey'}}>{obj.value} x</span> {obj.product.price.toLocaleString()} ₽</p>
											<p className='history-item__fullPrice'>{(obj.value * obj.product.price).toLocaleString()} ₽</p>
										</div>
									</div>
								</div>
								) :
								(
									<div key={obj.product._id} className="cart-item history">
										<img src={undefined} alt="" width={300} height={220}/>
										<div className="cart-item-text">
											<h2 style={{fontSize : 24, marginTop:15}}>Товар не найден</h2>
											<h5 style={{marginBottom : 60, marginTop: 45}}>Данный товар больше не продаётся</h5>
										</div>
									</div>
								)
								))
							}
							<div className="hr-medium history lower"></div>
							<div className="price-box">
								<h3>Итого: {obj.fullPrice.toLocaleString()}</h3>
								{(user && obj.status === 'new') ?
								(<button className="btn-repeat cancel history" onClick={(e) => cancel(e, obj._id)}>Отменить</button>)
								:
								(<button className="btn-repeat history" onClick={() => repeat(obj.products)}>Повторить</button>)
							}
								</div>
							
						</div>
					)
					
				))}
			</>
		)
	}
	setMain ()
	return (
		<div className='container'>
			{/* <Header/> */}
			<div className="empty-header"></div>
			{pageLoad ? 
			(
				historyEmpty ?
				(
				<div className='empty-history-block'>
					<img src={sad} alt="" style={{marginLeft: -80}}/>
					<p style={{fontSize : 30, textAlign: 'center'}}>Вы ещё не делали заказов!<br /></p>
					<Link to='/' style={{fontSize : 30, textAlign: 'center'}} className='header-links-black'>Давайте это исправим!</Link>
				</div>
				) 
				: 
				(main)
			)
			: 
			(
				<img src={load} alt="load" />
			)}
			
		</div>
	);
  }
