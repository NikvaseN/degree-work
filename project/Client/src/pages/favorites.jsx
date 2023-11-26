import '../components/normalize.css'
import '../components/favorites.css'
import React from 'react';
import axios from '../axios.js';
export default function Favorites() {
	const [user, setUser] = React.useState()
	const [favorites, setFavorites] = React.useState([])
	const getUser = async () =>{

		// user
		await axios.get('/auth/me').then(res =>{
			setUser(res.data)
		}).catch()


		// data favorites
		await axios.get('/like').then(res =>{
			setFavorites(res.data)
		}).catch()

	}

	React.useEffect(()=>{
		document.title = "Избранное"
		getUser ()
	}, [])

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

	let main = []
	main.push(
		user&& (
			(favorites).map((obj, index)=>(
				obj.product &&
					filter(obj) && 
					(
						<div className="favorotes-item">
							<img src={`${process.env.REACT_APP_IMG_URL}${obj.product.imageUrl}`} alt="img" height={200}/>
							<div className="favorites-item-text">
								<p className='favorite-title'>{obj.product.name}</p>
								<div className="favorite-composition"><p>Состав: {obj.product.composition}</p></div>
								<p className='favorite-price'>{obj.product.price}  ₽</p>
							</div>
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
