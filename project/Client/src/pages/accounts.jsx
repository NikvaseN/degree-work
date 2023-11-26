import Header from '../components/header.jsx';
import '../components/normalize.css'
import {formatDate} from '../components/functions.jsx'
import {downloadTable} from '../components/download.jsx'
import '../components/item_change.css'
import '../components/table.css'
import axios from '../axios.js';
import React from 'react';
import { io } from 'socket.io-client';
import {useNavigate } from 'react-router-dom';
import accept from '../img/icons/accept.png'
import cancel from '../img/icons/cancel.png'
import close from '../img/icons/close.png'
import pen from '../img/icons/pen.png'
import imgOnline from '../img/icons/green-circle.png'
import imgOffline from '../img/icons/red-circle.png'
import plus from '../img/icons/plus_dark.png'
import next from '../img/icons/page-next.png'
import last from '../img/icons/page-last.png'
import swal from 'sweetalert2';

export default function Accounts({setTargetComponent, user, reloadComponent}) {
	const navigate = useNavigate ()

	const [findedItems, setFindedItems] = React.useState([])
	const [name, setName] = React.useState('')
	const [online, setOnline] = React.useState()


	const search = async (current) =>{
		let fields = {
			name
		}
		let Ttarget
		if (current){
			Ttarget = current
		}
		else{
			Ttarget = target
		}
		if (Ttarget !== 'all'){
			fields = {
				name,
				role: Ttarget
			}
		}
		
		await axios.post('/accounts/search', fields).then(res =>{
			setFindedItems([...res.data])
		})

	}
	
	React.useEffect(() =>{
		document.title = "Аккаунты"
		search()
	}, [])
	
	const deleteItem = async (obj) =>{
		swal.fire({
			title: 'Удалить?',
			text: "Вы собираетесь УДАЛИТЬ:",
			html: 
				`<p style='color: black'>Имя:  ${obj.fullName}</p><br>` +
				`<p style='color: black'>Телефон:  ${obj.phone}</p><br>` +
				`<p style='color: black'>Заказов:  ${obj.orderCount}</p><br>` +
				`<p style='color: black'>Роль:  ${obj.role === 'courier' ? 'Курьер': obj.role === 'user' ? 'Пользователь' : obj.role === 'admin' ? 'Администратор' : obj.role}</p><br>` +
				`<p style='color: black'>Регистрация:  ${formatDate(obj.createdAt, 'D.M.Y')}</p><br>`,
			icon: 'warning',
			showCancelButton: true,
			reverseButtons: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да',
		}).then(async (res) =>{
			if(res.isConfirmed){

				const { value: formValues } = await swal.fire({
					title: `Подтверждение!`,
					html:
					  `<h3>Повторите следующий номер, чтобы удалить аккаунт</h3> <br>` +
					  `<h5 style='color: red'>${obj.phone}</h5>` +
					  `<input id="swal-input1"class="swal2-input"><br>`,
					focusConfirm: false,
					icon: 'warning',
					preConfirm: () => {
					  return document.getElementById('swal-input1').value
					}
				})

				if(formValues) {
					if(formValues === obj.phone) {
						await axios.delete(`/accounts/${obj._id}`).then(() =>{
							swal.fire(
								'Успешно!',
								'Аккаунт успешно удален.',
								'success'
							)
							reloadComponent()
						}
						).catch((err) =>{
							let errs = err.response.data
							let str = '';
							if (errs.length >= 1) {
								errs.map((obj) => str += '- ' +  obj.msg + '<br><br>')
							}
							else{
								str = err.response.data.msg
							}
							swal.fire(
								'Ошибка!',
								str,
								'error'
							)
						})
					}
					else{
						swal.fire(
							'Ошибка!',
							'Номера телефонов не совпали',
							'error'
						)
					}
				}
				
			}
		}
		)
	}

	const [socket, setSocket] = React.useState()

	React.useEffect(()=>{
		const socket = io(process.env.REACT_APP_API_HOST)

		socket.on('couriers-count', (count) =>{
			setOnline(count)
		})

		// При изменени статуса заказа, убирать заказ из прошлого статуса и добавить в новый
		socket.on('change-status', (prevStatus, status) =>{	
			// setUp()
		})

		socket.on('connect', () => {
			socket.emit('couriers-count-get');
			socket.emit('join-room', 'admin');
		});

		setSocket(socket)
		
		return () =>{
			socket && socket.close()
		}
	}, [])

	const cheackOnline = (id) =>{
		if (online){
			let isOnline = online.some(obj => obj.user._id === id)
			if (isOnline) {
				return <img src={imgOnline} alt="" width={20}/>
			}
			else{
				return <img src={imgOffline} alt="" width={20}/>
			}
		}
		else{
			return <img src={imgOffline} alt="" width={20}/>
		}
		
	}

	const tableDownload = async () =>{
		let data = await axios.post('/accounts/search', {name: ''})
		downloadTable(data.data)
	}

	const sendChangedFields = async (obj, formValues) =>{
		if (formValues) {

			// Добавление в объект result поля из формы, которые были изменены
			let result = {};
			Object.keys(formValues).map(key => {
				if (key === "password" && formValues[key] === "") {
					return;
				}
				if (key === "birthday") {

					let objBirthday = formatDate(obj.birthday, 'D.M.Y')
					if (objBirthday === formValues[key]){
						return;
					}
					else{
						result[key] = formValues[key];
					}
				}
				if (obj[key] !== formValues[key]) {
					result[key] = formValues[key];
				}
			});
			
			// Были ли изменения
			if (result && Object.values(result).length >= 1) {

				let changes = '';
				Object.keys(result).map(key =>{
					let prevValue = obj[key]
					if (key === "password") {
						prevValue = '**********'
					}
					if (key === "birthday") {
						prevValue = formatDate(obj[key], 'D.M.Y')
					}
					changes += `<span style='margin-right:20px'>${prevValue}</span> 🠖 <span style='margin-left:20px'>${result[key]}</span><br><br>`
				})

				// Подтверждение
				swal.fire({
					title: 'Изменить?',
					text: "Вы собираетесь изменить:",
					html: 
						`<p style='color: black'>${changes}</p>`,
					icon: 'question',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					cancelButtonText: 'Нет',
					confirmButtonText: 'Да'
				}).then(async (res) => {

					//* Отправка изменений на сервер
					if (res.isConfirmed) {
						await axios.patch(`/accounts/${obj._id}`, result).then(() =>{
							swal.fire(
								'Успешно!',
								'Аккаунт успешно обновлен.',
								'success'
							)
							reloadComponent()
						}
						).catch((err) =>{
							let errs = err.response.data
							let str = '';
							if (errs.length >= 1) {
								errs.map((obj) => str += '- ' +  obj.msg + '<br><br>')
							}
							else{
								str = err.response.data.msg
							}
							swal.fire(
								'Ошибка!',
								str,
								'error'
							)
						})
					}
				})
			}
		}
	}
	const startChanging = async (obj) =>{
		if(obj.role === 'courier'){
			// Форма
			const { value: formValues } = await swal.fire({
				title: 'Редактировать акканут',
				html:
				  '<label for="swal-input1" style="margin: 0px 15px">Имя</label>' +
				  `<input id="swal-input1" value="${obj.fullName}" class="swal2-input"> <br>` +
				  '<label for="swal-input2">Фамилия</label>' +
				  `<input id="swal-input2" value="${obj.surname}" class="swal2-input"> <br>` +
				  '<label for="swal-input3">Отчество</label>' +
				  `<input id="swal-input3" value="${obj.patronymic}" class="swal2-input"> <br>` +
				  '<label for="swal-input4">Телефон</label>' +
				  `<input id="swal-input4" value="${obj.phone}" class="swal2-input"> <br>` +
				  '<label for="swal-input5" style="margin: 0px 10px">Город</label>' +
				  `<input id="swal-input5" value="${obj.city}" class="swal2-input"> <br>` +
				  '<label for="swal-input6" style="margin: 0px 8px">Улица</label>' +
				  `<input id="swal-input6" value="${obj.street}" class="swal2-input"> <br>` +
				  '<label for="swal-input7" style="margin: 0px 13px">Дом</label>' +
				  `<input id="swal-input7" value="${obj.house}" class="swal2-input"> <br>` +
				  '<label for="swal-input8" style="margin: 0px -3px">Квартира</label>' +
				  `<input id="swal-input8" value="${obj.apartment}" class="swal2-input"> <br>` +
				  '<label for="swal-input9" style="margin: 0px 6px">Пароль</label>' +
				  `<input id="swal-input9" class="swal2-input"> <br>` +
				  '<label for="swal-input10" style="margin: 0px -22px">Дата рождения</label>' +
				  `<input id="swal-input10" value="${formatDate(obj.birthday,'D.M.Y')}" class="swal2-input"> <br>`,
				focusConfirm: false,
				preConfirm: () => {
				  return {
					fullName: document.getElementById('swal-input1').value,
					surname: document.getElementById('swal-input2').value,
					patronymic: document.getElementById('swal-input3').value,
					phone: document.getElementById('swal-input4').value,
					city: document.getElementById('swal-input5').value,
					street: document.getElementById('swal-input6').value,
					house: document.getElementById('swal-input7').value,
					apartment: document.getElementById('swal-input8').value,
					password: document.getElementById('swal-input9').value,
					birthday: document.getElementById('swal-input10').value
				  }
				}
			})
			sendChangedFields(obj, formValues)
		}
		else{
			const { value: formValues } = await swal.fire({
				title: 'Редактировать акканут',
				html:
				  '<label for="swal-input1" style="margin: 0px 15px">Имя</label>' +
				  `<input id="swal-input1" value=${obj.fullName} class="swal2-input"> <br>` +
				  '<label for="swal-input2">Телефон</label>' +
				  `<input id="swal-input2" value=${obj.phone} class="swal2-input"> <br>` +
				  '<label for="swal-input3" style="margin: 0px 6px">Пароль</label>' +
				  `<input id="swal-input3" class="swal2-input"> <br>`,
				focusConfirm: false,
				preConfirm: () => {
					return {
						fullName: document.getElementById('swal-input1').value,
						phone: document.getElementById('swal-input2').value,
						password: document.getElementById('swal-input3').value,
					}
				}
			})

			sendChangedFields(obj, formValues)
		}
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
		  search();
		}
	};

	const [target, setTarget] = React.useState('all')

	const changeTarget = (current, e) =>{
		let btns = document.getElementsByClassName('favorites-btn')
		setTarget(current)
		for(let i=0; i<btns.length; i++){
			btns[i].classList.remove("focus");
		}
		e.target.classList.add("focus");
		search(current)
	}

	let main = []
	const setMain = () =>{
		main.push(

			(findedItems).map((obj, index) => (
				target === 'courier' ? (
					<tr key={obj._id}>
						<td className='table-username'>{obj.role === 'courier' ? (`${obj.surname} ${obj.fullName[0]}. ${obj.patronymic[0]}.`) : obj.fullName}</td>
						<td className='table-phone'>{obj.phone}</td>
						<td className='table-amount-orders'>{obj.orderCount}</td>
						<td className='table-birthday'>{obj.role === 'courier' ? formatDate(obj.birthday, 'D.M.Y') : '-'}</td>
						<td>{obj.role === 'courier' ? `г. ${obj.city} ул. ${obj.street} д. ${obj.house} кв. ${obj.apartment}` : '-'}</td>
						<td className='table-created'>{formatDate(obj.createdAt, 'D.M.Y')}</td>
						<td className='table-status'>{cheackOnline(obj._id)}</td>
						<td className='table-balance'>{obj.role === 'courier' ? obj.balance : '-'}</td>
						<td className='table-edit'>
							<div className="table-edit-block">
								<img onClick={() => startChanging(obj)} className='change-account' src={pen} alt=""/>
								<img onClick={() => deleteItem(obj)} className='change-account' src={cancel} alt=""/>
							</div>
						</td>
					</tr>
					)
					:
					(
						<tr key={obj._id}>
							<td>{obj.fullName}</td>
							<td>{obj.phone}</td>
							<td>{obj.orderCount}</td>
							<td>{obj.role === 'courier' ? 'Курьер': obj.role === 'user' ? 'Пользователь' : obj.role === 'admin' ? 'Администратор' : obj.role}</td>
							<td>{formatDate(obj.createdAt, 'D.M.Y')}</td>
							<td>
								<div className="table-edit-block">
									{obj.role !== 'admin' &&
										<>
											<img onClick={() => startChanging(obj)} className='change-account' src={pen} alt=""/>
											<img onClick={() => deleteItem(obj)} className='change-account' src={cancel} alt=""/>
										</>
									}
								</div>
							</td>
						</tr>
					)
			))
				
		)
	}
	setMain ()
	return (
		<div className='container'>
			<div className="inside-container">
			{/* <Header/> */}
			<div className="empty-header-admin"></div>
			{user&&
				<>
				<div className='accounts-title'>
					<p style={{fontSize : 36}} >Аккаунты</p>
					<div onClick={() => setTargetComponent('accountsCreate')}>
						<h2>Создать</h2>
						<img src={plus} alt="" className="btn-plus"/>
					</div>
				</div>
				<div className="hr"></div>
				<div className="favorites-navbar" style={{marginTop: -40, marginBottom: 30, gap:20}}>
					<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('all', e)}>Все</div>
					<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('user', e)}>Пользователи</div>
					<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('courier', e)}>Курьеры</div>
				</div>
				<div className="search-items">
					<input className='search-items__input' type="text" onKeyDown={handleKeyDown} onChange ={(e) => setName(e.target.value)} placeholder='Введите фио или телефон'/>
					<button className='search-items__btn' onClick={() => search()}>Найти</button>
				</div>
				{/* Таблица */}
				<div className="tbl-header">
					<table cellPadding="0" cellSpacing="0" border="0">
					<thead>
						<tr>
							{target === 'courier' ?
							<>
								<th className='table-username'>Имя</th>
								<th className='table-phone'>Телефон</th>
								<th className='table-amount-orders'>Кол-во заказов</th>
								<th className='table-birthday'>Дата рождения</th>
								<th>Адрес проживания</th>
								<th className='table-created'>Присоединился</th>
								<th className='table-status'>Онлайн</th>
								<th className='table-balance'>Баланс</th>
								<th className='table-edit'>Редактировать</th>
							</>
							:
								<>
									<th>Имя</th>
									<th>Телефон</th>
									<th>Кол-во заказов</th>
									<th>Роль</th>
									<th>Присоединился</th>
									<th style={{paddingRight:30}}>Редактировать</th>
								</>
							}
							
						</tr>
					</thead>
					</table>
				</div>
				<div className="tbl-content">
					<table cellPadding="0" cellSpacing="0" border="0">
					<tbody>
						{main}
					</tbody>
					</table>
				</div>
				<div className="accounts-stats-block">
					<p>Найдено записей: {findedItems && findedItems.length}</p>
					<button onClick={tableDownload}>Скачать</button>
				</div>
				</>
			}
			</div>
		</div>
	);
  };
