import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv-flow';
import routes from './routes.js';
import Socket from './utils/socket.js';

dotenv.config()

// Подключение базы данных
mongoose
.connect(process.env.DB)
.then(() =>console.log('DB OK'))
.catch((err) =>console.log('DB ERROR', err));

// Получение значений из локального окружения
const PORT = process.env.PORT
const HOST = process.env.HOST
const ENV = process.env.NAME


// Настройка сервера 
const app = express();
app.use(express.json());
app.use(cors({
	origin: '*'
}));

// Подключение маршрутов
app.use('/', routes);

const server = app.listen(PORT, HOST, (err) =>{
    if (err){
        return console.log(err);
    }
	if(ENV){
		console.log(ENV);
	}
	console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Использование сокета
Socket(server);

export default server

