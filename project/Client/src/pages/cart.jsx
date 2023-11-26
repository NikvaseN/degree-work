import Header from '../components/header.jsx';
import '../components/normalize.css'
import '../components/cart.css'
import axios from '../axios.js';
import React, {useContext} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import close from '../img/icons/close.png'
import imgWarning from '../img/icons/warning.png';
import io from 'socket.io-client';
import {Context} from '../context.js';
import sad from '../img/icons/sad-anxious.gif';
import crypto from 'crypto-js'
import swal from 'sweetalert2';

export default function Cart() {
	const navigate = useNavigate ()
	const {setQuantityCart} = useContext(Context);

	let cartEmpty = true
	let cartItems
	if(JSON.parse (localStorage.getItem ('cart')) !== null){
		cartItems = JSON.parse (localStorage.getItem ('cart'))
		cartEmpty = false
	}
	else{
		cartItems = [{"value":1,"product":{"_id":"6377987a6359d93c2c7e31ca","name":"Клубничная башня","price":"1598","category":{"_id":"637871432dc9c0dfd59e467d","name":"cakes","createdAt":"2022-11-19T06:01:39.632Z","updatedAt":"2022-11-19T06:01:39.632Z","__v":0},"imageUrl":"/uploads/cakes/town.png","composition":"Пшеничная мука, яйца, сахар, сливочное масло, молоко, соль","createdAt":"2022-11-18T14:36:42.642Z","updatedAt":"2022-11-18T14:36:42.642Z","__v":0}}]
	}
	let startValue = ['-1']
	if(startValue[0] === '-1'){
		for (let i = 0; i < cartItems.length; i++ ){
			startValue[i] = cartItems[i].value;
		}
	}
	let startPrice = ['-1']
	if(startPrice[0] === '-1'){
		for (let i = 0; i < cartItems.length; i++ ){
			startPrice[i] = parseInt(cartItems[i].product.price) * cartItems[i].value
		}
		var startFullPrice = 0 
		for (let i = 0; i < cartItems.length; i++ ){
			startFullPrice += startPrice[i];
		}
		
	}
	
	const [value, setValue] = React.useState(startValue)
	const [price, setPrice] = React.useState(startPrice)
	const [methodDelivery, setMethodDelivery] = React.useState()
	const [deletedItems, setDeletedItems] = React.useState([])
	
	const deleteItemCart = (index) => {
		if(cartItems.length === 1){
			window.localStorage.removeItem('cart')
			setQuantityCart(0)
		}
		else{
			cartItems = JSON.parse (localStorage.getItem ('cart'))
			cartItems.splice(index,1);
			value.splice(index,1);
			price.splice(index,1);
			setFullPriceFunc();
			window.localStorage.setItem('cart', JSON.stringify(cartItems))
			let quantity = cartItems.reduce((acc, obj) => acc + obj.value, 0);
			setQuantityCart(quantity)

		}
		if(deletedItems[0] === undefined){
			let deletedItem = []
			deletedItem[deletedItems.length] = index
			setDeletedItems([...deletedItem])
		}
		else{
			let deletedItem = deletedItems
			deletedItem[deletedItems.length] = index
			setDeletedItems([...deletedItem])
		}

	}
	const setValueUp = (index) =>{
		if(value[index] < 100){
			let valueT = value
			valueT[index] = valueT[index] + 1
			let priceT = price
			priceT[index] = parseInt(priceT[index]) + parseInt(cartItems[index].product.price) 
			setValue(valueT)
			setPrice(priceT)
			setFullPriceFunc()
			let data = JSON.parse(localStorage.getItem ('cart'))
			data[index].value = data[index].value + 1
			window.localStorage.setItem('cart', JSON.stringify(data))
			let quantity = data.reduce((acc, obj) => acc + obj.value, 0);
			setQuantityCart(quantity)
		}
	}
	const setFullPriceFunc = async () =>{
		let fullprice = 0
		for (let i = 0; i < cartItems.length; i++ ){
			fullprice += parseInt(price[i]);
		}
		setFullPrice(fullprice)
	}
	const setValueDown = async (index) =>{
		if(value[index] > 1){
			let valueT = value
			valueT[index] = valueT[index] - 1
			let priceT = price
			priceT[index] = parseInt(priceT[index]) - parseInt(cartItems[index].product.price) 
			setValue(valueT)
			setPrice(priceT)
			setFullPriceFunc()
			let data = JSON.parse(localStorage.getItem ('cart'))
			data[index].value = data[index].value - 1
			window.localStorage.setItem('cart', JSON.stringify(data))
			let quantity = data.reduce((acc, obj) => acc + obj.value, 0);
			setQuantityCart(quantity)
		}
		else{
			deleteItemCart(index)
		}
	}
	const [fullPrice, setFullPrice] = React.useState(startFullPrice)

	const methodDeliveryDelivery = async () =>{
		setMethodDelivery('delivery')
	}
	const methodDeliveryPickup = async () =>{
		setMethodDelivery('pickup')
	}

	const checkActiveItem = async (index) =>{
		let deletedItemsArr = deletedItems
		for (let i = 0; i < deletedItemsArr.length; i++){
			if(index === deletedItemsArr[i]){
				return false
			}
		}
		return true
	}
	const [user, setUser] = React.useState()
	const [isLoad, setIsLoad] = React.useState(false)

	React.useEffect(() =>{
		const start = async() =>{
			document.title = "Корзина"
			await axios.get('/auth/me').then(res =>{
				setUser(res.data)
			}).catch(() => 
				setIsLoad(true)
			)
			
		}
		start()
	}, [])
	const [username, setUsername] = React.useState ()
	const [city, setCity] = React.useState ('Иркутск')
	const [phone, setPhone] = React.useState ()
	const [street, setStreet] = React.useState ()
	const [house, setHouse] = React.useState ()
	const [apartment, setApartment] = React.useState ()
	const [validationPhoneFailed, setValidationPhoneFailed] = React.useState (false)
	const [validationAdressFailed, setValidationAdressFailed] = React.useState (false)
	
	const sendOrder = async () =>{
		let products = cartItems
		let fields;
		let coordinates;
		// Объект с адресом (country, locality: город, province: область, street, house)
		let Address = {}

		let nonAuthUser = window.localStorage.getItem('nonAuthUser')
		if (!nonAuthUser){	
			const hash = crypto.lib.WordArray.random(11);
       		nonAuthUser = 'ID' + crypto.SHA256(hash).toString();
			window.localStorage.setItem('nonAuthUser', nonAuthUser)
		}
		if(methodDelivery === 'delivery'){
			if (city && street && house && apartment && username && phone){
				const address = `${city}, ${street}, ${house}`
				await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.REACT_APP_MAP_API}&format=json&geocode=${address}`)
				.then(response => response.json())
				.then(data => {
				// Получение координат из ответа
				const coordinatesData = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
				const addressData =  data.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.Address.Components
	
				// Заполнение адреса, найденными данными адреса
				addressData.map((obj) =>{
					Address[obj.kind] = obj.name
				})
				coordinates = [Number(coordinatesData[1]), Number(coordinatesData[0])]
				})
				.catch(error => {
				console.error('Ошибка при геокодировании:', error);
				});
			}
			else{
				swal.fire("Заполните все поля!", '', "error");
			}
		}
		if(user){
			fields = {
				username, phone, city: Address.locality, street: Address.street, house: Address.house, apartment, coordinates, methodDelivery, fullPrice, products, user
			}
		}
		else{
			fields = {
				username, phone, city: Address.locality, street: Address.street, house: Address.house, apartment, coordinates, methodDelivery, fullPrice, products, nonAuthUser
			}
		}
		const socket = io(process.env.REACT_APP_API_HOST)

		await axios.post('/orders', fields).then((res) =>{
			
			socket.emit('order', 'add', res.data)
			window.localStorage.removeItem('cart')
			// if (!user) {
			// 	let history = JSON.parse(window.localStorage.getItem('history'))
			// 	if(history == null){
			// 		window.localStorage.setItem('history', JSON.stringify([res.data]))
			// 	}
			// 	else{
			// 		history.push(res.data)
			// 		window.localStorage.setItem('history', JSON.stringify(history))
			// 	}
			// }
			setQuantityCart(0)
			navigate('/history')
		}
		)
		
	}
	const [defaultName, setDefaultName] = React.useState('')
	const [defaultPhone, setDefaultPhone] = React.useState('')
	const DataUser = () =>{
		setDefaultName(user.fullName)
		setDefaultPhone(user.phone)
		setPhone(user.phone)
		setUsername(user.fullName)
	}
	const DataLocalUser = (action) =>{
		if(action === 'set'){
			let data = {
				username, phone 
			}
			window.localStorage.setItem('user_data', JSON.stringify(data))
			window.location.reload()
		}
		if(action === 'get'){
			let data = JSON.parse(window.localStorage.getItem ('user_data'))
			console.log(data)
			setDefaultName(data.username)
			setDefaultPhone(data.phone)
			setPhone(data.phone)
			setUsername(data.username)
		}
	}
	//
	const [easterNum, setEasterNum] = React.useState(1)
	const easter = () =>{
		setEasterNum(easterNum + 1)
		if(easterNum > 9){
			navigate("/gif")
		}
	}
	//
	let main = []
	const setMain = () =>{
		main.push(
			!cartEmpty ? (
				<>
				<p style={{fontSize : 36}} onClick={easter}>Ваш заказ</p>
				<div className="hr"></div>
				{(isLoad && !user) && 
				<div className="warning-bloack">
					<div className="warning-title">
						<img src={imgWarning} alt="warning" width={50}/>
						<h3>Войдите или создайте аккаунт, чтобы получить следующие возможности:</h3>
					</div>
					<ul>
						<li>Сохранить историю заказов на аккаунт</li>
						<li>Получение различных бонусов</li>
					</ul>
				</div>
				}
				
				{(cartItems).map((obj, index) => (
					checkActiveItem(index) && (
					<div className="cart-item">
					<img src={`${process.env.REACT_APP_IMG_URL}${obj.product.imageUrl}`} alt="" width={383} height={260}/>
					<div className="cart-item-text">
						<h2 style={{fontSize : 30, marginTop:15}}>{obj.product.name}</h2>
						<h3 style={{marginBottom : 60, marginTop: 45}}>Состав: <span>{obj.product.composition}</span> </h3>
						<div className="price-block">
							<div className="quantity-items pag-cart">
								<button style={{ fontSize : 40, marginTop:-10}} onClick={() => setValueDown(index)}>-</button>
								<p>{value[index]}</p>
								{/* <input type="text" defaultValue={value} onChange ={(e) => setPag(e.target.value)}/> */}
								<button style={{ fontSize : 40, marginTop:-2} } onClick={() => setValueUp(index)} >+</button>
							</div>
							<h3>{price[index].toLocaleString()} ₽</h3>
						</div>
							
						</div>
					<button className='close-item-cart' onClick={() => deleteItemCart(index)}><img src={close} alt="" width='28' height='28'/></button>
				</div>
					)
				))}
				
				<h2>ИТОГО: {fullPrice.toLocaleString()} ₽</h2>
				<p style={{fontSize : 30, marginTop: 80}}>Оформление заказа</p>
				<div className="hr" style={{marginTop: 50}}></div>
				<p style={{fontSize : 28, marginBottom: 50}}>Способ доставки</p>
				<div className="method-delivery-cart" >
					<button className='btn-add-cart' onClick={() => methodDeliveryDelivery()}>Доставка</button>
					<button className='btn-add-cart' onClick={() => methodDeliveryPickup()}>Самовывоз</button>
				</div>
				{methodDelivery === 'delivery' && (
				<>
					<p style={{fontSize : 28, marginBottom: 50}}>Личные данные</p>
					{user ?
						<button className='btn-use-data' onClick={() => DataUser()}>Использовать сохраненные данные</button>
						:
						<div className="btn-use-data-block">
							<button className='btn-use-data-half' onClick={() => DataLocalUser('set')}>Сохранить записанные данные</button>
							<div className="btn-hr"></div>
							<button className='btn-use-data-half' onClick={() => DataLocalUser('get')}>Использовать сохраненные данные</button>
						</div>
					}
					
					<form className='cart-form'>
						<label for='name-input' style={{fontSize : 28, marginBottom: 50, textAlign: 'center'}} className='input-order'>Введите имя</label>
						<input type="text" id='name-input' className='cart-input' defaultValue={defaultName} onChange ={(e) => setUsername(e.target.value)}/>
						
						<label for='phone-input' className='input-order'>Номер телефона</label>
						{validationPhoneFailed &&(
							<p className='validationEror'>Введите номер телефона</p>
						)}
						<input type="text" id='phone-input' className='cart-input' defaultValue={defaultPhone} onChange ={(e) => setPhone(e.target.value)}/>

						<div className="address-block">
							<div className="address-block-item">
								<label for='street-input' className='input-order'>Улица</label>
								<input type="text" id='street-input' className='cart-input' onChange ={(e) => setStreet(e.target.value)}/>
							</div>
							<div className="address-block-item">
								<label for='house-input' className='input-order'>Дом</label>
								<input type="text" id='house-input' className='cart-input' onChange ={(e) => setHouse(e.target.value)}/>
							</div>
							<div className="address-block-item">
								<label for='apartment-input' className='input-order'>Кваритра</label>
								<input type="text" id='apartment-input' className='cart-input' onChange ={(e) => setApartment(e.target.value)}/>
							</div>
						</div>

					</form>
					<button className='btn-add-cart' onClick={() => sendOrder()}>Заказать</button>
				</>
				)}
				{(methodDelivery === 'pickup' &&(
					<>
					<p style={{fontSize : 28, marginBottom: 50}}>Личные данные</p>
					{user ?
						<button className='btn-use-data' onClick={() => DataUser()}>Использовать сохраненные данные</button>
						:
						<div className="btn-use-data-block">
							<button className='btn-use-data-half' onClick={() => DataLocalUser('set')}>Сохранить записанные данные</button>
							<div className="btn-hr"></div>
							<button className='btn-use-data-half' onClick={() => DataLocalUser('get')}>Использовать сохраненные данные</button>
						</div>
					}
					<form className='cart-form'>
						<label for='name-input' style={{fontSize : 28, marginBottom: 50, textAlign: 'center'}} className='input-order'>Введите имя</label>
						<input type="text" id='name-input' className='cart-input' defaultValue={defaultName} onChange ={(e) => setUsername(e.target.value)}/>
						
						<label for='phone-input' className='input-order'>Номер телефона</label>
						{validationPhoneFailed &&(
							<p className='validationEror'>Введите номер телефона</p>
						)}
						<input type="text" id='phone-input' className='cart-input' defaultValue={defaultPhone} onChange ={(e) => setPhone(e.target.value)}/>
					</form>
					<p style={{fontSize : 28, marginBottom: 50}}>Самовывоз</p>		
					<p style={{fontSize : 22, marginBottom: 50}}>Вы можете подтвердить заказ и приехать к нам в магазин для оплаты и получения заказа</p>		
					<p style={{fontSize : 22, marginBottom: 50}}>Адрес: Ул. Ленина 5А</p>
					<p style={{fontSize : 22, marginBottom: 50}}>График:</p>
					<p style={{fontSize : 22, marginBottom: 50}}>Пн 08:30–20:00 <br />
						
						Вт 08:30–20:00 <br />
						Ср 08:30–20:00 <br />
						Чт 08:30–20:00 <br />
						Пт 08:30–20:00 <br />
						Сб Выходной<br />
						Вс Выходной <br />
	</p>
					<iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A26813f20f39c4e90d9bb358c11190faea4af213cb57baa04cd8c56df455d132e&amp;source=constructor" width="950" height="400" frameborder="0"></iframe>
					<button className='btn-add-cart' style={{marginTop: 50}} onClick={() => sendOrder()}>Заказать</button>		
					</>
				)
				)}
				</>
				):(
					<div className='empty-history-block'>
						<img src={sad} alt="" style={{marginLeft: -80}}/>
						<p style={{fontSize : 30, textAlign: 'center'}}>В корзине пусто!<br /></p>
						<Link to='/' style={{fontSize : 30, textAlign: 'center'}} className='header-links-black'>Давайте это исправим!</Link>
					</div>
				)
				
		)
	}
	setMain ()
	return (
		<div className='container'>
			{/* <Header/> */}
			<div className="empty-header"></div>
			{main}
			
		</div>
	);
  };
