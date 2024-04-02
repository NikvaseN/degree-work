import {Routes, Route} from "react-router-dom";
import * as Pages from './imports/imports_pages.js'

export default function AppRoutes() {
	return (
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
			<Route path='/confectioner' element = {<Pages.Confectioner/>}/>
			<Route path='/staff' element = {<Pages.LogInStaff/>}/>
			
			<Route path='*' element = {<Pages.ER404/>}/>
		</Routes>
	)
};
