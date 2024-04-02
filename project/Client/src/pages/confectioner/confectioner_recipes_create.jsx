import '../../components/normalize.css'
import '../../components/history.css'
import axios from '../../axios.js';
import React, { useRef, useState, useContext} from 'react';
import { Toast } from '../../components/swal.js';
import pencil from '../../img/form/pencil.png'
import imgTime from '../../img/icons/time.png'
import imgClose from '../../img/icons/close.png'
import back from '../../img/icons/back.png'
import plus from '../../img/icons/plus.png'
import { DragDropContext, Droppable, Draggable  } from 'react-beautiful-dnd';

export default function Recipes_create({goBack, setRecipe, user, reloadComponent}) {
	const [ingredients, setIngredients] = React.useState([])

	React.useEffect(() =>{
		document.title = "Добавить рецепт"
	}, [])

	const nameRef = useRef()
	const timeRef = useRef()
	const сountIngredientRef = useRef()
	const nameIngredientRef = useRef()
	const stepRef = useRef()

	// const candies = '6378712c2dc9c0dfd59e467b'
	// const cakes = '637871432dc9c0dfd59e467d'
	// const ice_cream = '6378714a2dc9c0dfd59e467f'
	// const dessert = '637871512dc9c0dfd59e4681'
	// const [target, setTarget] = React.useState(0)
	const [ingredientsOpen, setIngredientsOpen] = React.useState(false)
	const [stepsOpen, setStepsOpen] = React.useState(false)
	const [steps, setSteps] = React.useState([])
	const [composition, setComposition] = React.useState('')
	// const changeTarget = (category, e) =>{
	// 	let btns = document.getElementsByClassName('favorites-btn')
	// 	setTarget(category)
	// 	for(let i=0; i<btns.length; i++){
	// 		btns[i].classList.remove("focus");
	// 	}
	// 	e.target.classList.add("focus");
	// }

	const handleIngredientsBlock = () => {
		setIngredientsOpen(!ingredientsOpen)
	}

	const handleStepsBlock = () => {
		setStepsOpen(!stepsOpen)
	}

	const addIngredient = (e) => {
		e.preventDefault()
		const name = nameIngredientRef.current.value
		const count = сountIngredientRef.current.value
		if(!name || !count){
			Toast.fire({
				icon: "error",
				title: "Заполните оба поля."
			});
			return
		}
		setIngredients(prev => [...prev, [name, count]])
		nameIngredientRef.current.value = ''
		сountIngredientRef.current.value = ''
		nameIngredientRef.current.focus(); 
	}

	const addStep = (e) => {
		e.preventDefault()
		const step = stepRef.current.value
		if(!step){
			Toast.fire({
				icon: "error",
				title: "Введите шаг приготовления."
			});
			return
		}
		setSteps(prev => [...prev, step])
		stepRef.current.value = ''
		// stepRef.current.focus(); 
	}

	const deteleItem = (obj, func) => {
		func(prev => {
			const updatedSteps = prev.filter(item => item !== obj);
			return updatedSteps;
		});
	}

	const reorder = (list, startIndex, endIndex) => {
		const arr = Array.from(list);
		// Если перестановка в один шаг, то можно просто поменять местами
		if(Math.abs(startIndex - endIndex) === 1){
			const prevVal = arr[startIndex]
			arr[startIndex] = arr[endIndex] 
			arr[endIndex] = prevVal
			return arr;
		}

		// Если объект перетащили вверх
		if(startIndex > endIndex){
			for(let i=endIndex + 1; i <= startIndex; i++){
				arr[i] = list[i - 1]
			}
		}
		// Вниз
		else{
			for(let i=startIndex; i <= endIndex - 1; i++){
				arr[i] = list[i + 1]
			}
		}

		arr[endIndex] = list[startIndex]

		return arr
	  };

	const handlerOnDrag = ({ destination, source }) => {
		if(!source.index && source.index !== 0 || source.index === destination.index){
			return
		}
		setSteps(reorder(steps, source.index, destination.index))
	}

	const save = async () => {
		const fields = {
			name: nameRef.current.value,
			steps,
			ingredients
		}

		const time = timeRef.current.value
		if (time) {fields.time = time}

		console.log(fields)
		await axios.post('http://localhost:4444/confectioner/recipe', fields).then(res => {
			Toast.fire({
				icon: "success",
				title: "Рецепт успешно создан."
			});
			reloadComponent()
		}).catch(err => {
			console.log(err)
		})
	}

	const handlerStepsInputKeyUp = (el) => {
		// Проверка того, что высота areatext не будет уменьшатся
		if (el.scrollHeight - 20 > 30){
			el.style.height = "30px";
			el.style.height = (el.scrollHeight)+"px";
		}
	}

	const handlerStepsInputKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			addStep(e)
		}
	}

	return (
		<div className='container'>
		<div className="empty-header-admin"></div>
		<button className='btn-goBack' onClick={goBack}type="button"><img src={back} alt=""/></button>
			<main className='item-add_container'>
				<h1 style={{fontSize : 36}}>Создать рецепт</h1>
				<div className="hr hr-favorites" style={{width: '40vw', marginBottom: 30}}></div>
				{/* <div className="favorites-navbar" style={{marginTop: 0}}>
					<div htmlFor='cakes' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(cakes, e)}>Торты</div>
					<div htmlFor='candies' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(candies, e)}>Конфеты</div>
					<div htmlFor='ice_cream' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(ice_cream, e)}>Мороженое</div>
					<div htmlFor='dessert' className="btn-add-cart favorites-btn" onClick={(e) => changeTarget(dessert, e)}>Десерты</div>
				</div> */}
					<div className="form">
						<div className="form-booking">
							<div className="form-item">
								<img src={pencil} alt="" width="20px"/>
								<input className="form-input" type="text" id="username" placeholder="Введите название" ref={nameRef}/>
								<hr/>
							</div>
							<div className="form-item">
								<img src={imgTime} alt="" width="25px" style={{marginBottom: -3}}/>
								<input type="tel" className="form-input" maxLength={3} placeholder="Готовить (не обязательно)" ref={timeRef} style={{width: '75%'}}/>
								<span>минут</span>
								<hr/>
							</div>
							<div className='ingredients-block' >
							{/* <div className='ingredients-block' onClick={handleIngredientsBlock} style={{ height: ingredientsOpen ? "520px" : "20px", padding: ingredientsOpen ? '30px 50px' : '0px 50px'}}> */}
								<button onClick={handleIngredientsBlock}>Ингредиенты</button>
								<div className='ingredients-block__body' style={{ height: ingredientsOpen ? "max-content" : "0px"}}>
									<form className='ingredients-block__form' onSubmit={(e) => addIngredient(e)} style={{marginLeft: 25}}>
										<input type="text" placeholder='Название ингредиента' ref={nameIngredientRef} style={{width: '150%'}}/>
										<input type="text" placeholder='Количество' ref={сountIngredientRef} style={{margin: '0px 0px', width: '100%'}}/>
										<button type='submit' style={{marginLeft: 0}}><img src={plus} alt="" width={30} height={30}/></button>
									</form>
									{ingredients[0]?.length &&
										<div className='ingredients-block__list'>
											{
												ingredients.map(obj => (
													<div key={`${obj[0]}_${obj[1]}`} className='ingredients-block__list__item'>
														<p>{obj[0]} - {obj[1]}</p>
														<img onClick={() => deteleItem(obj, setIngredients)} src={imgClose} alt="" width={15} height={15}/>
													</div>
												))
											}
										</div>
									}
								</div>
							</div>
							
							<div className='ingredients-block'>
								<button onClick={handleStepsBlock}>Способ приготовления</button>
								<div className='ingredients-block__body' style={{ height: stepsOpen ? "max-content" : "0px"}}>
									<form className='ingredients-block__form _steps' onSubmit={(e) => addStep(e)}>
										<textarea type="text" placeholder='Введите шаг приготовления' ref={stepRef} onKeyDown={handlerStepsInputKeyDown} onKeyUp={e => handlerStepsInputKeyUp(e.target)}/>
										<button type='submit'><img src={plus} alt="" width={30} height={30}/></button>
									</form>
									{steps.length > 0 && (
										<DragDropContext onDragEnd={handlerOnDrag}>
											<Droppable droppableId="droppable">
											{(provided) => (
												<div className='steps-block__list' ref={provided.innerRef} {...provided.droppableProps}>
												{steps.map((obj, index) => (
													<Draggable key={obj} draggableId={obj} index={index}>
													{(provided) => (
														<div
															className='ingredients-block__list__item _steps'
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
														>
															<div className='list__item__number'>
																<p>{index + 1}</p>
															</div>
															<div className='list__item__body'>
																<p>{obj}</p>
															</div>
															<img onClick={() => deteleItem(obj, setSteps)} src={imgClose} alt="" width={15} height={15}/>
														</div>
													)}
													</Draggable>
												))}
												{provided.placeholder}
												</div>
											)}
											</Droppable>
										</DragDropContext>
									)}
								</div>
							</div>
							<div className="btn-add-cart add-btn-save" onClick={save} style={{marginBottom: 50, marginLeft: 'calc(50% - 100px)'}}>Сохранить</div>
						</div>
					</div>
			</main>
		</div>
	);
  };
