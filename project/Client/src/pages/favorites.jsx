import '../components/normalize.css'
import '../components/favorites.css'
import React, {useContext} from 'react';
import axios from '../axios.js';
import { Context } from '../Context.jsx';
import close from '../img/icons/close.png'
import Swal from 'sweetalert2';
import { Toast } from '../components/swal.js';

export default function Favorites() {
	const [favorites, setFavorites] = React.useState([])
	const {user, setUser, isLoad, setQuantityCart} = useContext(Context);

	const getData = async () =>{
		// data favorites
		await axios.get('/like').then(res =>{
			setFavorites(res.data)
		}).catch()
	}

	React.useEffect(()=>{
		if(isLoad){
			document.title = "Избранное"
			getData()
		}
	}, [isLoad])

	const candies = '6378712c2dc9c0dfd59e467b'
	const cakes = '637871432dc9c0dfd59e467d'
	const ice_cream = '6378714a2dc9c0dfd59e467f'
	const dessert = '637871512dc9c0dfd59e4681'
	const [target, setTarget] = React.useState(0)
	const changeTarget = (category, e) =>{
		let btns = document.getElementsByClassName('favorites-btn')
		if(target === category){
			// e.target.style.transform = 'scale(1)'
			setTarget(0)
			e.target.classList.remove("focus");
		}
		else{
			setTarget(category)
			for(let i=0; i<btns.length; i++){
				btns[i].classList.remove("focus");
			}
			e.target.classList.add("focus");
		}
		
	}
	const filter = (obj) =>{
		if(target === 0 || target === obj.product.category){
			return true
		}
		else{
			return false
		}
		
	}

	const addItem = (product, value) =>{
		try {
			let cart = JSON.parse(localStorage.getItem('cart')) || [];
			let existingItem = cart.find(item => item.product._id === product._id);
			
			if (existingItem) {
				existingItem.value += value;
			} else {
				cart.push({ product, value });
			}
			setQuantityCart(prev => prev + 1);
        	localStorage.setItem('cart', JSON.stringify(cart));
			
			Toast.fire({
				icon: "success",
				title: "Товар добавлен в корзину",
				position:'top-start'
			});
		} 	
		catch (error) {
			console.error(error)
			Toast.fire({
				icon: "error",
				title: "Что-то пошло не так"
			});
		}
	}

	const removeItem = async(id) => {
		const filteredItems = favorites.filter(item => item.product?._id !== id);
		setFavorites(filteredItems);
		await axios.post(`/like`, {product: id})
	};

	let main = []
	main.push(
		user&& (
			(favorites).map((obj, index)=>(
				obj.product &&
					filter(obj) && 
					(
						<div className="favorotes-item _favorites">
							<img src={`${import.meta.env.VITE_IMG_URL}${obj.product.imageUrl}`} alt="img" height={200}/>
							<div className="favorites-item-text">
								<p className='favorite-title'>{obj.product.name}</p>
								<div className="favorite-composition"><p>Состав: {obj.product.composition}</p></div>
								<p className='favorite-price'>{obj.product.price}  ₽</p>
							</div>
							<button className='close-item-cart __favorites' onClick={() => removeItem(obj.product._id)}><img src={close} alt="" width={30} height={30}/></button>
							<button className="btn-repeat _favorites" onClick={() => addItem(obj.product, 1)}>Добавить</button>
						</div>
					)
			))
		)
	)
	return (
		<div className='container'>
			 <title>Избранное</title>
			<div className="empty-header"></div>
			<p style={{fontSize : 36}}>Избранное</p>
			<div className="hr hr-favorites"></div>
			<div className="favorites-navbar">
				<div for='cakes' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(cakes, e)}>Торты</div>
				<div for='candies' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(candies, e)}>Конфеты</div>
				<div for='ice_cream' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(ice_cream, e)}>Мороженое</div>
				<div for='dessert' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(dessert, e)}>Десерты</div>
			</div>
			<div className="favorites-items">
				{main}
			</div>
			
		</div>
	);
  };
