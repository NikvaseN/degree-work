import {useLocation} from "react-router-dom";
import {Header, Footer} from './imports/imports_components.js'
import Support from './widgets/Support.jsx'

export default function AppComponents({children}) {

	// Чтобы на страницах не отображался header и footer
	const location = useLocation();
	const listHideHeaderFooter = ['/courier', '/admin', '/staff', '/confectioner']
	const hideHeaderFooter = listHideHeaderFooter.includes(location.pathname)

	const widgetSupportList = ['/profile', '/history']
	const showWidgetSupport = widgetSupportList.includes(location.pathname)
	return (
		<>
		{!hideHeaderFooter && <Header/> }
		{showWidgetSupport && <Support/>}
			<div style={{minHeight: "calc(100vh - 75px)"}}>
				{children}
			</div>
		 {!hideHeaderFooter && <Footer/> }
		</>
)};
