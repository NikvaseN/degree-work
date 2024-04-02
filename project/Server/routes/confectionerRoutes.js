import {staffCreateValidation, recipeCreateValidation} from '../validations.js';
import checkAuth from '../utils/checkAuth.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import express from 'express';
import * as ConfectionerController from '../controlers/ConfectionerController.js';
import * as RecipeController from '../controlers/RecipeController.js'
import {checkConfectioner, checkModerator} from '../utils/checkRole.js';

const app = express();

// Создать аккаунт кондитера (администратор)
app.post('/confectioner', checkAuth, checkModerator, staffCreateValidation, handleValidationErrors, ConfectionerController.create)

// Получить список новых заказов для готовки
app.get('/confectioner/orders', checkAuth, checkConfectioner, ConfectionerController.orders)

// Получить не полного пользователя
app.get('/staff/access', checkAuth, checkConfectioner, ConfectionerController.access)

// Получить всео пользователя
app.post('/staff/auth', checkAuth, ConfectionerController.getMe)

// Принять заказ
app.get('/confectioner/take/:id', checkAuth, checkConfectioner, ConfectionerController.take)

// Завершить заказ
app.get('/confectioner/finish/:id', checkAuth, checkConfectioner, ConfectionerController.finish)

// Создать рецепт
app.post('/confectioner/recipe', checkAuth, checkConfectioner, recipeCreateValidation, handleValidationErrors, RecipeController.create)

export default app