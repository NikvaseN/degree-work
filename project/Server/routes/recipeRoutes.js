import {recipeCreateValidation} from '../validations.js';
import checkAuth from '../utils/checkAuth.js';
import checkCourier from '../utils/checkCourier.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import checkModerator from '../utils/checkModerator.js';
import express from 'express';
import * as RecipeController from '../controlers/RecipeController.js';
const app = express();

// Предложить рецепт
app.post('/recipe', checkAuth, recipeCreateValidation, handleValidationErrors, RecipeController.suggest)

export default app