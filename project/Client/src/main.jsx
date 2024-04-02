import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {ContextProvider} from './Context.jsx';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<BrowserRouter>
			<ContextProvider>
					<App/>
			</ContextProvider>
	</BrowserRouter>
);
