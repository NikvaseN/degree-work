import Swal from 'sweetalert2';
import { Toast } from '../../components/swal.js';
import axios from '../../axios.js';
import { escapeHtml } from '../../components/functions.jsx';

export const getCompound = (ingredients) =>{
	return ingredients.map(item => item.join(' - ')).join(', ')
}

export const deleteRecipe = async (obj, reloadComponent) =>{
	console.log(obj)
	Swal.fire({
		title: 'Удалить?',
		text: "Вы собираетесь УДАЛИТЬ:",
		html: 
			`<p style='color: black'>Название:  ${escapeHtml(obj?.name)}</p><br>` +
			`<p style='color: black'>Состав:  ${obj && (obj?.verified === true ? escapeHtml(getCompound(obj.ingredients)) : escapeHtml(obj.composition))}</p><br>`,
		icon: 'error', showCancelButton: true, reverseButtons: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', cancelButtonText: 'Нет', confirmButtonText: 'Да',
	}).then(async (res) =>{
		if(res.isConfirmed){
			const { value: formValues } = await Swal.fire({
				title: `Подтверждение!`,
				html:
				  `<h3>Повторите название рецепта, который собираетесь удалить</h3> <br>` +
				  `<h5 style='color: red'>${escapeHtml(obj.name)}</h5>` +
				  `<input id="swal-input1"class="swal2-input"><br>`,
				focusConfirm: false,
				icon: 'warning',
				preConfirm: () => {
				  return document.getElementById('swal-input1').value
				}
			})
			if(formValues) {
				if(formValues === obj.name) {
					await axios.delete(`/recipe/${obj._id}`).then(() =>{
						Toast.fire({
							icon: "success",
							title: "Рецепт успешно удален."
						});
						reloadComponent()
					}
					).catch((err) =>{
						let errs = err.response.data
						let str = ''
						if (errs.length >= 1) {
							errs.forEach((obj) => str += '- ' +  obj.msg + '<br><br>')
						} else{
							str = err.response.data.msg
						}
						Swal.fire(
							'Ошибка!', str, 'error'
						)
					})
				}
				else{
					Swal.fire('Ошибка!', 'Не верно введено название рецепта','error')
				}
			}
		}
	})
}

export const cancelRecipe = async (obj, reloadComponent) =>{
	await axios.delete(`/recipe/${obj._id}`).then(() =>{
		Toast.fire({
			icon: "success",
			title: "Рецепт успешно отклонен."
		});
		reloadComponent()
	})
}
