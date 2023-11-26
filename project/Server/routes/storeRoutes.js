import { registerValidation, loginValidation, productCreateValidation, accountUpdateValidation, orderCreateValidation} from '../validations.js';
import * as UserController from '../controlers/UserController.js';
import * as ProductController from '../controlers/ProductController.js';
import * as CategoryController from '../controlers/CategoryController.js';
import * as OrderController from '../controlers/OrderController.js';
import * as LikeController from '../controlers/LikeController.js';
import checkAuth from '../utils/checkAuth.js';
import checkAuthor from '../utils/checkAuthor.js';
import cheackAuthorNonAuth from '../utils/cheackAuthorNonAuth.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import checkModerator from '../utils/checkModerator.js';
import express from 'express';

const app = express();

// Пользователь
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login); 
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

// Заказы: администратор
app.get('/orders/active', checkAuth, checkModerator, OrderController.getActive);
app.post('/orders/ended', checkAuth, checkModerator, OrderController.getEnded);
app.patch('/orders/setStatus/:id', checkAuth, checkModerator, OrderController.setStatus);

// Заказы: пользователь
app.post('/orders', orderCreateValidation, handleValidationErrors, OrderController.create);
app.post('/orders/history', OrderController.getUser);
app.get('/orders', OrderController.getAll);
app.post('/orders/remove/:id', cheackAuthorNonAuth, OrderController.remove);
app.delete('/orders/:id', checkAuth, checkAuthor, OrderController.remove);

// Продукты
app.get('/products', ProductController.getAll);
app.get('/products/category/:id', ProductController.getCategory);

// Продукты: администратор
app.post('/products', checkAuth, checkModerator, productCreateValidation, handleValidationErrors, ProductController.create);
app.post('/products/search', checkAuth, checkModerator, ProductController.search);
app.post('/category/create', checkAuth, checkModerator, productCreateValidation, handleValidationErrors, CategoryController.create);
app.patch('/products/:id', checkAuth, checkModerator, ProductController.update);
app.delete('/products/:id', checkAuth, checkModerator, ProductController.remove);

// Избранное
app.post('/like', checkAuth, LikeController.change);
app.get('/like', checkAuth, LikeController.getUser);

// Аккаунты: администратор
app.post('/accounts/search', checkAuth, checkModerator, UserController.search)
app.patch('/accounts/:id', checkAuth, checkModerator, accountUpdateValidation, handleValidationErrors, UserController.account_update)
app.delete('/accounts/:id', checkAuth, checkModerator, UserController.remove)

// Админ:
app.patch('/admin/photo', checkAuth, checkModerator, UserController.photoUpdate)

export default app