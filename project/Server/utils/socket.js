import { Server } from 'socket.io';

export default function Socket (server){
	
	const CLIENT = process.env.CLIENT
	
	const io = new Server(server, {
		cors:{
			origin: [CLIENT],
			// methods: ['POST', 'GET']
		}
	});
	// let users = [];
	// let admins = [];

	let couriers = [];
	let appeales = [];

	io.on('connection', (socket)=>{
		socket.on('order', (action, obj) =>{
				socket.broadcast.emit('update-orders-list', action, obj)
				socket.disconnect();
			}
		)
		socket.on('start-change-status', (id, prevStatus, status, room) =>{
			socket.to(room).emit('change-status', id, status)
			socket.to('admin').emit('change-status', prevStatus, status)
			socket.to('courier').emit('change-status', prevStatus, status)
		})
		
		socket.on('join-room', (room) =>{
			socket.join(room)
		})
		
		socket.on('leave-room', (room) =>{
			socket.leave(room)
		})

		socket.on('join-as-courier', (user) => {
			const existingCourier = couriers.find((courier) => courier.user._id === user._id);
			if (!existingCourier) {
				const newCourier = {
					socketId: socket.id,
					user: user
				};
				couriers.push(newCourier);
			}
			io.emit('couriers-count', couriers);
			// socket.disconnect();
		});

		socket.on('couriers-count-get', () => {
			socket.emit('couriers-count', couriers);
		});

		socket.on('appeal_start', (user) => {
			const existingCourier = appeales.find((appeal) => appeal.user._id === user._id);
			if (!existingCourier) {
				const appeal = {
					socketId: socket.id,
					user: user,
					messages: [{}]
				};
				appeales.push(appeal);
				io.to('admin').emit('appeales', appeales);
			}
			else{
				const chat = appeales.find((appeal) => appeal.user._id === user._id);
				if (chat) {
					if(chat.messages.length > 1 )
						io.to(`support_${user._id}`).emit('appeal_read', chat);
				}
			}
		});

		socket.on('appeal_write', (msg, user) => {
			
			const chat = appeales.find((appeal) => appeal.user._id === user._id);
			if (chat) {
				if(Array.isArray(msg)){
					chat.messages = msg
					// io.emit('appeal_read', chat);
					io.to(`support_${user._id}`).emit('appeal_read', chat);
				}
			}
		});

		socket.on('appeal_start_read', (id) => {
			const chat = appeales.find((appeal) => appeal.user._id === id);
			if (chat) {
				if(chat.messages.length > 1 )
					io.to(`support_${id}`).emit('appeal_read', chat);
			}
		});

		socket.on('appeal_cancel', (id, user) => {
			appeales = appeales.filter((appeal) => {
				if (appeal.user._id === id) {
					if (appeal.user._id === user._id || user.role === 'admin') {
						io.to(`support_${id}`).emit('appeal_on_cancel', id);
						io.to('admin').emit('appeales', appeales, id);
						return false;
					}
					console.log('undeleted')
					return true;
				}
				return true;
			  });
		});

		socket.on('appeales-get', () => {
			socket.emit('appeales', appeales);
		});
		// socket.on('join-as-admin', () => {
		// 	if (!admins.includes(socket.id)) {
		// 		admins.push(socket.id);
		// 	}
		// 	io.emit('admins-count', admins.length);
		// });
	
		socket.on('disconnect', () => {
			const disconnectedCourier = couriers.find((courier) => courier.socketId === socket.id);
			if (disconnectedCourier) {
				couriers = couriers.filter((courier) => courier.socketId !== socket.id);
				io.emit('couriers-count', couriers.length);
			}
		
			// if (admins.includes(socket.id)) {
			// 	admins = admins.filter((id) => id !== socket.id);
			// 	io.emit('admins-count', admins.length);
			// }
		});
	})
}

