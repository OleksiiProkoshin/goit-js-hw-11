import { fetchPic } from "./fetch-pic";
import { markupGallery } from "./markup-gallery";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";

const searchForm = document.querySelector('.search-form').addEventListener('submit', handleSearchForm);
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');
const lightbox = new SimpleLightbox('.gallery a');

let query;
let page = 1;
const perPage = 40;

const options = {
	root: null,
	rootMargin: '300px',
	threshold: 0,
}

const observer = new IntersectionObserver(handlerPagination, options);

function handlerPagination(entries, observer) {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			page += 1;
			fetchPic(query, page, perPage)
				.then(({data}) => {
					markupGallery(data.hits);
					lightbox.refresh();
					console.log(gallery.children.length);
					console.log(data.totalHits);
					if (gallery.children.length >= data.totalHits) {
						observer.unobserve(entry.target);
						Notify.failure("We're sorry, but you've reached the end of search results.");
						page = 1;
					}
				})
				.catch(err => console.error(err))
		}
	});
}

function handleSearchForm(e) {
	e.preventDefault();
	query = e.currentTarget.searchQuery.value.trim();

	if (query === '') {
		Notify.failure("The search cannot be empty!");
		return;
	}

	fetchPic(query, page, perPage)
		.then(({data}) => {
			gallery.textContent = '';
			if (data.totalHits === 0) {
				Notify.failure('Sorry, there are no images matching your search. Please try again.');
			} else {
				Notify.success(`We found ${data.totalHits} images.`);
				markupGallery(data.hits);
				lightbox.refresh();
				const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
				window.scrollBy({top: cardHeight * 2, behavior: 'smooth'});
				if (gallery.children.length < data.totalHits) {
					observer.observe(guard);
				}
			}
		})
		.catch(err => console.error(err))
		.finally(() => e.target.reset());
}

// кнопка повернення нагору
const goTopBtn = document.querySelector(".go-top");

window.addEventListener("scroll", trackScroll);

goTopBtn.addEventListener("click", goTop);

function trackScroll() {
	const scrolled = window.pageYOffset;
	const coords = document.documentElement.clientHeight;
	if (scrolled > coords) {
		goTopBtn.classList.add("go-top--show");
	} else {
		goTopBtn.classList.remove("go-top--show");
	}
}
trackScroll();

function goTop() {
	if (window.pageYOffset > 0) {
		window.scrollBy(0, -75);
		setTimeout(goTop, 0);
	}
}
goTop();