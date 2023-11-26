import {useEffect, useRef, useState} from 'react';
import './admin.css'
import './courier_support.css'
import './courier_support.css'
import { io } from 'socket.io-client';
import imgSend from '../img/icons/send.png'
import arrow from '../img/icons/page-next.png'
import system from '../img/icons/settings.png'
import default_profile from '../img/icons/default_profile.jpg'
import Swal from 'sweetalert2';
import phone from '../img/icons/phone.png'
import birthday from '../img/icons/birthday.png'
import work from '../img/icons/work.png'
import { formatDate, formatPhoneNumber } from "./functions.jsx"

export default function Admin_Support ({appeales, user, rolled, mobile, reloadComponent}) {
	const [socket, setSocket] = useState(false);
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
	// Обновлять чат
	const [refresh, setRefresh] = useState(false);

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
	
	const startChat = (chatId) =>{

		if(chatUserId && chatUserId === chatId){
			return;
		}

		let socketF;
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
			socketF = io(process.env.REACT_APP_API_HOST)
			
			socketF.on('appeal_read', (chat) => {
				console.log('working', chat.messages)
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
		setSocket(socketF)
		setChatUserId(chatId)
	}

	const closeChat = () =>{
		if(window.confirm('Вы уверены что хотите отменить обращение ?')){
			setChatActive(false)
			socket.emit('appeal_cancel', chatUserId, user);
		}
	}

	const avatarMsg = (obj) =>{
		if (obj.username === 'Система'){
			return <img className='system' src={system} alt=""/>
		}
		if(obj.user && obj.user.imageUrl) {
			return <img src={`${process.env.REACT_APP_IMG_URL}${obj.user.imageUrl}`} alt=""/>
		}
		return <img src={default_profile} alt=""/>
	}
	const viewUser = (obj) =>{
		console.log(obj)
		const role = obj.user.role === 'courier' ? 'Курьер' : obj.user.role === 'admin' ? 'Администратор' : 'Пользователь'
		const user = obj.user
		const imageUrl = `${process.env.REACT_APP_IMG_URL}${user.imageUrl}`
		Swal.fire({
			title: role,
 			html: `
			 <div className="profile-block">
			 <div className="profile-logo-block">
				<img className="profile-logo" alt="фото" src='${user.imageUrl ? imageUrl : default_profile}' width="300px" height="300px"/>:
			 </div>
			 <div className="user-info-block">
				 <img src={human} alt="" width={25} height={25}/>
				 <p>Имя: <span>${user.fullName}</span></p>
				 <p>Фамилия: <span>${user.surname}</span></p>
				 <p>Отчество: <span>${user.patronymic}</span></p>
				 <p>Баланс: <span>${user.balance}</span></p>
			 </div>
			 <br />
			 <div className="user-info-block" style='display: flex; align-items: center; justify-content: center '>
				 <img src=${phone} alt="" width=${25} height=${25} style="margin-right: 10px"/>
				 <p>${user.phone}</p>
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

	return (
		<>
			<div className="container admin-container">
				<div className="empty-header-admin"></div>
				<main className="admin-support">
					<ul className="appeales-block">
						<h3>Обращения</h3>
						{appeales && appeales.map((obj) => (
							<li onClick={() => startChat(obj.user._id)} className="appeales-item">
								<p>{obj.user.fullName}</p>
								<p>{obj.user.surname[0]}.</p>
								<p>{obj.user.patronymic[0]}.</p>
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
						<h2>Чат</h2>
						{chatActive && 
							<div onClick={closeChat} className="change-profile support">Отменить обращение</div>
						}
						<div className="chat-read" style={{ height: chatActive ? "520px" : "0px", padding: chatActive ? '30px 50px' : '0px 50px'}}>
							{chatActive &&
								Object.keys(msgs).length > 0 &&
									msgs?.map((obj, index) =>(
										obj.id === user._id ?
											<div key={index} className="msg-block-self">
												{(index === 0 || (index > 0 && obj.id != msgs[index - 1].id)) && 
													<h4 style={{marginTop: 20}}>
													{avatarMsg(obj)}
													Вы
												</h4>
												}
												<h3>{obj.msg}</h3>
											</div>
										:
											<div key={index} className="msg-block admin">
												{(index === 0 || (index > 0 && obj.id != msgs[index - 1].id)) && 
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