import React, { useEffect, useState } from 'react'
import axios from '../axios.js'
import {formatDate} from './functions.jsx'
import sad from '../img/icons/sad-anxious.gif';
import load from "../img/icons/delivery.gif"
import './courier.css'

export default function Courier_History ({rolled, mobile, reloadComponent}) {
	const [isLoad, setIsLoad] = React.useState(false)
	const [orders, setOrders] = React.useState([])
	
	const start = async() =>{
		document.title = "История заказов"
		await axios.get('/courier/history').then(res =>{
			setOrders(res.data)
			// setOrders(res.data.reverse())
			setIsLoad(true)
		}).catch(() => setIsLoad(true))
	} 
	React.useEffect(() =>{
		start()
	}, [])

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

	let main = []

	const setMain = () =>{
		main.push(
			<>
				<p style={{fontSize : 36}}>Выполненные заказы</p>
				<div className="hr"></div>
				{(orders).map((obj, index) => (
					!cheackOpenItem(index) ? (
						<div id="courier-history-item" className="history-item" onClick={() => setOpenedItems(index)}>
							<div className='icon_status ended' ></div>
							<p>№ {obj.number}</p>
							<p className='history-order__date'>{formatDate(obj.createdAt, 'D-M-Y')}</p>
							<p>{formatDate(obj.createdAt, 'h:m')}</p>
							<p className='header-links-black'>{quantity(obj.products.reduce((acc, obj) => acc + obj.value, 0))}</p>
							<p>Итого: {obj.fullPrice.toLocaleString()} ₽</p>
						</div>
					):(
						<div className="history-item open" onClick={() => setOpenedItems(index)}>
							<div className="history-item-title">
								<p>№ {obj.number}</p>
								{obj.methodDelivery === 'delivery' && <p>{`${obj.street}, д. ${obj.house}, кв. ${obj.apartment}`}</p>}
								<p>{formatDate(obj.createdAt, 'D-M-Y')}</p>
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
							{(obj.products).map((obj, index) => (
								obj.product ? (
								<div className="cart-item history">
									<img src={`${process.env.REACT_APP_IMG_URL}${obj.product.imageUrl}`} alt="" width={300} height={220}/>
									<div className="cart-item-text">
										<h2 className='history-item__name'>{obj.product.name}</h2>
										<h5 className='history-item__composition' >Состав: <span>{obj.product.composition}</span> </h5>
										<div className="price-box item-price">
											<p><span style={{color: 'grey'}}>{obj.value} x</span> {obj.product.price} ₽</p>
											<p className='history-item__fullPrice'>{(obj.value * obj.product.price)} ₽</p>
										</div>
									</div>
								</div>
								) :
								(
									<div className="cart-item history">
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
								<h3>Итого: {obj.fullPrice.toLocaleString()} ₽</h3>
								</div>	
						</div>
					)
					
				))}
			</>
		)
	}
	setMain ()
	console.log(orders)
	console.log(orders.length)
	return (
		<div className='container'>
			{/* <Header/> */}
			<div className="empty-header-admin"></div>
			{isLoad ? 
			(
				!orders.length ?
				(
				<div className='empty-history-block'>
					<img src={sad} alt="" style={{marginLeft: -80}}/>
					<p style={{fontSize : 30, textAlign: 'center'}}>Вы ещё не выполняли заказы!<br /></p>
				</div>
				) 
				: 
				(main)
			)
			: 
			(
				<img src={load} alt="load" width={'200px'} height={'200px'}/>
			)
			 }
			
		</div>
	);
  };
