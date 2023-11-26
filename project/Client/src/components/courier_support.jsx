import {useEffect, useState, useRef} from 'react';
import './courier_support.css'
import { io } from 'socket.io-client';
import imgSend from '../img/icons/send.png'
import system from '../img/icons/settings.png'
import default_profile from '../img/icons/default_profile.jpg'

export default function Courier_Support ({user, rolled, mobile, reloadComponent}) {
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
		document.title = 'Заказы'

		return () =>{
			socket && socket.close()
		}
	}, [])

	// Обновлять чат
	const [refresh, setRefresh] = useState(false);

	const [chatActive, setChatActive] = useState(false);
	const [write, setWrite] = useState('');
	const [msgs, setMsgs] = useState([{username: 'Система', msg: 'Здравствуйте, чем вам помочь ?', id: '0'}]);
	
	const inputRef = useRef()
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
		  e.preventDefault();
		  send(e);
		}
	};

	const send = (e) =>{
		e.preventDefault();
		console.log(123)
		if(chatActive && write){
			inputRef.current.innerText = ''
			// setMsgs([...msgs, { username: user.fullName, msg: write, id: user._id}]);
			socket.emit('appeal_write', [...msgs, { username: user.fullName, msg: write, id: user._id, user: user}], user);
			setWrite('')
		}
	}

	const startChat = () =>{
		const socket = io(process.env.REACT_APP_API_HOST)

		socket.on('appeal_read', (chat) => {
			console.log(chat)
			setMsgs(chat.messages)
		});

		socket.on('appeal_on_cancel', () => {
			setMsgs([{username: 'Система', msg: 'Здравствуйте, чем вам помочь ?', id: '0'}])
			setChatActive(false)
		});

		socket.on('connect', () => {
			console.log(`support_${user._id}`)
			socket.emit('join-room', `support_${user._id}`);
			socket.emit('appeal_start', user);
		});

		setSocket(socket)
		setChatActive(true)
	}

	const closeChat = () =>{
		if(window.confirm('Вы уверены что хотите отменить обращение ?')){
			// setChatActive(false)
			// setMsgs([{username: 'Система', msg: 'Здравствуйте, чем вам помочь ?', id: '0'}])
			socket.emit('appeal_cancel', user._id, user);
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

	return (
		<>
			<div className="container">
				<div className="empty-header-admin"></div>
				<div className="chat-block">
					<h2>Поддержка</h2>
					{chatActive && 
						<div onClick={closeChat} className="change-profile support">Отменить обращение</div>
					}
					<div className="chat-read">
					{chatActive ?
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
									<div key={index} className="msg-block">
										{(index === 0 || (index > 0 && obj.id != msgs[index - 1].id)) && 
											<h4 style={{marginTop: 20}}>
												{avatarMsg(obj)}
												{obj.username}
											</h4>
										}
										<h3>{obj.msg}</h3>
									</div>
							))
							:
							<div onClick={startChat} className="start-chat">
								<h2>Создать обращение</h2>
							</div>
						}
					</div>
					<form onSubmit={(e) => send(e)} className="chat-write-block">
					<div ref={inputRef} className='admin-chat-input' contentEditable="true"  onInput={e => setWrite(e.target.innerText)} onKeyDown={handleKeyDown}></div>
						<button type="submit" className="send-block">
							<img src={imgSend} alt=""/>
						</button>
					</form>
				</div>
			</div>
		</>

	)
}