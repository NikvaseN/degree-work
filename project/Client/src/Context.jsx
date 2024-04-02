import React, { createContext, useState } from 'react';
import axios from './axios.js'
import { useLocation } from 'react-router-dom';

// Context
export const Context = createContext();

// Функция для обертки родительного компонента
export const ContextProvider = ({ children }) => {

	const [user, setUser] = useState(null);
	const [isLoad, setIsLoad] = useState(false);
	const [quantityCart, setQuantityCart] = useState(0);

	const location = useLocation();
	const hideList = ['/confectioner']
	const hide = hideList.includes(location.pathname)

	const getUser = async () =>{
		await axios.get('/auth/me').then(res=>{
			setUser(res.data)
			setIsLoad(true)
		})
		.catch(err =>{
			setIsLoad(true)
		})
	}

	React.useEffect(()=>{
		if(!hide){
			const token = window.localStorage.getItem('token')
			if(token && !user){
				getUser()
			}
			else{
				setIsLoad(true)
			}
		}
	}, [])

	return (	
		// Обертываем дочерние компоненты в провайдер контекста
		<Context.Provider value={{ quantityCart, setQuantityCart, user, setUser, isLoad }}>
			{children}
		</Context.Provider>
	);
};