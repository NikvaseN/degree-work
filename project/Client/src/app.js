import React, {useState} from 'react';
import {Routes, Route, useLocation} from "react-router-dom";
import ER404 from './pages/404.jsx';
import Catalog from './pages/catalog.jsx';
import Cakes from './pages/cakes.jsx';
import Candies from './pages/candies';
import Cart from './pages/cart.jsx';
import History from './pages/history.jsx';
import Ice_cream from './pages/ice-cream.jsx';
import Desserts from './pages/desserts.jsx';
import Favorites from './pages/favorites.jsx';
import Admin from './pages/admin.jsx';
import Courier from './pages/courier';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';

export default function App() {

	// Чтобы на странице /courier не отображался header и footer
	const location = useLocation();
	const hide = location.pathname === '/courier' || location.pathname === '/admin';

	return (
		<>
		{!hide && <Header/> }
		<div style={{minHeight: "calc(100vh - 75px)"}}>
		<Routes>
			<Route path='/' element = {<Catalog/>}/>
			<Route path='/cakes' element = {<Cakes/>}/>
			<Route path='/candies' element = {<Candies/>}/>
			<Route path='/cart' element = {<Cart/>}/>
			<Route path='/history/' element = {<History/>}/>
			<Route path='/ice-cream' element = {<Ice_cream/>}/>
			<Route path='/desserts' element = {<Desserts/>}/>
			<Route path='/favorites' element = {<Favorites/>}/>
			<Route path='*' element = {<ER404/>}/>
			<Route path='/admin' element = {<Admin/>}/>
			<Route path='/courier' element = {<Courier/>}/>
	 	</Routes>
		</div>
		 {!hide && <Footer/> }
		</>
)};
