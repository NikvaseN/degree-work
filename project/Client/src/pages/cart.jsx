import '../components/normalize.css'
import axios from '../axios.js';
import React, {useContext, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import close from '../img/icons/close.png'
import imgWarning from '../img/icons/warning.png';
import io from 'socket.io-client';
import {Context} from '../Context.jsx';
import sad from '../img/icons/sad-anxious.gif';
import crypto from 'crypto-js'
import Swal from 'sweetalert2';
// import Map from '../components/getCoords/GetCoords.jsx'
import InputMask from 'react-input-mask';
import '../components/cart.css'

export default function Cart() {
	const navigate = useNavigate ()
	const {user, isLoad, setQuantityCart} = useContext(Context);

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

	const changeMethodDelivery = async (e, method) =>{
		setMethodDelivery(method)

		let btns = document.getElementsByClassName('_method-delivery')
		btns = Array.from(btns)
		btns.forEach(obj => obj.classList.remove('focus'))
		e.target.classList.add("focus");
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

	const start = async() =>{
		document.title = "Корзина"
	}

	React.useEffect(() =>{
		start()
	}, [])

	const [username, setUsername] = React.useState ()
	const [city, setCity] = React.useState ('Иркутск')
	const [phone, setPhone] = React.useState ('')
	const [street, setStreet] = React.useState ('')
	const [house, setHouse] = React.useState ('')
	const [apartment, setApartment] = React.useState ()
	const [validationPhoneFailed, setValidationPhoneFailed] = React.useState (false)
	const [validationAdressFailed, setValidationAdressFailed] = React.useState (false)
	
	const sendOrder = async () =>{
		let products = cartItems
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
				await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${import.meta.env.VITE_MAP_API}&format=json&geocode=${address}`)
				.then(response => response.json())
				.then(data => {
				// Получение координат из ответа
				const coordinatesData = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
				const addressData =  data.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.Address.Components
	
				// Заполнение адреса, найденными данными адреса
				addressData.forEach((obj) =>{
					Address[obj.kind] = obj.name
				})
				coordinates = [Number(coordinatesData[1]), Number(coordinatesData[0])]
				})
				.catch(error => {
					console.error('Ошибка при геокодировании:', error);
				});
			}
			else{
				Swal.fire("Ошибка!", 'Заполните все поля!', "error");
				return;
			}
			if(!Address.locality || !Address.street || !Address.house){
				Swal.fire("Ошибка!", 'Адрес не найден', "error");
				return
			}
		}
		const fields = {
			username,
			phone,
			city: Address.locality,
			street: Address.street,
			house: Address.house,
			apartment,
			coordinates,
			methodDelivery,
			fullPrice,
			products
		};

		if (user) {
			fields.user = user;
		} else {
			fields.nonAuthUser = nonAuthUser;
		}
		
		if (username && phone){
			const socket = io(import.meta.env.VITE_API_HOST)
			await axios.post('/orders', fields)
				.then((res) =>{
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
				})
				.catch(err =>{
					let errs = err.response.data
					let str = '';
					if (errs.length >= 1) {
						errs.forEach((obj) => str += '- ' +  obj.msg + '<br><br>')
					}
					else{
						str = err.response.data.msg
					}
					Swal.fire(
						'Ошибка!',
						str,
						'error'
					)
				})
		}
		else{
			Swal.fire("Заполните все поля!", '', "error");
		}
		
	}
	const DataUser = () =>{
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
			setPhone(data.phone)
			setUsername(data.username)
		}
	}
	const [coords, setCoords] = useState()
	React.useEffect(()=>{
		// Здесь можно сделать логику отправки координат на обратное геокодирование
	}, [coords])

	let main = []
	const setMain = () =>{
		main.push(
			!cartEmpty ? (
				<>
				<p className='your-order _cart'>Ваш заказ</p>
				<div className="hr"></div>
				{/* {(isLoad && !user) && 
				<div className="warning-block">
					<div className="warning-title">
						<img src={imgWarning} alt="warning"/>
						<h3>Войдите или создайте аккаунт, чтобы получить следующие возможности:</h3>
					</div>
					<ul>
						<li>Сохранить историю заказов на аккаунт</li>
						<li>Получение различных бонусов</li>
						<li>Предлагать новые рецепты</li>
					</ul>
				</div>} */}
				{(cartItems).map((obj, index) => (
					checkActiveItem(index) && obj.product &&(
					<div key={obj.product._id} className="cart-item _cart">
						<div className='cart-item__img-block _cart'>
							<img src={`${import.meta.env.VITE_IMG_URL}${obj.product.imageUrl}`} alt="Изображение товара"/>
						</div>
						<div className="cart-item-text _cart">
							<h2 className='cart-item-text__title _cart'>{obj.product.name}</h2>
							<h3 className='cart-item-text__description _cart'>Состав: <span>{obj.product.composition}</span> </h3>
							<div className="price-block _cart">
								<div className="quantity-items pag-cart _cart">
									<button style={{ fontSize : 40, marginTop:-10}} onClick={() => setValueDown(index)}>-</button>
									<p>{value[index]}</p>
									{/* <input type="text" defaultValue={value} onChange ={(e) => setPag(e.target.value)}/> */}
									<button style={{ fontSize : 40, marginTop:-2} } onClick={() => setValueUp(index)} >+</button>
								</div>
								<h3>{price[index].toLocaleString()} ₽</h3>
							</div>
								
							</div>
						<button className='close-item-cart _cart' onClick={() => deleteItemCart(index)}><img src={close} alt=""/></button>
					</div>
					)
				))}
				
				<h2 className='full-price _cart'>ИТОГО: {fullPrice.toLocaleString()} ₽</h2>
				<p className='order-registration'>Оформление заказа</p>
				<div className="hr _order-registration"></div>
				<p className='delivery-title _cart'>Способ доставки</p>
				<div className="method-delivery-cart _cart" >
					<button className='btn-add-cart _cart _method-delivery' onClick={(e) => changeMethodDelivery(e, 'delivery')}>Доставка</button>
					<button className='btn-add-cart _cart _method-delivery' onClick={(e) => changeMethodDelivery(e, 'pickup')}>Самовывоз</button>
				</div>
				{methodDelivery === 'delivery' && (
				<>
					<p className='delivery-title _cart'>Личные данные</p>
					{user ?
						<button className='btn-use-data _cart' onClick={() => DataUser()}>Использовать сохраненные данные</button>
						:
						<div className="btn-use-data-block">
							<button className='btn-use-data-half _cart' onClick={() => DataLocalUser('set')}>Сохранить записанные данные</button>
							<div className="btn-hr"></div>
							<button className='btn-use-data-half _cart' onClick={() => DataLocalUser('get')}>Использовать сохраненные данные</button>
						</div>
					}
					
					<form className='cart-form _cart'>
						<label htmlFor='name-input' className='delivery-title _cart input-order'>Введите имя</label>
						<input type="text" id='name-input' className='cart-input _cart' defaultValue={username} onChange ={(e) => setUsername(e.target.value)}/>
						
						<label htmlFor='phone-input' className='delivery-title _cart input-order'>Номер телефона</label>
						{validationPhoneFailed &&(
							<p className='validationEror'>Введите номер телефона</p>
						)}
						<InputMask mask="8(999) 999-99-99" class="cart-input _cart" type="text" id="phone-input" value={phone} onChange ={(e) => setPhone(e.target.value.replace(/\D/g, ""))}/>
						<div className="address-block _cart">
							<div className="address-block-item _cart">
								<label htmlFor='street-input' className='delivery-title _cart input-order'>Улица</label>
								<input type="text" id='street-input' className='cart-input _cart __little' onChange ={(e) => setStreet(e.target.value)}/>
							</div>
							<div className="address-block-item _cart">
								<label htmlFor='house-input' className='delivery-title _cart input-order'>Дом</label>
								<input type="text" id='house-input' className='cart-input _cart __little' onChange ={(e) => setHouse(e.target.value)}/>
							</div>
							<div className="address-block-item _cart">
								<label htmlFor='apartment-input' className='delivery-title _cart input-order'>Кваритра</label>
								<input type="text" id='apartment-input' className='cart-input _cart __little' onChange ={(e) => setApartment(e.target.value)}/>
							</div>
						</div>
					</form>
					{/* <div className='cart-map-block'>
						<Map setCoords={setCoords} width={'100%'} height={'500px'}/>
					</div> */}
					
					<button className='btn-add-cart send_order' onClick={() => sendOrder()}>Заказать</button>
				</>
				)}
				{(methodDelivery === 'pickup' &&(
					<>
					<p className='delivery-title _cart'>Личные данные</p>
					{user ?
						<button className='btn-use-data _cart' onClick={() => DataUser()}>Использовать сохраненные данные</button>
						:
						<div className="btn-use-data-block">
							<button className='btn-use-data-half _cart' onClick={() => DataLocalUser('set')}>Сохранить записанные данные</button>
							<div className="btn-hr"></div>
							<button className='btn-use-data-half _cart' onClick={() => DataLocalUser('get')}>Использовать сохраненные данные</button>
						</div>
					}
					<form className='cart-form'>
						<label htmlFor='name-input' className='delivery-title _cart input-order'>Введите имя</label>
						<input type="text" id='name-input' className='cart-input _cart' defaultValue={username} onChange ={(e) => setUsername(e.target.value)}/>
						
						<label htmlFor='phone-input' className='input-order delivery-title _cart'>Номер телефона</label>
						{validationPhoneFailed &&(
							<p className='validationEror'>Введите номер телефона</p>
						)}
						<InputMask mask="8(999) 999-99-99" class="cart-input _cart" type="text" id="phone-input" value={phone} onChange ={(e) => setPhone(e.target.value.replace(/\D/g, ""))}/>
					</form>
					<p className='delivery-title _cart'>Самовывоз</p>		
					<p className='delivery-title _cart description-a-take-order'>Вы можете подтвердить заказ и приехать к нам в магазин для оплаты и получения заказа</p>		
					<p className='delivery-title _cart'>Адрес: Ул. Ленина 5А</p>
					<p className='delivery-title _cart'>График:</p>
					<p className='delivery-title _cart'>Пн 08:30–20:00 <br />
						
						Вт 08:30–20:00 <br />
						Ср 08:30–20:00 <br />
						Чт 08:30–20:00 <br />
						Пт 08:30–20:00 <br />
						Сб Выходной<br />
						Вс Выходной <br />
	</p>
					<iframe className='cart__map _cart' src="https://yandex.ru/map-widget/v1/?um=constructor%3A26813f20f39c4e90d9bb358c11190faea4af213cb57baa04cd8c56df455d132e&amp;source=constructor" width="950" height="400" frameBorder="0"></iframe>
					<button className='btn-add-cart send_order' style={{marginTop: 50}} onClick={() => sendOrder()}>Заказать</button>		
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
