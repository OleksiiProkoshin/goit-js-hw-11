import axios from 'axios';
export { fetchPic };

axios.defaults.baseURL = 'https://pixabay.com/api';
const API_KEY = '38514161-f950138758225d897083d0d15';

async function fetchPic(query, page, perPage) {
	const resp = await axios.get(`/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`)
	return resp;
}