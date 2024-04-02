import { useState, useEffect, useRef } from "react"
export default function Widget () {
	useEffect(() => {
        const script = document.createElement('script');
        script.src = '//code.jivo.ru/widget/esKwxxxDxK';
        script.async = true;

        document.body.appendChild(script);

		script.onload = () => {
            // Инициализация виджета
            window.jivo_init();
        };

        return () => {
            document.body.removeChild(script);
			// const el = document.getElementById('jivo-player')
			const el = document.getElementsByTagName('jdiv')
			if(el.length){
				el[0].remove()
			}
        };
    }, []);

	return null
}


