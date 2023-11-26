import '../components/normalize.css'
import '../components/catalog.css'
import React from 'react';
import {Link} from "react-router-dom";
import cake from '../img/cakes/cakes.png'
import dessert from '../img/dessert/dessert.png'
import ice_cream from '../img/ice-cream/ice-cream.png'
import candies from '../img/candies/candies.png'
import Header from '../components/header.jsx';
export default function Catalog() {
	React.useEffect(()=>{
		document.title = "Главная"
	}, [])
	return (
		<div className='container'>
			{/* <Header/> */}
			<div className="header-img catalog"><h1>Candy Store</h1></div>
			<div className="hide-popUp">
				<div className="main-catalog">
					<div className="items-block">
						<Link to='/cakes' className="item item1"><img src={cake} alt="cake" width='100%' height='100%' /><p className='pos-abs'>ТОРТЫ</p></Link>
						<Link to='/ice-cream'className="item item2"><img src={ice_cream} alt="cake" width='100%' height='100%' /><p className='pos-abs'>МОРОЖЕНОЕ</p></Link>
					</div>
					<div className="items-block">
						<Link to='/candies' className="item item3"><img src={candies} alt="cake" width='100%' height='100%' /><p className='pos-abs'>КОНФЕТЫ</p></Link>
						<Link to='/desserts' className="item item4"><img src={dessert} alt="cake" width='100%' height='100%' /><p className='pos-abs'>ДЕСЕРТЫ</p></Link>
					</div>
				</div>
			</div>
		</div>
	);
  };
