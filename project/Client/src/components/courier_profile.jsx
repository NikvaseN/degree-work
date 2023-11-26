import { useEffect, useState, useRef} from "react"
import './courier_profile.css'
import axios from '../axios.js'
import load from "../img/icons/delivery.gif"
import Swal from "sweetalert2"
import human from '../img/icons/human.png'
import phone from '../img/icons/phone.png'
import birthday from '../img/icons/birthday.png'
import work from '../img/icons/work.png'
import plus from '../img/icons/plus.png'
import default_profile from '../img/icons/default_profile.jpg'
import { formatDate, formatPhoneNumber } from "./functions.jsx"

export default function Courier_Profile ({user, rolled, mobile, reloadComponent}) {
	const [stats, setStats] = useState()
	const [isLoad, setIsLoad] = useState(false)

	const start = async() =>{
		document.title = "Профиль"
		await axios.get('/courier/stats').then(res =>{
			setStats(res.data)
			setIsLoad(true)
		}).catch(() => setIsLoad(true))
	} 

	useEffect(() =>{
		start()
	}, [])

	// Аватар
	const inputFileRef = useRef(null)
	const [imageUrl, setImageUrl] = useState();
	const handleChangeFule = async (event) => {
		try{
			const formData = new FormData();
			const file = event.target.files[0]
			formData.append('image', file);
			const { data } = await axios.post('/uploads', formData); 
			await axios.patch('/courier/avatar', {imageUrl: data.url})
			window.location.reload();
		} catch (err) {
			console.warn(err);
			Swal.fire(
				'Ошибка!',
				'Допустимы только файлы типов JPEG, JPG, PNG, GIF',
				'error'
			)
		}
	}

	const sendChangedFields = async (formValues) =>{
		if (formValues) {

			// Добавление в объект result поля из формы, которые были изменены
			let result = {};
			Object.keys(formValues).map(key => {
				if (key === "password" && formValues[key] === "") {
					return;
				}
				if (key === "birthday") {

					let objBirthday = formatDate(user.birthday, 'D.M.Y')
					if (objBirthday === formValues[key]){
						return;
					}
					else{
						result[key] = formValues[key];
					}
				}
				if (user[key] !== formValues[key]) {
					result[key] = formValues[key];
				}
			});
			
			// Были ли изменения
			if (result && Object.values(result).length >= 1) {

				let changes = '';
				Object.keys(result).map(key =>{
					let prevValue = user[key]
					if (key === "password") {
						prevValue = '**********'
					}
					if (key === "birthday") {
						prevValue = formatDate(user[key], 'D.M.Y')
					}
					changes += `<span style='margin-right:20px'>${prevValue}</span> 🠖 <span style='margin-left:20px'>${result[key]}</span><br><br>`
				})

				// Подтверждение
				Swal.fire({
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

					const { value: formValues } = await Swal.fire({
						title: 'Введите свой пароль!',
						html:
						  '<label for="swal-password" style="margin: 0px 15px">Пароль</label>' +
						  `<input id="swal-password" type="password" class="swal2-input"> <br>`,
						focusConfirm: false,
						preConfirm: () => {
							return {
								password: document.getElementById('swal-password').value,
							}
						}
					})
					result['prevPassword'] = formValues.password
					await axios.patch('/courier/profile', result).then(() =>{
						Swal.fire(
							'Успешно!',
							'Аккаунт успешно обновлен.',
							'success'
						)
						window.location.reload()
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
						Swal.fire(
							'Ошибка!',
							str,
							'error'
						)
					})
					
				})
			}
		}
	}

	const startChanging = async () =>{
			// Форма
			const { value: formValues } = await Swal.fire({
				title: 'Редактировать акканут',
				html:
				  '<label for="swal-input1" style="margin: 0px 15px">Имя</label>' +
				  `<input id="swal-input1" value="${user.fullName}" class="swal2-input"> <br>` +
				  '<label for="swal-input2">Фамилия</label>' +
				  `<input id="swal-input2" value="${user.surname}" class="swal2-input"> <br>` +
				  '<label for="swal-input3">Отчество</label>' +
				  `<input id="swal-input3" value="${user.patronymic}" class="swal2-input"> <br>` +
				  '<label for="swal-input4">Телефон</label>' +
				  `<input id="swal-input4" value="${user.phone}" class="swal2-input"> <br>` +
				  '<label for="swal-input5" style="margin: 0px 10px">Город</label>' +
				  `<input id="swal-input5" value="${user.city}" class="swal2-input"> <br>` +
				  '<label for="swal-input6" style="margin: 0px 8px">Улица</label>' +
				  `<input id="swal-input6" value="${user.street}" class="swal2-input"> <br>` +
				  '<label for="swal-input7" style="margin: 0px 13px">Дом</label>' +
				  `<input id="swal-input7" value="${user.house}" class="swal2-input"> <br>` +
				  '<label for="swal-input8" style="margin: 0px -3px">Квартира</label>' +
				  `<input id="swal-input8" value="${user.apartment}" class="swal2-input"> <br>` +
				  '<label for="swal-input9" style="margin: 0px 6px">Пароль</label>' +
				  `<input id="swal-input9" class="swal2-input"> <br>` +
				  '<label for="swal-input10" style="margin: 0px -22px">Дата рождения</label>' +
				  `<input id="swal-input10" value="${formatDate(user.birthday,'D.M.Y')}" class="swal2-input"> <br>`,
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
		sendChangedFields(formValues)
	}
	return (
		isLoad ?
		<div className='container'>
			<div className="empty-header-admin"></div>
			<div className="profile-block">
				<div onClick={startChanging} className="change-profile">Редактировать</div>
				<div className="courier-balance">Баланс: {user.balance} ₽</div>
				<h2>Профиль</h2>
				<div className="orders-info-block">
					<p>Активных заказов: <span>{stats && stats.active}</span></p>
					<p>Выполненных заказов: <span>{stats && stats.ended}</span></p>
				</div>
				<div onClick={() => inputFileRef.current.click()} className="profile-logo-block">
					{user.imageUrl ? 
								<img src={`${process.env.REACT_APP_IMG_URL}${user.imageUrl}`}/>:
								<img src={default_profile} style={{backgroundColor: '#222', border: 'none'}}/>
					}
					<img className="profile-logo-add" src={plus} alt="" style={{width: 80, height: 80}}/>
					<input ref={inputFileRef} hidden type="file" id="upload" onChange={handleChangeFule}/>
				</div>
				<div className="user-info-block">
					<img src={human} alt="" width={25} height={25}/>
					<p>Имя: <span>{user.fullName}</span></p>
					<p>Фамилия: <span>{user.surname}</span></p>
					<p>Отчество: <span>{user.patronymic}</span></p>
				</div>
				<div className="user-info-block">
					<img src={phone} alt="" width={25} height={25}/>
					<p>{user.phone && formatPhoneNumber(user.phone)}</p>
				</div>
				<div className="user-info-block">
					<img src={birthday} alt="" width={25} height={25}/>
					<p>Дата рождения: </p>
					<p>{user.birthday && formatDate(user.birthday, 'D-M-Y')}</p>
				</div>
				<div className="user-info-block">
					<img src={work} alt="" width={22} height={22}/>
					<p>Дата трудоустройства: </p>
					<p>{user.createdAt && formatDate(user.createdAt, 'D-M-Y')}</p>
				</div>
			</div>
		</div>
		:

		<div className='container'>
			<img src={load} alt="load" width={'200px'} height={'200px'}/>
		</div>
	)
}