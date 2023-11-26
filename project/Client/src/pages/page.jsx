import '../components/normalize.css'
import '../components/cakes.css'
import '../components/pagination.css'
import React from 'react'
import 'react-hook-form'
import axios from '../axios.js';
import liked_img from '../img/icons/liked.png'
import like from '../img/icons/like.png'
import close from '../img/icons/close.png'
import pen from '../img/icons/pen.png'
import accept from '../img/icons/accept.png'
import cancel from '../img/icons/cancel.png'
import basket from '../img/icons/basket.png'
import {useNavigate} from "react-router-dom";
import next from '../img/icons/page-next.png'
import last from '../img/icons/page-last.png'
import {useContext } from 'react';
import {Context} from '../context.js';

// import {Link} from "react-router-dom";
import Header from '../components/header.jsx';
export default function Page({title, category, title_ru, title_header}) {
	const [data, setData] = React.useState('')
	const [user, setUser] = React.useState('')
	const [favorites, setFavorites] = React.useState([])

	// Context для колличества товаров в корзине
	const { quantityCart, setQuantityCart} = useContext(Context);

	// Кол-во тортов
	const [length, setLength] = React.useState(0)
	
	const navigate = useNavigate()
	const getUser = async () =>{

		// user
		await axios.get('/auth/me').then(res =>{
			setUser(res.data)
		}).catch()

		let dataFavorites
		// data favorites
		await axios.get('/like').then(res =>{
			// setDataFavorites(res.data)
			dataFavorites = res.data
		}).catch()

		// set favorites ids
		let favoritesD = dataFavorites.map(like => like.product && like.product._id ? like.product._id : null).filter(id => id !== null);
		setFavorites(favoritesD)
	}
	React.useEffect(() =>{
		import(`../components/${title}.css`)
		document.title = title_ru
		axios.get(`/products/category/${category}`).then(res =>{		
			setLength(res.data.length)
			setData(res.data)
		}).catch()
		getUser ()
		// axios.get(`/favorite/add/${g}`).then(res =>{		
		// 	setLength(res.data.length)
		// 	setData(res.data)
		// }).catch()

	}, [])

	// Кол-во блоков по 2 элемента 
	const lengthBlocks = Math.ceil(length / 2);

	const [product, setProduct] = React.useState()
	const popUp = (data,e) =>{
		e.stopPropagation();
		document.body.style.overflowY = "hidden";
		setOpenPopUp(true)
		setValue(1)
		setPrice(data.price)
		setProduct(data)
	}
	
	const closePopUp = () =>{
		setOpenPopUp(false);
		document.body.style.overflowY = "visible";
		
	}
	
	const [addedItem, setAddedItem] = React.useState(false)
	const [openPopUp, setOpenPopUp] = React.useState(false)
	const [value, setValue] = React.useState(1)
	const [price, setPrice] = React.useState(550)

	const setValueUp = () =>{
		if(value <100){
			setValue((value) => value + 1)
			setPrice(parseInt(price) + parseInt(product.price))
		}
	}
	const setValueDown = () =>{
		if(value > 1){
			setValue((value) => value - 1)	
			setPrice(parseInt(price) - parseInt(product.price))
		}
	}
	
	const [cart, setCart ] = React.useState([])
	if(cart[0] === undefined){
		if(JSON.parse (window.localStorage.getItem ('cart')) !== null){
			setCart(JSON.parse (localStorage.getItem ('cart')))
		}
	}


	const addCart = (product, value) =>{
		let newItemCart = true
		if(cart === undefined){
			let cartT = [{value, product}]
			setCart(cartT)
			setQuantityCart(1)
			
		}
		else{
			let cartT = cart
			for(let i = 0; i < cart.length; i++){
				if(cartT[i].product._id === product._id){
					cartT[i].value = cartT[i].value + value
					newItemCart = false
				}
			}
			if(newItemCart){
				cartT[cart.length] = {value, product}
			}
			setCart(cartT)

			let quantity = cartT.reduce((acc, obj) => acc + obj.value, 0);
			setQuantityCart(quantity)
		}

		window.localStorage.setItem('cart', JSON.stringify(cart))
		closePopUp()
		setAddedItem(true)
		
	}

	const cheackFavorite = (id) =>{
		return favorites.includes(id);
	}

	const favorite = (id, liked) =>{

		if(liked){
			deleteFavorite(id)
		}	
		else{
			addFavorite(id)
		}

	}

	const deleteFavorite = (id) =>{
		let likedT = favorites
		if(favorites.length === 1){
			likedT[0] = ''
		}
		else{
			for(let i=0; i < favorites.length; i++){
				if(id === favorites[i]){
					likedT.splice(i, 1)
					break
				}
			}
		}
		setFavorites([...likedT])

		let product = id
		
		let data = {
			product
		}

		axios.post(`/like`, data);
	}

	const addFavorite = async (id) =>{
		let likedT = favorites
		likedT[favorites.length] = id

		setFavorites([...likedT])

		let product = id

		let data = {
			product
		}

		axios.post(`/like`, data);
	}

	const checkModerator = () => {
		if(user.role === 'moderator' || user.role === 'admin'){
			return true
		}
			return false
	}

	const [changedName, setChangedName] = React.useState();
	const [changedPrice, setChangedPrice] = React.useState();

	// id открытого для изменения товара
	const [changing, setChanging] = React.useState();

	const startChanging = (id, obj) =>{
		if (checkModerator() && changing !== id){
			setChanging(id)

			// При редактирование, чтобы название и цена сразу записывались
			setChangedName(obj.name)
			setChangedPrice(obj.price)
		}
		else{
			setChanging()
		}
	}

	const cheackChanging = (id) =>{
		if (checkModerator() && changing === id){
			return true
		}
		return false
	}


	const sendChangedItem = async (obj) =>{
		const name = changedName;
		const price = changedPrice;
		const category = obj.category._id;
		const composition = obj.composition;
		
		let fields = {
			name, price, category, composition
		}
		if(window.confirm(`Вы действительно хотите изменить "${obj.name} - ${obj.price} ₽" на "${name} - ${price} ₽"`)){
			await axios.patch(`/products/${obj._id}`, fields).then(navigate(0));
		}


	}

	const deleteItem = async (index) =>{
		let item = data[index]
		if(window.confirm(`Вы действительно хотите удалить "${item.name} - ${item.price} ₽"`)){
			await axios.delete(`/products/${item._id}`)
			navigate(0)
		}
	}

	// Пагинация
	const [itemsOnPage, setItemsOnPag] = React.useState(4);
	const [currentPage, setCurrentPage] = React.useState(1);

	let pages 

	if(itemsOnPage >= 1){
		pages = Math.ceil(length / itemsOnPage)
	}
	else{
		setItemsOnPag(1)
	}

	const cheackActive = (index) =>{
		let firstItem = (currentPage - 1) * itemsOnPage
		if (index >= firstItem && index < firstItem + itemsOnPage){
			return true
		}
		return false
	}

	const pageNext = () =>{
		if(currentPage !== pages){
			setCurrentPage((el) => el + 1)
		}
	}
	const pagePrev = () =>{
		if(currentPage > 1){
			setCurrentPage((el) => el - 1)
		}
	}

	let listPages = []
	const pushPages = () =>{
		if(data){
			for (let i = 1; i <= pages; i++) {
				listPages.push(
				currentPage === i ? 
				<button className="pagination__controls target-page" onClick={() => setCurrentPage(i)}>{i}</button>
				:
				<button className="pagination__controls" onClick={() => setCurrentPage(i)}>{i}</button>
				)
			}
		}
	}
	pushPages()
	let mainData = []
	const main =[]
	const mainCakes = () =>{
		if(data){
			let firstItem = 0
			let secondItem = 1
			for(let i = 0; i < lengthBlocks; i++){
				firstItem = i * 2
				secondItem = firstItem + 1
				const itemsToRender = [];
				// mainData[0] = data[firstItem]

				if(firstItem < length){
					itemsToRender.push(data[firstItem]);
				}

				if (secondItem < length) {
					itemsToRender.push(data[secondItem]);
				}
				main.push(
					<>
					<div className="items-block-cakes">
					{itemsToRender.map((obj, index) => (
						cheackActive(index + i * 2) &&
						<div className="item-cake">
							<div className='item-img-block-cake' onClick={() => addCart(obj, 1)}>
								<img src={`${process.env.REACT_APP_IMG_URL}${obj.imageUrl}`} alt="" width='100%' height='100%' className='item-img-cake'/>
								<img src={basket} alt="" width='160px' height='160px' className='item-basket'/>
								
								<div className="more" onClick={(e) => popUp(obj, e)}>Подробнее</div>
							</div>
							<div className="item-box">
								<div className="text-box">
									{cheackChanging(index + i * 2) ? 
									(
										<input className='change-item-input' type="text" defaultValue={obj.name} onChange ={(e) => setChangedName(e.target.value)}/> 
									) : 
									(<p>{obj.name}</p>)}
									{cheackChanging(index + i * 2) ? 
									(
										<input className='change-item-input' type="text" defaultValue={obj.price} onChange ={(e) => setChangedPrice(e.target.value)}/> 
									) : 
									(<p>{obj.price.toLocaleString()} ₽</p>)}
									

								</div>
								{user&&
									checkModerator() &&
									<>
										{cheackChanging(index + i * 2) ? 
										(
											<>
											<button className='change-item-accept' onClick={() => sendChangedItem(obj)}><img src={accept} alt="" width='26' height='26'/></button>
											<button className='change-item' onClick={() => startChanging(index + i * 2, obj)}><img src={cancel} alt="" width='28' height='28'/></button>
											</>
										) 
										: 
										(
											<button className='change-item' onClick={() => startChanging(index + i * 2, obj)}><img src={pen} alt="" width='28' height='28'/></button>
										)}

										<button className='delete-item' onClick={() => deleteItem(index + i * 2)}><img src={close} alt="" width='28' height='28'/></button>
									</>
								}
								{cheackFavorite(obj._id) && user ? (
									<div className='liked_animation cursor like'><img src={liked_img}  alt="" width='30px' height='30px' onClick={() => favorite(obj._id, true)}/></div>
								):(
									<div className='cursor like'><img src={like} alt="" width='30px' height='30px' onClick={() => favorite(obj._id, false)}/></div>
								)}
							
							</div>	
						</div>
				
					))}
					</div>
					</>
				)
			}
			
		}
	}

	mainCakes()
	return (
		<div className='container'>
		{/* {!openPopUp&&(
			<Header/>
		)} */}
			<div className={`header-img ${title}`}><h1>{title_ru}</h1></div>
			
			<div className="main-cakes">
				{main}
			</div>

			<div className="pagination">
                <div className="pagination__nav">
                    <div className="pagination__prev-actions pagination__page-list">
                        <button className="pagination__controls" onClick={() => setCurrentPage(1)}><img src={last} alt="select" width={15}  style={{ transform: 'rotate(180deg)'}}/></button>
                        <button className="pagination__controls" onClick={() => pagePrev()}><img src={next} alt="select" width={20} style={{ transform: 'rotate(180deg)'}}/></button>
                    </div>
                    <div className="pagination__prev-actions pagination__page-list">
                       {listPages}
                    </div>
                    <div className="pagination__prev-actions pagination__page-list">
                        <button className="pagination__controls" onClick={() => pageNext()}><img src={next} alt="select" width={20}/></button>
                        <button className="pagination__controls" onClick={() => setCurrentPage(pages)}><img src={last} alt="select" width={15} height={15}/></button>
                    </div>
                </div>

                <div className="pagination__page-size">
                    <label for="page-size">Page size:</label>
                    <input type="number" className="page-size__input" id="page-size" defaultValue='4' onChange ={(e) => setItemsOnPag(parseInt(e.target.value), setCurrentPage(1))}/>
                </div>
            </div>

			{openPopUp&&(
				<>
				<div className="popup" onClick={closePopUp}>
					
				</div>
				<div className="popup-item">
					<button className='popup-close' onClick={closePopUp}><img src={close} alt="" width='28' height='28'/></button>
					<img src={`${process.env.REACT_APP_IMG_URL}${product.imageUrl}`} alt="" width={383} height={274}/>

					<h2 className='title-popup'>{product.name}</h2>
					<h3 >Состав: {product.composition}</h3>
					<h3>Стоимость: <span style={{marginRight:'15px'}}></span> {price.toLocaleString()} ₽</h3>
					<div className="quantity-items">
						<button style={{ fontSize : 40, marginTop:-10}} onClick={setValueDown}>-</button>
						<p>{value}</p>
						<button style={{ fontSize : 40, marginTop:-2} } onClick={setValueUp} >+</button>
					</div>
					<button className='btn-add-item' onClick={() => addCart(product, value)}><p>Добавить в корзину</p></button>
				</div>
				</>
			)}
		{addedItem && (
			<div className="alert-added-item"></div>
		)}
		
		</div>
	);
  };
