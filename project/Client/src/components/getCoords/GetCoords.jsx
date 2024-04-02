import { useState, useRef} from "react"
import { YMaps, Map, Placemark, Panorama, GeolocationControl, SearchControl} from '@pbe/react-yandex-maps';
import './map.css'

export default function Component ({setCoords, width, height, center, zoom, markSize}) {
	const [markCoords, setMarkCoords] = useState()
	const [mapCenter, setMapCenter] = useState(center || [52.288177, 104.280811])

	const mapRef = useRef()

	return (
		<YMaps id='map' query={{ apikey: import.meta.env.VITE_MAP_API}}>
			<Map
				instanceRef={mapRef}
				width={width || '100px'}
				height={height || '100px'}
				state={{ 
					center: mapCenter,
					zoom: zoom || 10,
					controls: ["fullscreenControl"],
				}}
				modules={["control.FullscreenControl"]}
				onLoad={(e) =>{
					mapRef.current.cursors.push('pointer');
				}}
				onClick={(e) => {
					const coords = e.get("coords")
					setCoords(coords)
					setMarkCoords(coords)
				}}
				
			>
			{markCoords &&
					<Placemark
						key={markCoords[0]}
						defaultGeometry={markCoords}
						// properties={{
						// 	balloonContentHeader: 
						// 		`Заказ № ${target.number}<br>
						// 		<span class="description">Товаров: ${target.products.length}</span>`,
						// 	balloonContentBody: `
						// 		<b>Данные заказчика</b><br/> 
						// 		<div class='placemark-body-item'>
						// 			<img src=${human} alt="" width="17px" height="17px"/>
						// 			<p>${target.username}</p><br/>
						// 		</div>
						// 		<div class='placemark-body-item'>
						// 			<img src=${phone} alt="" width="17px" height="17px"/>
						// 			<a href="tel:${target.phone}">${formatPhoneNumber(target.phone)}</a><br/>
						// 		</div>
						// 		<div class='placemark-body-item'>
						// 			<img src=${placemark} alt="" width="17px" height="17px"/>
						// 			<p>${target.street}, д. ${target.house}, кв. ${target.apartment}</p><br/>
						// 		</div>
						// 		`,
						// }}
						options={{
							iconLayout: "default#image",
							// iconImageSize: markSize || [50, 50],
							// iconImageHref: 'https://img.icons8.com/glyph-neue/64/map-pin.png'
						}}
					/>
				}
				<GeolocationControl options={{position: {top: 50, right: 10}}} />
				<SearchControl options={{ float: "right" }} />
			</Map>
		</YMaps>
	)
}