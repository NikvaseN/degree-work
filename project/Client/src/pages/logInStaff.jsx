import { useContext, useEffect} from 'react'
import '../components/admin.css'
import '../components/courier.css'
import AuthBlock from './authBlock.jsx'
import { Context } from '../context.js'
import { useNavigate } from 'react-router-dom'

export default function LogInStaff() {
	const {user, isLoad} = useContext(Context);	
	const navigate = useNavigate()
	const routes = {
		'courier': '/courier',
		'admin': '/admin',
	}

	useEffect(() => {
		if(user && user.role){
			if (Object.keys(routes).includes(user.role)) {
				navigate(routes[user.role]);
			} else {
				navigate('/');
			}
		}
		
	  }, [user]);

	return(
		isLoad && !user && <AuthBlock/>
	)
}