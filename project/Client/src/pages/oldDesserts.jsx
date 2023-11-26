import '../components/normalize.css'
import '../components/desserts.css'
import React from 'react'
import 'react-hook-form'
import first from '../img/cakes/first.png'
import liked_img from '../img/icons/liked.png'
import like from '../img/icons/like.png'
import close from '../img/icons/close.png'
import basket from '../img/icons/basket.png'
import popup from '../img/candies/popup.png'
// import {Link} from "react-router-dom";
import Header from '../components/header.jsx';
export default function Desserts() {
	const popUp = async () =>{
		document.body.style.overflowY = "hidden";
		setOpenPopUp(true)
		setValue(1)
		setPrice(cost)
	}
	const closePopUp = async () =>{
		setOpenPopUp(false);
		document.body.style.overflowY = "visible";
		
	}
	const [openPopUp, setOpenPopUp] = React.useState(false)
	const [value, setValue] = React.useState(1)
	const [price, setPrice] = React.useState(550)
	const [liked, setLiked] = React.useState(false)
	const cost = 550
	const setValueUp = async () =>{
		if(value <100){
			setValue(value + 1)
			setPrice(price + cost)
		}
	}
	const setValueDown = async () =>{
		if(value > 1){
			setValue(value - 1)	
			setPrice(price - cost)
		}
	}
	const checkLike = async () =>{
		if(liked){
			setLiked(false)
		}
		else{
			setLiked(true)
		}
	}
	// const liked_animation = {
	// 	animation: 'like_animation 0.2s ease-in',
	// 	background: 'black',
	// 	width: 100,
	// };
	return (
		<div className='container'>
		{!openPopUp&&(
			<Header/>
		)}
			<div className="header-img desserts"><h1>Десерты</h1></div>
			<div className="main-cakes">
				<div className="items-block-cakes">
					<div className="item-cake">
						<div className='item-img-block-cake'>
							<img src={first} alt="" width='100%' className='item-img-cake'/>
							<img src={basket} alt="" width='160px' height='160px' className='item-basket'/>
							<div className="more" onClick={popUp}>Подробнее</div>
						</div>
						<div className="item-box">
							<div className="text-box">
								<p>Три шоколада</p>
								<p>1 354 ₽</p>

							</div>
							{liked? (
								<div className='liked_animation'><img src={liked_img}  alt="" width='30px' height='30px' onClick={checkLike}/></div>
							):(
								<div><img src={like} alt="" width='30px' height='30px' onClick={checkLike}/></div>
							)}
							
						</div>	
					</div>
					<div className="item-cake">
						<div className='item-img-block-cake'>
							<img src={first} alt="" width='100%' className='item-img-cake'/>
							<img src={basket} alt="" width='160px' height='160px' className='item-basket'/>
							<div className="more" onClick={popUp}>Подробнее</div>
						</div>
						<div className="item-box">
							<div className="text-box">
								<p>Три шоколада</p>
								<p>1 354 ₽</p>
							</div>
							<img src={like} alt="" width='30px' height='30px'/>
						</div></div>
				</div>
				<div className="items-block-cakes">
					<div className="item-cake">
						<div className='item-img-block-cake'>
							<img src={first} alt="" width='100%' className='item-img-cake'/>
							<img src={basket} alt="" width='160px' height='160px' className='item-basket'/>
							<div className="more" onClick={popUp}>Подробнее</div>
						</div>
						<div className="item-box">
							<div className="text-box">
								<p>Три шоколада</p>
								<p>1 354 ₽</p>
							</div>
							<img src={like} alt="" width='30px' height='30px'/>
						</div></div>
					<div className="item-cake">
					<div className='item-img-block-cake'>
							<img src={first} alt="" width='100%' className='item-img-cake'/>
							<img src={basket} alt="" width='160px' height='160px' className='item-basket'/>
							<div className="more" onClick={popUp}>Подробнее</div>
						</div>
						<div className="item-box">
							<div className="text-box">
								<p>Три шоколада</p>
								<p>1 354 ₽</p>
							</div>
							<img src={like} alt="" width='30px' height='30px'/>
						</div></div>
				</div>
			</div>
			{openPopUp&&(
				<>
				<div className="popup" onClick={closePopUp}>
					
				</div>
				<div className="popup-item">
					<button className='popup-close' onClick={closePopUp}><img src={close} alt="" width='28' height='28'/></button>
					<img src={popup} alt="" />
					<h2 className='title-popup' style={{ fontSize : 32}}>Конфеты</h2>
					<h3>Состав: сахар, орехи</h3>
					<h3>Стоимость: <span style={{marginRight:'15px'}}></span> {price} ₽</h3>
					<div className="quantity-items">
						<button style={{ fontSize : 40, marginTop:-10}} onClick={setValueDown}>-</button>
						<p>{value}</p>
						{/* <input type="text" defaultValue={value} onChange ={(e) => setPag(e.target.value)}/> */}
						<button style={{ fontSize : 40, marginTop:-2} } onClick={setValueUp} >+</button>
					</div>
					<button className='btn-add-item'><p>Добавить в корзину</p></button>
				</div>
				</>
			)}
			
		</div>
	);
  };
