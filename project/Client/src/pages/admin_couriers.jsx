import {useState, useEffect} from 'react';
import '../components/normalize.css'
export default function Admin_couriers(setTarget, reloadComponent) {
	useEffect(()=>{
		document.title = "Курьеры"
	}, [])
	return (
		<div className='container'>
			<div className="empty-header"></div>
			<h2>Text</h2>
		</div>
	);
  };
