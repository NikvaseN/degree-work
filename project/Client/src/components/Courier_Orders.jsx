import {YMaps, SearchControl} from '@pbe/react-yandex-maps';
import {useEffect, useState} from 'react';
import './mapOrders.css'
import MapOrders from './MapOrders.jsx'
import axios from '../axios.js';
import { io } from 'socket.io-client';
import close from '../img/icons/close.png'
import human from '../img/icons/human.png'
import phone from '../img/icons/phone.png'
import placemark from '../img/icons/placemark.png'
import {formatPhoneNumber} from './functions.jsx'
import Swal from 'sweetalert2';

export default function Courier_Orders ({rolled, mobile, reloadComponent}) {
	const [orders, setOrders] = useState([]);
	const [isLoad, setIsLoad] = useState(false);
	const [socket, setSocket] = useState(false);
	const [activeOrder, setActiveOrder] = useState(false);

	const setUp = async () => {
		await axios.get('/courier/orders').then(res=>{
			setOrders(res.data)
		})

		await axios.get('/courier/working').then(res =>{
			setActiveOrder(res.data)
			if(res.data.length){
				setTarget(res.data[0])
			}
			setIsLoad(true)
		}).catch(() => {
			setIsLoad(true)
		})
	} 

	useEffect(()=>{
		setUp()
		document.title = 'Заказы'

		// Сокет на обновление заказов
		const socket = io(process.env.REACT_APP_API_HOST)
		socket.on('change-status', (prevStatus, status) =>{	
			setTimeout(() => setUp(), 1000);
		})
		socket.on('connect', () => {
			socket.emit('join-room', 'courier');
		});

		setSocket(socket)
		return () =>{
			socket && socket.close()
		}
	}, [])

	// Обновлять компонент карты при изменении sidebar
	const [refresh, setRefresh] = useState(false);

	useEffect(()=>{
		setTimeout(() => setRefresh(prevRefresh => !prevRefresh), 300);
	}, [rolled])

	const [target, setTarget] = useState(false)
	const [center, setCenter] = useState([52.288177, 104.280811])
	const [zoom, setZoom] = useState(12)

	const smoothscroll = () =>{
		let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
		if (currentScroll > 0) {
			 window.requestAnimationFrame(smoothscroll);
			 window.scrollTo (0,currentScroll - (currentScroll/5));
		}
	}
	const changeTarget = (obj) =>{
		setTarget(obj)
		setCenter(obj.coordinates)
		setZoom(17)
		smoothscroll()
	}

	const back = (e) =>{
		e.stopPropagation()
		setTarget(false)
		setCenter([52.288177, 104.280811])
		setZoom(12)
		smoothscroll()
	}

	const take = async() =>{
		await axios.post(`/courier/take/${target._id}`).then(res=>{
			socket.emit('start-change-status');
			Swal.fire('Заказ принят!', '', 'success')
			reloadComponent()
		}).catch((err) => {
			const error = err.response.data.msg
			Swal.fire('Ошибка!', error, 'error')
		})
	}

	const cancel = async() =>{
		await axios.post(`/courier/cancel/${target._id}`).then(res=>{
			socket.emit('start-change-status');
			Swal.fire('Заказ отменен!', '', 'success')
			reloadComponent()
		}).catch((err) => {
			const error = err.response.data.msg
			Swal.fire('Ошибка!', error, 'error')
		})
	}

	const finish = async() =>{
		await axios.post(`/courier/finish/${target._id}`).then(res=>{
			socket.emit('start-change-status');
			Swal.fire('Заказ зевершен!', '', 'success')
			reloadComponent()
		}).catch((err) => {
			const error = err.response.data.msg
			Swal.fire('Ошибка!', error, 'error')
		})
	}

	return (
		isLoad  &&
		<>
			<YMaps id='map' query={{ apikey: process.env.REACT_APP_MAP_API}}>
					<MapOrders 
						className='courier-orders-map-block' 
						key={refresh} 
						orders={orders} 
						setUp={setUp}
						center={center}
						zoom={zoom}
						target={target}
					/>
			</YMaps>
			<div className="courier-orders-block">
				{orders &&
					!target ?
					<>
						<div className="courier-orders-title" style={{borderBottom: '2px solid black', marginBottom: 10, paddingBottom: 10}}>
								<p>Номер заказа</p>
								<h3>Адресс</h3>
								{!mobile && <p>Кол-во товаров</p>}
						</div>
							{orders.map((obj) =>(
								<div onClick={() =>changeTarget(obj)} className="courier-orders-item">
										<p>{!mobile && 'Заказ'} № {obj.number}</p>
										<h3>{obj.street}, д. {obj.house}, кв. {obj.apartment}</h3>
										{!mobile && <p style={{padding: 5, fontSize:14}}>Товаров: {obj.products.length}</p>}
								</div>
							))}
					</>
					:
					<div className="courier-orders-item target">
							{!activeOrder.length &&
								<img id='close' onClick={(e) => back(e)} src={close} alt="close" width={25} height={25}/>
							}
							<p style={{marginBottom: 20}}>Заказ  - № {target.number}</p>
							
							<div style={{marginLeft: -17}}>
								<img src={human} alt="" width="17px" height="17px"/>
								<p>{target.username}</p>
							</div>
							<div style={{marginLeft: -17}}>
								<img src={phone} alt="" width="17px" height="17px"/>
								<a style={{textDecoration: 'underline'}} href={"tel:" + target.phone}><p>{formatPhoneNumber(target.phone)}</p></a>
							</div>
							<div style={{marginLeft: -17}}>
								<img src={placemark} alt="" width="17px" height="17px"/>
								<h3>{target.street}, д. {target.house}, кв. {target.apartment}</h3>
							</div>
							<div style={{margin: '20px 0'}}>
								<h3>Товары</h3>
							</div>
							{target && target.products.map((obj) =>(
								<div className='courier-orders-products' style={{justifyContent: 'space-between'}}>
									<img src={`${process.env.REACT_APP_IMG_URL}${obj.product.imageUrl}`} alt="" width={70} height={50}/>
									<h3>{obj.product.name}</h3>
									<h3>{obj.value} шт.</h3>
								</div>
							))}
							{!activeOrder.length ?
								<button onClick={take}>Принять</button>
								:
								<div>
									<button onClick={finish}>Завершить</button>
									<button style={{backgroundColor: 'rgb(192, 68, 68)'}} onClick={cancel}>Отменить</button>
								</div>
							}
							
					</div>
				}
			</div>
		</>

	)
}