import upload from './routes/upload.js'
import storeRoutes from './routes/storeRoutes.js'
import courierRoutes from './routes/courierRoutes.js'
import recipeRoutes from './routes/recipeRoutes.js'
import devRoutes from './routes/devRoutes.js'
import express from 'express';

const app = express();

// Работа с файлами
app.use(upload);

// Маршруты для интернет магазина
app.use(storeRoutes);
app.use(courierRoutes);
app.use(recipeRoutes);

// ! Использовать только при разработке !
// app.use(devRoutes);

export default app