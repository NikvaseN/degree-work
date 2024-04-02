import {useEffect, useRef, useState} from 'react';
import './admin.css'
import './staff_support.css'
import { io } from 'socket.io-client';
import imgSend from '../img/icons/send.png'
import arrow from '../img/icons/page-next.png'
import system from '../img/icons/settings.png'
import default_profile from '../img/icons/default_profile.jpg'
import Swal from 'sweetalert2';
import phone from '../img/icons/phone.png'
import birthday from '../img/icons/birthday.png'
import work from '../img/icons/work.png'
import { formatDate, escapeHtml} from "./functions.jsx"
import { ruRole } from '../config/roles.js';
import { Toast } from './swal.js';

export default function Admin_Support ({appeales, user, rolled, mobile, reloadComponent}) {
	const [socket, setSocket] = useState(false);

	// Пользователи, которые сейчас печатают
	const [typers, setTypers] = useState([]);

	const [newTyper, setNewTyper] = useState();

	// const setUp = async () => {
	// 	await axios.get('/courier/working').then(res =>{
	// 		setActiveOrder(res.data)
	// 		if(res.data.length){
	// 			setTarget(res.data[0])
	// 		}
	// 		setIsLoad(true)
	// 	}).catch(() => {
	// 		setIsLoad(true)
	// 	})
	// } 

	useEffect(()=>{
		document.title = 'Обращения'

		return () =>{
			socket && socket.close()
		}
	}, [])

	// id пользователя, который создал обращение
	const [chatUserId, setChatUserId] = useState();

	const [chatActive, setChatActive] = useState(false);
	const [write, setWrite] = useState('');
	const [msgs, setMsgs] = useState([]);

	const inputRef = useRef()
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
		  e.preventDefault();
		  send(e);
		}
		// Пользователь печатает
		else{
			socket.emit('appeal_typing', { username: user.fullName, id: chatUserId, user: user});
		}
	};

	const send = (e) =>{
		e.preventDefault();
		if(chatActive && write){
			inputRef.current.innerText = ''
			// setMsgs([...msgs, { username: user.fullName, msg: write, id: user._id}]);
			socket.emit('appeal_write', [...msgs, { username: user.fullName, msg: write, id: user._id, user: user}], {_id: chatUserId});
			setWrite('')
		}
	}


	function removeUserTyping(user) {
		const updatedTypers = typers.filter(typer => {
			 return typer.user._id !== user.user._id
			});
		setTypers(updatedTypers);
	}

	const addTypers = (user) =>{
		// Если пользователь уже есть в массиве
		if (typers.some(typer => typer.user._id === user.user._id)) {
			return;
		}
		setTypers(prev => [...prev, user])

		setTimeout(() => {
			removeUserTyping(user);
		}, 4000);

	}

	useEffect(()=>{
		if(newTyper && typers.length === 0){
			addTypers(newTyper)
		}
	}, [newTyper])

	const startChat = (chatId) =>{
		if(chatUserId && chatUserId === chatId){
			Toast.fire({
				icon: "error",
				title: "Обращение уже открыто."
			});
			return;
		}

		let socketF;
		// Если есть активный чат
		if(chatUserId){
			socketF = socket
			socketF.emit('leave-room', `support_${chatUserId}`);
			setChatActive(false)
			setChatUserId(chatId)
			socketF.emit('join-room', `support_${chatId}`);
			socketF.emit('appeal_start_read', chatId);
			setMsgs([])
			setTimeout(() => {
				setChatActive(true);
			}, 500);
		}
		else{
			socketF = io(import.meta.env.VITE_API_HOST)
			
			socketF.on('appeal_read', (chat) => {
				setMsgs(chat.messages)
			});

			socketF.on('appeal_on_cancel', (id) => {
				if(chatId === id){
					setMsgs([])
					setChatActive(false)
					setChatUserId()
				}
			});

			socketF.on('connect', () => {
				socketF.emit('join-room', `support_${chatId}`);

				// Получить сообщения в чате
				socketF.emit('appeal_start_read', chatId);
			});
			setChatActive(true)
		}

		// Пользователь печатает
		socketF.on('appeal_onTyping', (user) => {
				setNewTyper(user)
		});

		setSocket(socketF)
		setChatUserId(chatId)
	}

	const closeChat = () =>{
		// if(window.confirm('')){
		// 	setChatActive(false)
		// 	socket.emit('appeal_cancel', chatUserId, user);
		// }
		Swal.fire({
			title: 'Отменить',
			text: "Вы уверены что хотите отменить обращение ?",
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
					setChatActive(false)
					socket.emit('appeal_cancel', chatUserId, user);
					Toast.fire({
						icon: "success",
						title: "Обращение отменено."
					});
				} catch {
					Toast.fire({
						icon: "error",
						title: "Что-то пошло не так."
					});
				}
			}
		}
		)
	}

	const avatarMsg = (obj) =>{
		if (obj.username === 'Система'){
			return <img className='system' src={system} alt=""/>
		}
		if(obj.user && obj.user.imageUrl) {
			return <img src={`${import.meta.env.VITE_IMG_URL}${obj.user.imageUrl}`} alt=""/>
		}
		return <img src={default_profile} alt=""/>
	}
	const viewUser = (obj) =>{
		const role = ruRole(obj.user.role)
		const user = obj.user
		const imageUrl = `${import.meta.env.VITE_IMG_URL}${user.imageUrl}`
		Swal.fire({
			title: role,
 			html: `
			 <div className="profile-block">
			 <div className="profile-logo-block">
				<img className="profile-logo" alt="фото" src='${user.imageUrl ? escapeHtml(imageUrl) : default_profile}' width="300px" height="300px"/>:
			 </div>
			 <div className="user-info-block">
				 <img src={human} alt="" width={25} height={25}/>
				 <p>Имя: <span>${escapeHtml(user.fullName)}</span></p>
				 <p>Фамилия: <span>${escapeHtml(user.surname)}</span></p>
				 <p>Отчество: <span>${escapeHtml(user.patronymic)}</span></p>
			 </div>
			 <br />
			 <div className="user-info-block" style='display: flex; align-items: center; justify-content: center '>
				 <img src=${phone} alt="" width=${25} height=${25} style="margin-right: 10px"/>
				 <p>${escapeHtml(user.phone)}</p>
			 </div>
			 <div className="user-info-block" style='display: flex; align-items: center; justify-content: center '>
				 <img src=${birthday} alt="" width=${25} height=${25} style="margin-right: 10px"/>
				 <p>${user.birthday && formatDate(user.birthday, 'D-M-Y')}</p>
			 </div>
			 <div className="user-info-block" style='display: flex; align-items: center; justify-content: center '>
				 <img src=${work} alt="" width=${25} height=${25} style="margin-right: 10px"/>
				 <p>${user.createdAt && formatDate(user.createdAt, 'D-M-Y')}</p>
			 </div>
		 </div>
			`
		})
	}
	console.log(typers)
	return (
		<>
			<div className="container admin-container">
				<div className="empty-header-admin"></div>
				<main className="admin-support">
					<ul className="appeales-block">
						<h3>Обращения</h3>
						{appeales && appeales.map((obj) => (
							<li key={obj.socketId} onClick={() => startChat(obj.user._id)} className="appeales-item">
								<p>{obj.user?.fullName}</p>
								<p>{obj.user?.surname?.[0]}.</p>
								<p>{obj.user?.patronymic?.[0]}.</p>
								<div className="appeales-item-send">
									<img src={arrow} alt="" width={15} height={15}/>
								</div>
							</li>
						))}
						{/* <li className="appeales-item">
								<p>Имяя</p>
								<p>Ф.</p>
								<p>О.</p>
								<div className="appeales-item-send">
									<img src={arrow} alt="" width={15} height={15}/>
								</div>
						</li> */}
					</ul>
					<div className="chat-block">
						<div className="chat__header">
							{typers?.length === 1 && typers?.[0].user._id !== user._id &&
								<p className='chat-read__typing'>
									{typers?.[0].username} печатает<span>...</span>
								</p>
							}
							<h2>Чат</h2>
							{chatActive && 
								<div onClick={closeChat} className="change-profile support">Отменить обращение</div>
							}
						</div>
						<div className="chat-read" style={{ height: chatActive ? "520px" : "0px", padding: chatActive ? '30px 50px' : '0px 50px'}}>
							{chatActive &&
								Object.keys(msgs).length > 0 &&
									msgs?.map((obj, index) =>(
										obj.id === user._id ?
											<div key={index} className="msg-block-self">
												{(index === 0 || (index > 0 && obj.id !== msgs[index - 1].id)) && 
													<h4 style={{marginTop: 20}}>
													{avatarMsg(obj)}
													Вы
												</h4>
												}
												<h3>{obj.msg}</h3>
											</div>
										:
											<div key={index} className="msg-block admin">
												{(index === 0 || (index > 0 && obj.id !== msgs[index - 1].id)) && 
													<h4 onClick={() => viewUser(obj)} style={{marginTop: 20}}>
														{avatarMsg(obj)}
														{obj.username}
													</h4>
												}
												<h3>{obj.msg}</h3>
											</div>
									))
							}
						</div>
						<form onSubmit={(e) => send(e)} className="chat-write-block">
							{chatActive && 
								<>
									
									<div ref={inputRef} className='admin-chat-input' contentEditable="true"  onInput={e => setWrite(e.target.innerText)} onKeyDown={handleKeyDown}></div>
									<button type="submit" className="send-block">
										<img src={imgSend} alt=""/>
									</button>
								</>
							}
						</form>
					</div>
				</main>
			</div>
		</>

	)
}