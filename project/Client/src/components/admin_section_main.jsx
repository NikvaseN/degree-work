import '../components/normalize.css'
import '../components/courier.css'
import '../components/admin_courier.css'
import refresh from '../img/icons/refresh.png'
import React, { useEffect } from 'react';
import axios from '../axios.js';
import { io } from 'socket.io-client';

export default function Admin_section_main() {
	const [ordersData, setOrdersData] = React.useState()
	const [couriersData, setCouriersData] = React.useState()
	const [socket, setSocket] = React.useState()
	const [online, setOnline] = React.useState()
	const setPb = (data) =>{

		const orders = Object.entries(data.ordersData).map(([key, value]) => ({ key, value }))
		const couriers = Object.entries(data.couriersData).map(([key, value]) => ({ key, value }))
		orders.map((obj) => {
			let pb = document.getElementById(`${obj.key}`)
			if(pb){
				pb.style.width = `${obj.value / data.ordersData.orders * 100}%`;
			}
		})
		couriers.map((obj) => {
			let pb = document.getElementById(`${obj.key}`)
			if(pb){
				pb.style.width = `${obj.value / data.couriersData.couriers * 100}%`;
			}
		})
	}

	const setUp = async () =>{
		await axios.get('/couriers/count').then(res=> {
			setOrdersData(res.data.ordersData)
			setCouriersData(res.data.couriersData)
			setPb(res.data)
		})
	}
	const onlinePbBar = (online, couriersData) =>{
		if(couriersData){
			const elOnline = document.getElementById(`online`)
			const widthOnline = online / couriersData.couriers * 100;
			elOnline.style.width = `${widthOnline}%`

			const elOffline = document.getElementById(`offline`)
			const widthOffline = (couriersData.couriers - online) / couriersData.couriers * 100;
			elOffline.style.width = `${widthOffline}%`
			
		}
	}
	React.useEffect(()=>{
		document.title = "Статистика"
		setUp()
		const socket = io(process.env.REACT_APP_API_HOST)

		socket.on('couriers-count', (count) =>{
			count.length ? setOnline(count.length) : setOnline(0)
		})

		socket.on('update-orders-list', (action, obj) =>{
			// const pb = document.getElementById(`new`)
			// if(action === 'add'){
			// 	setOrdersData(prevState => ({
			// 		...prevState,
			// 		new: prevState.new + 1,
			// 		orders: prevState.orders + 1,
			// 	}))
			// 	pb.style.width = `${(ordersData.new + 1) / ordersData.orders * 100}%`;
			// }
			// if(action === 'remove'){
			// 	setOrdersData(prevState => ({
			// 		...prevState,
			// 		new: prevState.new - 1,
			// 		orders: prevState.orders - 1,
			// 	}))
			// 	if(ordersData.new === 1 || ordersData.new === 0){
			// 		console.log(1)
			// 		pb.style.width = `0%`;
			// 	}
			// 	else{
			// 		pb.style.width = `${(ordersData.new - 1) / ordersData.orders * 100}%`;
			// 	}
			// }
			setUp()
		})

		// При изменени статуса заказа, убирать заказ из прошлого статуса и добавить в новый
		socket.on('change-status', (prevStatus, status) =>{	
			// setOrdersData(prevState => ({
			// 	...prevState,
			// 	[prevStatus]: prevState[prevStatus] - 1,
			// 	[status]: prevState[status] + 1
			// }))
			setUp()
			
		})
		socket.on('connect', () => {
			socket.emit('couriers-count-get');
			socket.emit('join-room', 'admin');
		});

		setSocket(socket)
		
		return () =>{
			socket && socket.close()
		}
	}, [])
	React.useEffect(()=>{
		onlinePbBar(online, couriersData)
	}, [online])
	
	const startRefresh = async (e) =>{
		e.target.classList.add('start')
		const orders = Object.entries(ordersData).map(([key, value]) => ({ key, value }))
		const couriers = Object.entries(couriersData).map(([key, value]) => ({ key, value }))
		orders.map((obj) => {
			let pb = document.getElementById(`${obj.key}`)
			if(pb){
				pb.style.width = `0%`;
			}
		})
		couriers.map((obj) => {
			let pb = document.getElementById(`${obj.key}`)
			if(pb){
				pb.style.width = `0%`;
			}
		})
		const elOnline = document.getElementById(`online`)
		elOnline.style.width = `0%`

		const elOffline = document.getElementById(`offline`)
		elOffline.style.width = `0%`
		await setUp()
		e.target.classList.remove('start')
		onlinePbBar(online, couriersData)
	}

	const [onlineSeted, setOnlineSeted] = React.useState(false)

	if((online || online === 0) && couriersData && !onlineSeted){
		onlinePbBar(online, couriersData)
		setOnlineSeted(true)
	}

	return (
		<>
            <div className="lk-section-item main">
				<div className="selection-main-block">
					<h2>Заказы</h2>
					<img src={refresh} onClick={(e) => startRefresh(e)} alt="refresh" className='refresh-stats'/>
					<div>
						<div className="info-block">
							<h3>Новые</h3>
							<h3>{ordersData && ordersData.new}</h3>
						</div>
						<div className="progress-container">
							<div id='new' className="progress" style={{backgroundColor: '#2ECC71'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>В пути</h3>
							<h3>{ordersData && ordersData.pending}</h3>
						</div>
						<div className="progress-container">
							<div id='pending' className="progress" style={{backgroundColor: '#3498DB'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>Отмененные</h3>
							<h3>{ordersData && ordersData.canceled}</h3>
						</div>
						<div className="progress-container">
							<div id='canceled' className="progress" style={{backgroundColor: '#E74C3C'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>Завершенные</h3>
							<h3>{ordersData && ordersData.ended}</h3>
						</div>
						<div className="progress-container">
							<div id='ended' className="progress" style={{backgroundColor: '#d0d0d0'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>Всего</h3>
							<h3>{ordersData && ordersData.orders}</h3>
						</div>
						<div className="progress-container">
							<div id='orders' className="progress" style={{backgroundColor: '#d0d0d0'}}></div>
						</div>
					</div>
				</div>
				<div className="selection-main-block">
					<h2>Курьеры</h2>
					<img src={refresh} onClick={(e) => startRefresh(e)} alt="refresh" className='refresh-stats'/>
					<div>
						<div className="info-block">
							<h3>На заказе</h3>
							<h3>{couriersData && couriersData.working}</h3>
						</div>
						<div className="progress-container">
							<div id='working' className="progress" style={{backgroundColor: '#2ECC71'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>Онлайн</h3>
							<h3>{couriersData && online}</h3>
						</div>
						<div className="progress-container">
							<div id='online' className="progress" style={{backgroundColor: '#3498DB'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>Оффлайн</h3>
							<h3>{couriersData && (couriersData.couriers - online)}</h3>
						</div>
						<div className="progress-container">
							<div id='offline' className="progress" style={{backgroundColor: '#E74C3C'}}></div>
						</div>
					</div>

					<div>
						<div className="info-block">
							<h3>Всего</h3>
							<h3>{couriersData && couriersData.couriers}</h3>
						</div>
						<div className="progress-container">
							<div id='couriers' className="progress" style={{backgroundColor: '#d0d0d0'}}></div>
						</div>
					</div>
				</div>
            </div>
         </>     
	);
  };
