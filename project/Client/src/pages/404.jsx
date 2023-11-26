import Header from '../components/header.jsx';
import '../components/normalize.css'
import Er404 from '../img/icons/404.jpg'
export default function ER404() {
	return (
		<div className='container'>
			{/* <Header/> */}
			<img className='img-404' src={Er404} alt="" style={{marginTop:-25,marginBottom: -25}}/>
		</div>
	);
  };
