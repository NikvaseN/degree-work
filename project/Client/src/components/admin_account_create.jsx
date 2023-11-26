import '../components/normalize.css'
import '../components/form.css'
import './admin_account_create.css'
import React, {useState} from 'react';
import axios from '../axios.js'
import InputMask from 'react-input-mask';
import swal from 'sweetalert2';
import plus from '../img/icons/plus.png'
import pencil from '../img/form/pencil.png'
import place from '../img/form/place.png'
import imgPhone from '../img/form/phone.png'
import imgPassword from '../img/form/password.png'
import Swal from 'sweetalert2';

export default function Admin_account_create() {

	React.useEffect(()=>{
		document.title = "Создать аккаунт"
	}, [])

	const [target, setTarget] = React.useState(0)
	const [name, setName] = React.useState('')
	const [surname, setSurname] = React.useState('')
	const [patronymic, setPatronymic] = React.useState('')
	const [phone, setPhone] = React.useState()
	const [city, setCity] = React.useState()
	const [street, setSteet] = React.useState()
	const [house, setHouse] = React.useState()
	const [apartment, setApartment] = React.useState()
	const [password, setPassword] = React.useState()
	const [birthday, setBirthday] = React.useState()

	const changeTarget = (category, e) =>{
		let btns = document.getElementsByClassName('favorites-btn')
		setTarget(category)
		for(let i=0; i<btns.length; i++){
			btns[i].classList.remove("focus");
		}
		e.target.classList.add("focus");
	}
	const errsToStr = (err) =>{
		
		let errs = err.response.data
		let str = ''
		if (errs.length >= 1) {
			errs.map((obj) => str = str + '- '+  obj.msg + '<br><br>')
		}
		else{
			str = err.response.data.msg
		}
		return str
	}
	const reviseDate = (origData) =>{
		try{
			const data = origData.split('.');
			return `${data[2]}-${data[1]}-${data[0]}`;
		}
		catch{
			return null
		}
	} 

	// Аватар
	const inputFileRef = React.useRef(null)
	const [imageUrl, setImageUrl] = React.useState();
	const handleChangeFule = async (event) => {
		try{
			const formData = new FormData();
			const file = event.target.files[0]
			formData.append('image', file);
			const { data } = await axios.post('/uploads', formData); 
			setImageUrl(data.url)

		} catch (err) {
			console.warn(err);
			Swal.fire(
				'Ошибка!',
				'Допустимы только файлы типов JPEG, JPG, PNG, GIF',
				'error'
			)
		}
	}

	const save = async () =>{
		let phoneStr
		if(phone){
			phoneStr = phone.replace(/\D/g, "")
		}
		else{
			swal.fire("Заполните все поля:", '- Телефон', "error");
		}
		let fields
		if (target === 'courier'){
			fields ={
				fullName: name,
				surname,
				patronymic,
				phone: phoneStr,
				city,
				street,
				house,
				apartment,
				password,
				imageUrl,
				birthday: reviseDate(birthday)
			}
		}
		else{
			fields ={
				fullName: name,
				phone: phoneStr,
				password,
			}
		}
		
		let path = false
		switch (target){
			case ('user'):
				path = '/auth/register'
				break
			case ('courier'):
				path = '/couriers'
				break
		}
		if(path){
			await axios.post(path, fields).then(() =>
				swal.fire("Аккаунт успешно создан", '', "success")
			).catch((err) =>{
				swal.fire("Заполните все поля:", errsToStr(err), "error")
			})
		}
		// let category = target 
		// const fields = {
		// 	name, price, category, composition, imageUrl
		// }
		// if(name === 'Название' || price === 0 || category === 0 || composition === '' || imageUrl === ''){
		// 	alert('Заполните все поля ❌')
		// }
		// else{
		// 	await axios.post('/products', fields).then(() => alert('Успешно ✅')).catch(err =>{
		// 		let data = err.response.data
		// 		let errors = data.map((obj, index) => index == 0 ? 'Заполните все поля ❌' + '\n\n' + obj.msg : '\n\n' + obj.msg)
		// 		alert(errors)
		// 	}
		// 	)
		// }
	}
	return (
		<div className='container'>
		<div className="empty-header-admin"></div>
			<main className='item-add_container'>
				<p style={{fontSize : 36}}>Создать аккаунт</p>
				<div className="hr hr-favorites"></div>
				<div className="favorites-navbar">
					<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('user', e)}>Пользователь</div>
					<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget('courier', e)}>Курьер</div>
				</div>
					<div class="form">
						<form action="" class="form-booking">
							<div class="form-item">
								<img src={pencil} alt="" width="20px"/>
								<input class="form-input" type="text" id="username" placeholder="Введите имя" onChange ={(e) => setName(e.target.value)}/>
								<hr/>
							</div>
							{target === 'courier' &&
							<>
								<div class="form-item">
									<img src={pencil} alt="" width="20px"/>
									<input class="form-input" type="text" placeholder="Введите фамилию" onChange ={(e) => setSurname(e.target.value)}/>
									<hr/>
								</div>
								<div class="form-item">
									<img src={pencil} alt="" width="20px"/>
									<input class="form-input" type="text" id="patronymic" placeholder="Введите отчество" onChange ={(e) => setPatronymic(e.target.value)}/>
									<hr/>
								</div>
							</>
							}
							<div class="form-item">
								<img src={imgPhone} alt="" width="23px"/>
								<InputMask mask="8(999) 999-99-99" class="form-input" type="text" id="phone" placeholder="Введите телефон" onChange ={(e) => setPhone(e.target.value)}/>
								<hr/>
							</div>
							<div class="form-item">
								<img src={imgPassword} alt="" width="23px"/>
								<input class="form-input" type="text" id="password" placeholder="Введите пароль" onChange ={(e) => setPassword(e.target.value)}/>
								<hr/>
							</div>
							{target === 'courier' &&
								<>
									<div class="form-item">
										<img src={place} alt="" width="20px"/>
										<InputMask mask="99.99.9999" class="form-input" type="text" id="bithday" placeholder="Введите дату рождения" onChange ={(e) => setBirthday(e.target.value)}/>
										<hr/>
									</div>
									<div class="form-item">
										<img src={place} alt="" width="20px"/>
										<input class="form-input" type="text" id="city" placeholder="Введите город" onChange ={(e) => setCity(e.target.value)}/>
										<hr/>
									</div>
									<div class="form-item">
										<img src={place} alt="" width="20px"/>
										<input class="form-input" type="text" id="street" placeholder="Введите улицу" onChange ={(e) => setSteet(e.target.value)}/>
										<hr/>
									</div>
									<div class="form-item">
										<img src={place} alt="" width="20px"/>
										<input class="form-input" type="text" id="house" placeholder="Введите дом" onChange ={(e) => setHouse(e.target.value)}/>
										<hr/>
									</div>
									<div class="form-item">
										<img src={place} alt="" width="20px"/>
										<input class="form-input" type="text" id="apartment" placeholder="Введите квартиру" onChange ={(e) => setApartment(e.target.value)}/>
										<hr/>
									</div>
									<div className='add-avatar-block' onClick={() => inputFileRef.current.click()}>
										{imageUrl ?(
											<img  alt="" width='200px' height='200px' src={`${process.env.REACT_APP_IMG_URL}${imageUrl}`}/>

										) : (
											<img className='add-itme-img' src={plus} alt="" width='30%'/>
										)}
									</div>
									<input ref={inputFileRef} hidden type="file" id="upload" onChange={handleChangeFule}/>
								</>
							}
							<div className='result-block'>
								<h3>{target === 'courier' ? 'Курьер': 'Пользователь'}</h3>
								<div className="result-block-item">
									<p>ФИО: </p>
									<p className='result-block-value'>{target === 'courier' ? (`${surname} ${name && name[0]}. ${patronymic && patronymic[0]}.`) : name}</p>
								</div>
								<div className="result-block-item">
									<p>Телефон: </p>
									<p className='result-block-value'>{phone}</p>
								</div>
								{target === 'courier' &&
								<>
								<div className="result-block-item">
									<p>Дата рождения: </p>
									<p className='result-block-value'>{birthday}</p>
								</div>
								<div className="result-block-item adress result-block-value">
									<p>Адресс: </p>
									{(city && street && house && apartment) &&
									<>
										{/* <p>{`г. ${city} ул. ${street} д. ${house} кв. ${apartment}`}</p> */}
										<p className='result-block-value'>{`г. ${city}`}</p>
										<p className='result-block-value'>{`ул. ${street}`}</p>
										<p className='result-block-value'>{`д. ${house} кв. ${apartment}`}</p>
									</>
									}
								</div>
								</>
								}
							</div>
							<div className="btn-add-cart add-btn-save" onClick={save} style={{marginBottom: 50, marginLeft: 'calc(50% - 100px)'}}>Сохранить</div>
						</form>
					</div>
			</main>
		</div>
	);
  };
