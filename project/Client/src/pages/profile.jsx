import { useEffect, useState, useContext, useRef} from "react"
import '../components/courier_profile.css'
import '../components/normalize.css'
import axios from '../axios.js'
import load from "../img/icons/delivery.gif"
import Swal from "sweetalert2"
import human from '../img/icons/human.png'
import phone from '../img/icons/phone.png'
import birthday from '../img/icons/birthday.png'
// import work from '../img/icons/work.png'
// import plus from '../img/icons/plus.png'
// import default_profile from '../img/icons/default_profile.jpg'
import { formatDate, formatPhoneNumber, escapeHtml} from "../components/functions.jsx"
import { Context } from "../context.js"
import sad from '../img/icons/sad-anxious.gif';

export default function Profile () {
	const {user, isLoad} = useContext(Context);

	useEffect(() =>{
		document.title = "Профиль"
	}, [])


	const sendChangedFields = async (formValues) =>{
		if (formValues) {

			// Добавление в объект result поля из формы, которые были изменены
			let result = {};
			Object.keys(formValues).forEach(key => {
				if (key === "password" && formValues[key] === "") {
					return;
				}
				if (user[key] !== formValues[key]) {
					result[key] = formValues[key];
				}
			});
			
			// Были ли изменения
			if (result && Object.values(result).length >= 1) {

				let changes = '';
				Object.keys(result).forEach(key =>{
					let prevValue = user[key]
					if (key === "password") {
						prevValue = '**********'
					}
					changes += `<span style='margin-right:20px'>${escapeHtml(prevValue)}</span> 🠖 <span style='margin-left:20px'>${escapeHtml(result[key])}</span><br><br>`
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
					await axios.patch('/profile', result).then(() =>{
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
							errs.forEach((obj) => str += '- ' +  obj.msg + '<br><br>')
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
				  `<input id="swal-input1" value="${escapeHtml(user.fullName)}" class="swal2-input"> <br>` +
				  '<label for="swal-input2">Телефон</label>' +
				  `<input id="swal-input2" value="${escapeHtml(user.phone)}" class="swal2-input"> <br>` +
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
		sendChangedFields(formValues)
	}

	const startDeleting = async () =>{
		Swal.fire({
			title: 'Вы уверены, что хотите удалить аккаунт?',
			text: "После удаления все данные об аккаунте будут стерты",
			icon: 'warning',
			showCancelButton: true,
			reverseButtons: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да',
		}).then(async (res) =>{
			if(res.isConfirmed){
				try{
					const { value: formValues } = await Swal.fire({
						title: 'Удаление аккаунта',
						html:
						  '<h3>Подтвердите свои данные</h3>' +
						  '<label for="swal-input2">Телефон</label>' +
						  `<input id="swal-input2" class="swal2-input"> <br>` +
						  '<label for="swal-input3" style="margin: 0px 6px">Пароль</label>' +
						  `<input id="swal-input3" class="swal2-input"> <br>`,
						focusConfirm: false,
						preConfirm: () => {
							return {
								phone: document.getElementById('swal-input2').value,
								password: document.getElementById('swal-input3').value,
							}
						}
					})
					if (formValues.phone === user.phone){
						await axios.post('/profile/delete', {password: formValues.password})
							.then(res =>{
								Swal.fire(
									'Успешно!',
									'Аккаунт удален',
									'success'
								)
								window.location.reload()
							})
							.catch(err =>{
								let errs = err.response.data
								let str = '';
								if (errs.length >= 1) {
									errs.forEach((obj) => str += '- ' +  obj.msg + '<br><br>')
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
					}
					else{
						Swal.fire(
							'Ошибка!',
							'Неправильно введен номер телефона',
							'error'
						)
					}
					
				} catch {
					Swal.fire(
						'Ошибка!',
						'Что-то пошло не так',
						'error'
					)
				}
			}
		})	
			// Форма
			
	}

	const [showRecipeForm, setShowRecipeForm] = useState(false)
	const suggestRecipe = () =>{
		setShowRecipeForm(!showRecipeForm)
	}

	const textAreaAdjust = (el) => {
		// Проверка того, что высота areatext не будет уменьшатся
		if (el.scrollHeight - 20 > 64){
			el.style.height = "64px";
			el.style.height = (el.scrollHeight - 25)+"px";
		}
	}

	const recipeNameRef = useRef()
	const recipeCompositionRef = useRef()
	const recipeMethodRef = useRef()
	const checkboxProneRef = useRef()

	const sendRecipe = async (e) => {
		e.preventDefault()
		Swal.fire({
			title: 'Отправить',
			text: "Вы уверены ?",
			icon: 'question',
			showCancelButton: true,
			// reverseButtons: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да',
		}).then(async (res) =>{
			if(res.isConfirmed){
				try{
					const fields = {
						user: user._id, 
						phone: checkboxProneRef.current.checked ? null : user.phone,
						name: recipeNameRef.current.value,
						composition: recipeCompositionRef.current.value,
						method: recipeMethodRef.current.value,
					}
					await axios.post('/recipe', fields).then(res =>{
						Swal.fire(
							'Успешно!',
							'Рецепт отправлен',
							'success'
						)

						recipeNameRef.current.value = ''
						recipeCompositionRef.current.value = ''
						recipeMethodRef.current.value = ''
						checkboxProneRef.current.checked = false
						suggestRecipe()
					}).catch(err =>{
						let errs = err.response.data
						let str = '';
						if (errs.length >= 1) {
							errs.forEach((obj) => str += '- ' +  obj.msg + '<br><br>')
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
				} catch {
					Swal.fire(
						'Ошибка!',
						'Что-то пошло не так',
						'error'
					)
				}
			}
		})	
	}

	return (
		isLoad ?
			user ?
			<div className='container overflow-hidden'>
				<div className="empty-header"></div>
				<div className="profile-block" style={{marginTop: 20}}>
					<div onClick={startChanging} className="change-profile">Редактировать</div>
					<div onClick={startDeleting} className="change-profile _delete">Удалить</div>
					<div className="courier-balance">Баллы: {user.balance}</div>
					<h2>Профиль</h2>
					{/* <div className="orders-info-block">
						<p>Активных заказов: <span>{stats && stats.active}</span></p>
						<p>Выполненных заказов: <span>{stats && stats.ended}</span></p>
					</div> */}
					<div className="user-info-block">
						<img src={human} alt="" width={25} height={25}/>
						<p>Имя: <span style={{marginLeft: 10}}>{user.fullName}</span></p>
					</div>
					<div className="user-info-block">
						<img src={phone} alt="" width={25} height={25}/>
						<p>Телефон: <span style={{marginLeft: 10}}>{user.phone && formatPhoneNumber(user.phone)}</span></p>
					</div>
					{/* <div className="user-info-block">
						<img src={birthday} alt="" width={25} height={25}/>
						<p>Дата рождения: </p>
						<p>{user.birthday ? formatDate(user.birthday, 'D-M-Y') : <button>123</button>}</p>
					</div> */}
					<div className="user-info-block">
						<img src={birthday} alt="" width={22} height={22}/>
						<p>Дата регистрации: </p>
						<p>{user.createdAt && formatDate(user.createdAt, 'D-M-Y')}</p>
					</div>
				</div>
				<div className="profile-block suggest-recipe" style={{marginTop: 50}}>
					<button onClick={suggestRecipe} style={{width: '100%'}}><h3 style={{marginBottom: 10}}>Предложить рецепт</h3></button>
					<div className="suggest-recipe__form_block" style={{width: '100%', height: showRecipeForm ? 'max-content' : 0, paddingTop: showRecipeForm ? 30 : 0}}>
						<form className="suggest-recipe__form" onSubmit={(e) => sendRecipe(e)}>
							<label htmlFor="name">Название</label>
							<input ref={recipeNameRef} id="name" type="text" style={{width: '60%', color: 'white', borderBottom: '1px solid #F8F8F8', textAlign: 'center', marginBottom: 20}}/>
							<label htmlFor="composition">Состав</label>
							<textarea ref={recipeCompositionRef} name="composition" id="composition" className="suggest-recipe__form__textarea" onKeyUp={(e) => textAreaAdjust(e.target)}></textarea>
							<label htmlFor="method">Рецепт</label>
							<textarea ref={recipeMethodRef}  name="method" id="method" className="suggest-recipe__form__textarea" onKeyUp={(e) => textAreaAdjust(e.target)}></textarea>
							<p style={{fontSize : 15, width: '80%', textAlign : 'justify'}}>После отправки рецепта, если нас заинтересует ваш рецепт и мы захотим узнать подробнее, то мы вам позвоним. Если же вы не хотите, чтобы вам звонили, нажмите на кнопку «Не уточнять»</p>
							<div className="checkbox-rect">
								<input ref={checkboxProneRef} className="checkbox-pop" type="checkbox" id="checkbox"/>
								<label htmlFor="checkbox"><span></span>Не уточнять</label>
							</div>
							<button type="submit" className="suggest-recipe__form__submit">Отправить</button>
						</form>
					</div>
				</div>
			</div>
			:
			
			<>
				<div className="empty-header"></div>
				<div className='empty-history-block'>
					<img src={sad} alt="" style={{marginLeft: -80}}/>
					<p style={{fontSize : 30, textAlign: 'center'}}>Войдите в аккаунт!<br /></p>
				</div>
			</>
				
		:

		<div className='container'>
			<img src={load} alt="load" width={'200px'} height={'200px'}/>
		</div>
	)
}