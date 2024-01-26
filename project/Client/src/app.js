import React, {useState} from 'react';
import {Routes, Route, useLocation} from "react-router-dom";

import * as Pages from './imports/imports_pages.js'
import {Header, Footer} from './imports/imports_components.js'

export default function App() {

	// Чтобы на странице /courier не отображался header и footer
	const location = useLocation();
	const hideList = ['/courier', '/admin', '/staff']
	const hide = hideList.includes(location.pathname)

	return (
		<>
		{!hide && <Header/> }
		<div style={{minHeight: "calc(100vh - 75px)"}}>
		<Routes>
			<Route path='/' element = {<Pages.Catalog/>}/>

			<Route path='/cakes' element = {<Pages.Cakes/>}/>
			<Route path='/candies' element = {<Pages.Candies/>}/>
			<Route path='/ice-cream' element = {<Pages.Ice_cream/>}/>
			<Route path='/desserts' element = {<Pages.Desserts/>}/>

			<Route path='/cart' element = {<Pages.Cart/>}/>
			<Route path='/history' element = {<Pages.History/>}/>
			<Route path='/favorites' element = {<Pages.Favorites/>}/>
			<Route path='/profile' element = {<Pages.Profile/>}/>

			<Route path='/admin' element = {<Pages.Admin/>}/>
			<Route path='/courier' element = {<Pages.Courier/>}/>
			<Route path='/staff' element = {<Pages.LogInStaff/>}/>
			
			<Route path='*' element = {<Pages.ER404/>}/>
	 	</Routes>
		</div>
		 {!hide && <Footer/> }
		</>
)};
