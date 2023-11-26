import Header from '../components/header.jsx';
import '../components/normalize.css'
import '../components/admin.css'
import plus from '../img/icons/plus.png'
import change from '../img/icons/change.png'
import { Link } from 'react-router-dom';
import React from 'react';
export default function Admin_products({setTarget}) {
    return (
		<div className='container'>
			<div className="empty-header-admin" style={{marginTop: 50}}></div>
                <>
                 <h2>Выберите действие</h2>
                 <main className="action">
					<div className="action__block">
						<h3>Добавить</h3>
						<div onClick={() => setTarget('addProducts')} className="action__item add">
							<div className="ground"></div>
							<img src={plus} alt="" width='30%'/>
						</div>
					</div>
					<div className="action__block">
						<h3>Редактировать  / Удалить</h3>
						<div onClick={() => setTarget('changeProducts')} className="action__item remove">
							<div className="ground"></div>
							<img src={change} alt="" width='30%'/>
						</div>
					</div>
                 </main>
                 </>
		</div>
	);
  };
