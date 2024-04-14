import { recipeSuggestValidation, recipeCreateValidation } from '../validations.js';
import checkAuth from '../utils/checkAuth.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import express from 'express';
import * as RecipeController from '../controlers/RecipeController.js';
import { checkModerator, checkStaff, checkConfectioner } from '../utils/checkRole.js';

const app = express();

// Предложить рецепт
app.post('/recipe', checkAuth, recipeSuggestValidation, handleValidationErrors, RecipeController.suggest)

// Получить подтвержденные рецепты
app.get('/recipe', checkAuth, checkStaff, RecipeController.verified)

// Найти подтвержденные рецепты по поиску
app.post('/recipe/search', checkAuth, checkStaff, RecipeController.search)

// Получить не подтвержденные рецепты
app.get('/recipe/unverified', checkAuth, checkStaff, RecipeController.unverified)

// Получить все рецепты
app.get('/recipe/all', checkAuth, checkStaff, RecipeController.show)

// Удалить рецепт
app.delete('/recipe/:id', RecipeController.remove)

// Редактировать рецепт
app.patch('/recipe/:id', checkAuth, checkConfectioner, recipeCreateValidation, handleValidationErrors, RecipeController.update)

export default app