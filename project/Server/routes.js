import upload from './routes/upload.js'
import storeRoutes from './routes/storeRoutes.js'
import courierRoutes from './routes/courierRoutes.js'
import devRoutes from './routes/devRoutes.js'
import express from 'express';

const app = express();

// Работа с файлами
app.use(upload);

// Маршруты для интернет магазина
app.use(storeRoutes);
app.use(courierRoutes);

// ! Использовать только при разработке !
// app.use(devRoutes);

export default app