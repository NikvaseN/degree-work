import '../../components/normalize.css'
import '../../components/item_change.css'
import axios from '../../axios.js';
import React, {useRef} from 'react';
import plus from '../../img/icons/plus_dark.png'
import time from '../../img/icons/time.png'
import next from '../../img/icons/page-next.png'
import last from '../../img/icons/page-last.png'
import imgLoad from '../../img/icons/load.gif'
import imgRefresh from '../../img/icons/refresh.png'
import { deleteRecipe, getCompound, cancelRecipe } from './swalRecipes.js';

export default function Recipes({user, reloadComponent, setTargetComp}) {
	const [findedItems, setFindedItems] = React.useState([])
	const [isLoad, setIsLoad] = React.useState(false)
	const nameRef = useRef()

	const search = async () =>{
		const fields = {
			name: nameRef.current.value,
			verified
		}

		await axios.post('/recipe/search', fields).then(res =>{
			setFindedItems([...res.data])
		})
		setIsLoad(true)
		setCurrentPage(1)
	}

	React.useEffect(() =>{
		document.title = "Рецепты"
	}, [])
	
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

	const checkActive = (index) =>{
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

	const [openItems,setOpenItems] = React.useState([])

	const setOpenedItems = async (index) =>{
		let openItemsT = openItems
		let open = false
		for (let i=0; i < openItems.length; i++){
			if(openItems[i] === index){
				open = true
				openItemsT.splice(i,1);
			}
		}
		if(!open){
			openItemsT[openItemsT.length] = index
		}
		setOpenItems([...openItemsT])
	}

	const checkOpenItem = (index) =>{
		for (let i=0; i < openItems.length; i++){
			if(openItems[i] === index){
				return true
			}
		}
		return false
	}

	let listPages = []
	const pushPages = () =>{
		if(findedItems){
			for (let i = 1; i <= pages; i++) {
				listPages.push(
				currentPage === i ? 
				<button className="pagination__controls target-page" onClick={() => setCurrentPage(i)}>{i}</button>
				:
				<button className="pagination__controls" onClick={() => setCurrentPage(i)}>{i}</button>
				)
			}
		}
	}

	pushPages()

	const [verified, setVerified] = React.useState(true)

	const changeTarget = async (status, e) =>{
		if(status !== verified){
			let btns = document.getElementsByClassName('favorites-btn')

			setVerified(status)

			for(let i=0; i<btns.length; i++){
				btns[i].classList.remove("focus");
			}
	
			e.target.classList.add("focus");
			
		}
	}

	const changeRecipe = (obj) => {
		const recipe = {
			action: 'change',
			recipe: obj
		}
		window.localStorage.setItem('recipe', JSON.stringify(recipe))
		setTargetComp('recipes_create')
	}

	const acceptRecipe = (obj) => {
		const recipe = {
			action: 'accept',
			recipe: obj
		}
		window.localStorage.setItem('recipe', JSON.stringify(recipe))
		setTargetComp('recipes_create')
	}

	React.useEffect(()=>{
		setIsLoad(false)
		search()
	}, [verified])

	return (
		<div className='container'>
			{/* <Header/> */}
			<div className="empty-header-admin"></div>
			<button className='invert btn-component-refresh' onClick={reloadComponent}>
				<img src={imgRefresh} alt="" width={40} height={40}/>
			</button>
			<div className='accounts-title'>
				<p style={{fontSize : 36}} >Рецепты</p>
				<div onClick={() => setTargetComp('recipes_create')}>
					<h2>Создать</h2>
					<img src={plus} alt="" className="btn-plus"/>
				</div>
			</div>
			<div className="hr" style={{ marginBottom: 40}}></div>
			<div className="search-items">
				<input className='search-items__input' type="text" onKeyDown={handleKeyDown} ref={nameRef} placeholder='Введите название или ингредиент'/>
				<button className='search-items__btn' onClick={() => search()}>Найти</button>
			</div>
			<div className="favorites-navbar list" style={{width: '64.5%', maxWidth: 1200, gap: "2%", marginLeft: 10, marginTop: -30}}>
				<div className="btn-add-cart favorites-btn focus" onClick={(e) => changeTarget(true, e)}>Утвержденные</div>
				<div className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(false, e)}>Предложенные</div>
			</div>
			{(isLoad ?
			<>
			{(findedItems).map((obj, index) => (
				checkActive(index) &&(
				!checkOpenItem(index) ? (
					<div key={obj._id} className="history-item admin recipes" style={{ userSelect:'none' }} onClick={() => setOpenedItems(index)}>
						<p id='recipe_name'>{obj.name}</p>
						<p id='recipe_ingredients'>{verified ? getCompound(obj.ingredients) : obj?.composition}</p>
						{/* <div className="repeat admin-accept _full" onClick={(e) => changeStatus(e, obj)}>status</div> */}
					</div>
				):(
					<div key={obj._id} className="history-item open" style={{ userSelect:'none' }} onClick={() => setOpenedItems(index)}>
						<div className="history-item-title recipes">
							<p>{obj?.name}</p>
							<div className='flex-center'>
								<img src={time} alt="" width={25} height={25} style={{marginRight: 5}}/>
								<p>{obj?.time ? `${obj.time} мин` : 'Неизвестно'}</p>
							</div>
							
						</div>
						<div className="hr-medium" style={{marginBottom: 10}}></div>
						<div style={{width: '100%'}}>
							<b>Состав:</b>
							<div className='recipe-block__ingredients'>
								
								<p>{verified ?
									(obj?.ingredients && getCompound(obj.ingredients)):
									(obj?.composition)}
								</p>
							</div>
							<p style={{margin: '30px 0px 10px 0px', fontWeight: 800}}>Шаги приготовления:</p>
							<div className='recipe-block__steps'>
								{verified ?
								(obj?.steps.map((obj, i) =>(
									<div className='recipe-block__steps__item'>
										<p>{i + 1})</p>
										<p>{obj}</p>
									</div>))):
								(obj?.method)
								}
							</div>
						</div>
						<div className="hr-medium"></div>
						<div className="price-box">
							{verified ?
							(<>
								<button className="btn-repeat" onClick={() => deleteRecipe(obj, reloadComponent)}>Удалить</button>
								<button className="btn-repeat" onClick={() => changeRecipe(obj)}>Редактировать</button>
							</>):
							(<>
								<button className="btn-repeat" onClick={() => cancelRecipe(obj, reloadComponent)}>Отказать</button>
								<button className="btn-repeat" onClick={() => acceptRecipe(obj)}>Добавить</button>
							</>)
							}
							
						</div>
					</div>
			))))}
			{findedItems?.length > 0 ?
			<div className="pagination">
				<div className="pagination__nav">
					<div className="pagination__prev-actions pagination__page-list">
						<button className="pagination__controls" onClick={() => setCurrentPage(1)}><img src={last} alt="select" width={15}  style={{ transform: 'rotate(180deg)'}}/></button>
						<button className="pagination__controls" onClick={pagePrev}><img src={next} alt="select" width={20} style={{ transform: 'rotate(180deg)'}}/></button>
					</div>
					<div className="pagination__prev-actions pagination__page-list">
					{listPages}
					</div>
					<div className="pagination__prev-actions pagination__page-list">
						<button className="pagination__controls" onClick={pageNext}><img src={next} alt="select" width={20}/></button>
						<button className="pagination__controls" onClick={() => setCurrentPage(pages)}><img src={last} alt="select" width={15} height={15}/></button>
					</div>
				</div>

				<div className="pagination__page-size">
					<label htmlFor="page-size">Page size:</label>
					<input type="number" className="page-size__input" id="page-size" defaultValue='4' onChange ={(e) => setItemsOnPag(parseInt(e.target.value), setCurrentPage(1))}/>
				</div>
			</div>
			:
			<h2>Ничего не найдено</h2>
			}
			</>
			:
			<img src={imgLoad} alt="" />
		)}
		</div>
	);
  };
