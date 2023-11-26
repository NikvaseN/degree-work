import React, { createContext, useState } from 'react';

// Context
export const Context = createContext();

// Функция для обертки родительного компонента
export const ContextProvider = ({ children }) => {

	const [quantityCart, setQuantityCart] = useState(0);
	return (	
	  // Обертываем дочерние компоненты в провайдер контекста
	  <Context.Provider value={{ quantityCart, setQuantityCart }}>
		{children}
	  </Context.Provider>
	);
  };
