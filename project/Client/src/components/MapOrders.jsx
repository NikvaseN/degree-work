import { YMaps, Map, Placemark, Panorama, GeolocationControl, useYMaps, SearchControl} from '@pbe/react-yandex-maps';
import { useState, useEffect, useRef} from 'react';
import './mapOrders.css'
import human from '../img/icons/human.png'
import phone from '../img/icons/phone.png'
import placemark from '../img/icons/placemark.png'
import {formatPhoneNumber} from './functions.jsx'
export default function MapOrders ({orders, setUp, center, zoom, target}) {
	// useEffect(()=>{
	// 	setUp()
	// }, [])
	console.log(target)
	return (
		<Map 
			width={'100%'}
			height='60vh'
			state={{ 
				center: center,
				zoom: zoom,
				controls: ["fullscreenControl"],
			}}
			modules={["control.FullscreenControl"]}
		>
			{target &&
					<Placemark
						key={target._id}
						defaultGeometry={target.coordinates}
						properties={{
							balloonContentHeader: 
								`Заказ № ${target.number}<br>
								<span class="description">Товаров: ${target.products.length}</span>`,
							balloonContentBody: `
								<b>Данные заказчика</b><br/> 
								<div class='placemark-body-item'>
									<img src=${human} alt="" width="17px" height="17px"/>
									<p>${target.username}</p><br/>
								</div>
								<div class='placemark-body-item'>
									<img src=${phone} alt="" width="17px" height="17px"/>
									<a href="tel:${target.phone}">${formatPhoneNumber(target.phone)}</a><br/>
								</div>
								<div class='placemark-body-item'>
									<img src=${placemark} alt="" width="17px" height="17px"/>
									<p>${target.street}, д. ${target.house}, кв. ${target.apartment}</p><br/>
								</div>
								`,
						}}
						options={{
							iconLayout: "default#image",
							iconImageSize: [50, 50],
							iconImageHref: 'https://img.icons8.com/glyph-neue/64/map-pin.png'
						}}
					/>
			}
			{orders &&
				orders.map((obj) =>(
					(!target || target._id === obj._id) &&
					<Placemark
						key={obj._id}
						defaultGeometry={obj.coordinates}
						properties={{
							balloonContentHeader: 
								`Заказ № ${obj.number}<br>
								<span class="description">Товаров: ${obj.products.length}</span>`,
							balloonContentBody: `
								<b>Данные заказчика</b><br/> 
								<div class='placemark-body-item'>
									<img src=${human} alt="" width="17px" height="17px"/>
									<p>${obj.username}</p><br/>
								</div>
								<div class='placemark-body-item'>
									<img src=${phone} alt="" width="17px" height="17px"/>
									<a href="tel:${obj.phone}">${formatPhoneNumber(obj.phone)}</a><br/>
								</div>
								<div class='placemark-body-item'>
									<img src=${placemark} alt="" width="17px" height="17px"/>
									<p>${obj.street}, д. ${obj.house}, кв. ${obj.apartment}</p><br/>
								</div>
								`,
						}}
						
						options={{
							iconLayout: "default#image",
							iconImageSize: [50, 50],
							iconImageHref: 'https://img.icons8.com/glyph-neue/64/map-pin.png'
						}}
					/>
				))
			}
			<GeolocationControl options={{position: {top: 50, right: 10}}} />
			<SearchControl options={{ float: "right" }} />
		</Map>
	)
}