import '../components/normalize.css'
import '../components/favorites.css'
import '../components/item_add.css'
import plus from '../img/icons/plus.png'
import React from 'react';
import axios from '../axios.js';
import Swal from 'sweetalert2';

export default function Item_add() {
	const [user, setUser] = React.useState()
	React.useEffect(()=>{
		document.title = "Добавить товар"
		axios.get('/auth/me').then(res =>{
			setUser(res.data)
		})
	}, [])
	const candies = '6378712c2dc9c0dfd59e467b'
	const cakes = '637871432dc9c0dfd59e467d'
	const ice_cream = '6378714a2dc9c0dfd59e467f'
	const dessert = '637871512dc9c0dfd59e4681'
	const [target, setTarget] = React.useState(0)
	const [name, setName] = React.useState('Название')
	const [price, setPrice] = React.useState(0)
	const [composition, setComposition] = React.useState('')
	const changeTarget = (category, e) =>{
		let btns = document.getElementsByClassName('favorites-btn')
		setTarget(category)
		for(let i=0; i<btns.length; i++){
			btns[i].classList.remove("focus");
		}
		e.target.classList.add("focus");
	}

	// Пробел после тысяч
	// const setprice = (e) =>{
	// 	let price = e.target.value
	// 	price = parseInt(price)
	// 	price = price.toLocaleString('ru-RU')
	// 	if(price === "не число"){
	// 		price = 0
	// 	}
	// 	setPrice(price)
	// }

	// Файлы
	const inputFileRef = React.useRef(null)
	const [imageUrl, setImageUrl] = React.useState('');
	const handleChangeFule = async (event) => {
		try{
			const formData = new FormData();
			const file = event.target.files[0]
			formData.append('image', file);
			let category = 'cakes'
			const { data } = await axios.post('/uploads', formData, category); 
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
		let category = target 
		const fields = {
			name, price, category, composition, imageUrl
		}
		// if(name === 'Название' || price === 0 || category === 0 || composition === '' || imageUrl === ''){
		// 	Swal.fire('Ошибка!','Заполните все поля','error')
		// }
		// else{
			await axios.post('/products', fields).then(() => 
			Swal.fire(
				'Успешно!',
				'Товар успешно добавлен.',
				'success'
			)).catch(err =>{
				let data = err.response.data
				let errors = data.map((obj, index) => index === 0 ? obj.msg : `<br>` + obj.msg)
				Swal.fire('Ошибка!', `${errors}`,'error')
			}
			)
		// }
	}
	return (
		<div className='container'>
		<div className="empty-header-admin"></div>
		{user&&
		(user.role === 'moderator' || user.role === 'admin') &&(
			<main className='item-add_container'>
			<p style={{fontSize : 36}}>Добавить товар</p>
			<div className="hr"></div>
			<div className="favorites-navbar" style={{marginTop: -30}}>
				<div for='cakes' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(cakes, e)}>Торты</div>
				<div for='candies' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(candies, e)}>Конфеты</div>
				<div for='ice_cream' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(ice_cream, e)}>Мороженое</div>
				<div for='dessert' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(dessert, e)}>Десерты</div>
			</div>
            <div className='item-add__form'>
				<label for='name-input'>Название:</label>		
				<input type="text" id='name-input' placeholder='Введите название' className='item-add__input' onChange ={(e) => setName(e.target.value)}/>
			</div>
            <div className='item-add__form'>
                <label for='price-input'>Цена:</label>		
				<input type="number" id='price-input' placeholder='Введите цену' className='item-add__input price' onChange ={(e) => setPrice(Number(e.target.value))}/>
                <h3>руб.</h3>
			</div>
			<textarea className='add-item_composition' name="composition" id="composition" cols="30" rows="10" placeholder='Введите состав' onChange ={(e) => setComposition(e.target.value)}></textarea>
            <div className="item-cake">
							<div className='add-itme-img-block' onClick={() => inputFileRef.current.click()}>
								{imageUrl ?(
									<img  alt="" width='100%' height='100%'  src={`${process.env.REACT_APP_IMG_URL}${imageUrl}`}/>

								) : (
									<img className='add-itme-img' src={plus} alt="" width='30%'/>
								)}
							</div>
							<div className="item-box">
								<div className="text-box">
									{name === ''?(
                                         <p>Название</p>
                                    ):(
                                        <p>{name}</p>
                                    )}
									<p>{price.toLocaleString()} ₽</p>
								</div>
							</div>	
						</div>
					<input ref={inputFileRef} hidden type="file" id="upload" onChange={handleChangeFule}/>
					<div className="btn-add-cart add-btn-save" onClick={save} style={{marginBottom: 50}}>Сохранить</div>
					</main>

		)}
		</div>
	);
};
