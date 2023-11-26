import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {ContextProvider} from './context.js';
import App from './app.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	
		<BrowserRouter>
				<ContextProvider>
						<App/>
				</ContextProvider>
	</BrowserRouter>
);
