import Header from '../components/header.jsx';
import '../components/normalize.css'
import '../components/item_change.css'
import axios from '../axios.js';
import React from 'react';
import accept from '../img/icons/accept.png'
import cancel from '../img/icons/cancel.png'
import close from '../img/icons/close.png'
import pen from '../img/icons/pen.png'
import next from '../img/icons/page-next.png'
import last from '../img/icons/page-last.png'
import imgLoad from '../img/icons/load.gif'
import imgRefresh from '../img/icons/refresh.png'
import Swal from 'sweetalert2';
import { escapeHtml } from '../components/functions.jsx';

export default function Item_change({reloadComponent}) {

	const [findedItems, setFindedItems] = React.useState([])
	const [isLoad, setIsLoad] = React.useState(false)
	const [name, setName] = React.useState('')
	const [user, setUser] = React.useState()


	const search = async () =>{
		const fields = {
			name
		}

		await axios.post('/products/search', fields).then(res =>{
			setFindedItems([...res.data])
		})
		setIsLoad(true)
		setCurrentPage(1)
	}
	const access = (user) =>{
		if(user)
		if(user.role === 'moderator' || user.role === 'admin'){
			return true
		}
		else{
			console.log(user)
			console.log('false')
			reloadComponent()
		}
	}
	
	React.useEffect(() =>{
		document.title = "Редактирование"
		axios.get('/auth/me').then(res =>{
			access(res.data)
			setUser(res.data)
		})
		search()
	}, [])
	
	const deleteItem = async (index) =>{
		let item = findedItems[index]
		Swal.fire({
			title: 'Удалить?',
			text: "Вы собираетесь удалить:",
			html: 
				`<p style='color: black'>
					<span style='margin-right:20px'>${escapeHtml(item.name)}</span>  <span style='margin-left:20px'>${escapeHtml(item.price)} ₽</span>
					<br><br>
				</p>`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да'
		}).then(async (res) => {

			//* Отправка изменений на сервер
			if (res.isConfirmed) {
				await axios.delete(`/products/${item._id}`).then(res => {
					Swal.fire(
						'Успешно!',
						'Товар удален',
						'success'
					)
					reloadComponent()
				})
				.catch((err) =>{
					Swal.fire(
						'Ошибка!',
						'Что-то пошло не так',
						'error'
					)
				})
			}
		})
	}

	const checkModerator = () => {
		if(user) if(user.role === 'moderator' || user.role === 'admin'){
			return true
		}
			return false
	}

	// id открытого для изменения товара
	const [changing, setChanging] = React.useState();
	const [changedName, setChangedName] = React.useState();
	const [changedPrice, setChangedPrice] = React.useState();
	const [changedComposition, setChangedComposition] = React.useState();

	const cheackChanging = (id) =>{
		if (checkModerator() && changing === id){
			return true
		}
		return false
	}
	
	const startChanging = (id, obj) =>{
		if (checkModerator() && changing !== id){
			setChanging(id)

			// При редактирование, чтобы название и цена сразу записывались
			setChangedName(obj.name)
			setChangedPrice(obj.price)
			setChangedComposition(obj.composition)
		}
		else{
			setChanging()
		}
	}

	const sendChangedItem = async (obj) =>{
		const name = changedName;
		const price = changedPrice;
		const composition = changedComposition;
		
		let fields = {
			name, price, composition
		}

		Swal.fire({
			title: 'Изменить?',
			text: "Вы собираетесь изменить:",
			html: 
				`<p style='color: black'>
					<span style='margin-right:20px'>${escapeHtml(obj.name)}</span> 🠖 <span style='margin-left:20px'>${escapeHtml(name)}</span>
					<br><br>
					<span style='margin-right:20px'>${escapeHtml(obj.composition)}</span> 🠖 <span style='margin-left:20px'>${escapeHtml(composition)}</span>
					<br><br>
					<span style='margin-right:20px'>${escapeHtml(obj.price)} ₽</span> 🠖 <span style='margin-left:20px'>${escapeHtml(price)} ₽</span>
				</p>`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'Нет',
			confirmButtonText: 'Да'
		}).then(async (res) => {

			//* Отправка изменений на сервер
			if (res.isConfirmed) {
				await axios.patch(`/products/${obj._id}`, fields).then(res => {
					Swal.fire(
						'Успешно!',
						'Изменения приняты',
						'success'
					)
					reloadComponent()
				})
				.catch((err) =>{
					Swal.fire(
						'Ошибка!',
						'Что-то пошло не так',
						'error'
					)
				})
			}
		})
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
		  search();
		}
	};

	// Пагинация
	const [itemsOnPage, setItemsOnPag] = React.useState(4);
	const [currentPage, setCurrentPage] = React.useState(1);

	let pages 
	let length = findedItems.length

	if(itemsOnPage >= 1){
		pages = Math.ceil(length / itemsOnPage)
	}
	else{
		setItemsOnPag(1)
	}

	const cheackActive = (index) =>{
		let firstItem = (currentPage - 1) * itemsOnPage
		if (index >= firstItem && index < firstItem + itemsOnPage){
			return true
		}
		return false
	}

	const pageNext = () =>{
		if(currentPage !== pages){
			setCurrentPage((el) => el + 1)
		}
	}
	const pagePrev = () =>{
		if(currentPage > 1){
			setCurrentPage((el) => el - 1)
		}
	}

	let listPages = []
	const pushPages = () =>{
		if(findedItems){
			for (let i = 1; i <= pages; i++) {
				listPages.push(
				currentPage === i ? 
				<button class="pagination__controls target-page" onClick={() => setCurrentPage(i)}>{i}</button>
				:
				<button class="pagination__controls" onClick={() => setCurrentPage(i)}>{i}</button>
				)
			}
		}
	}
	pushPages()

	let main = []
	const setMain = () =>{
		main.push(

			(findedItems).map((obj, index) => (
				cheackActive(index)&&
				<div className="cart-item">
				<img src={`${process.env.REACT_APP_IMG_URL}${obj.imageUrl}`} alt="" width={383} height={260}/>
				<div className="cart-item-text item-change">
					{cheackChanging(index) ? 
					(
						<>
							<input style={{fontSize : 30, marginTop:15}} className='change-item-input' type="text" defaultValue={obj.name} onChange ={(e) => setChangedName(e.target.value)}/> 
							<input style={{marginBottom : 60, marginTop: 45}} className='change-item-input' type="text" defaultValue={obj.composition} onChange ={(e) => setChangedComposition(e.target.value)}/> 
							<input className='change-item-input' type="text" defaultValue={obj.price} onChange ={(e) => setChangedPrice(e.target.value)}/> 
						</>
					) : 
					(
						<>
							<h2 style={{fontSize : 30, marginTop:15}}>{obj.name}</h2>
							<h3 style={{marginBottom : 60, marginTop: 45}}>Состав: <span>{obj.composition}</span></h3>
							<h3>{obj.price.toLocaleString()} ₽</h3>
						</>
					)}
						
					</div>

					{cheackChanging(index) ? 
					(
						<>
						<button className='change-item-accept btn-item_change' onClick={() => sendChangedItem(obj)}><img src={accept} alt="" width='26' height='26'/></button>
						<button className='change-item btn-item_change' onClick={() => startChanging(index, obj)}><img src={cancel} alt="" width='28' height='28'/></button>
						</>
					) 
					: 
					(
						<button className='change-item btn-item_change' onClick={() => startChanging(index, obj)}><img src={pen} alt="" width='28' height='28'/></button>
					)}

				<button className='close-item-cart' onClick={() => deleteItem(index)}><img src={close} alt="" width='28' height='28'/></button>
			</div>
			))
				
		)
	}
	setMain ()
	return (
		<div className='container'>
			{/* <Header/> */}
			<div className="empty-header-admin"></div>
			<button className='invert btn-component-refresh' onClick={reloadComponent}>
				<img src={imgRefresh} alt="" width={40} height={40}/>
			</button>
			<h1 style={{fontSize : 36}} >Редактирование</h1>
			<div className="hr"></div>
			<div className="search-items">
				<input className='search-items__input' type="text" onKeyDown={handleKeyDown} onChange ={(e) => setName(e.target.value)} placeholder='Введите название или ингредиент'/>
				<button className='search-items__btn' onClick={() => search()}>Найти</button>
			</div>

			{(isLoad ?
			<>
			{main}
			<div class="pagination">
				<div class="pagination__nav">
					<div class="pagination__prev-actions pagination__page-list">
						<button class="pagination__controls" onClick={() => setCurrentPage(1)}><img src={last} alt="select" width={15}  style={{ transform: 'rotate(180deg)'}}/></button>
						<button class="pagination__controls" onClick={() => pagePrev()}><img src={next} alt="select" width={20} style={{ transform: 'rotate(180deg)'}}/></button>
					</div>
					<div class="pagination__prev-actions pagination__page-list">
					{listPages}
					</div>
					<div class="pagination__prev-actions pagination__page-list">
						<button class="pagination__controls" onClick={() => pageNext()}><img src={next} alt="select" width={20}/></button>
						<button class="pagination__controls" onClick={() => setCurrentPage(pages)}><img src={last} alt="select" width={15} height={15}/></button>
					</div>
				</div>

				<div class="pagination__page-size">
					<label for="page-size">Page size:</label>
					<input type="number" class="page-size__input" id="page-size" defaultValue='4' onChange ={(e) => setItemsOnPag(parseInt(e.target.value), setCurrentPage(1))}/>
				</div>
			</div>
			</>
			:
			<img src={imgLoad} alt="" />
		)}
		</div>
	);
  };
