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

let lastLoadedCount = 0;
let reachedEndOfResults = false;

function handlerPagination(entries, observer) {
	entries.forEach(entry => {
		if (entry.isIntersecting && !reachedEndOfResults) {
			page += 1;
			fetchPic(query, page, perPage)
				.then(({ data }) => {
					const totalHits = data.totalHits;
					const newImages = data.hits.length;
					
					if (newImages === 0) {
                        reachedEndOfResults = true;
						observer.unobserve(entry.target);
						Notify.failure("We're sorry, but you've reached the end of search results.");
					} else {
						markupGallery(data.hits);
						lightbox.refresh();
						lastLoadedCount += newImages;
						console.log(gallery.children.length);
						console.log(totalHits);
						if (lastLoadedCount >= totalHits) {
                            reachedEndOfResults = true;
							observer.unobserve(entry.target);
							Notify.failure("We're sorry, but you've reached the end of search results.");
						}
					}
				})
				.catch(err => console.error(err));
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

  gallery.textContent = '';
  page = 1;
  lastLoadedCount = 0;
  reachedEndOfResults = false;

	
  fetchPic(query, page, perPage)
    .then(({ data }) => {
      const totalHits = data.totalHits;
      const newImages = data.hits.length;

      if (newImages === 0) {
        Notify.failure('Sorry, there are no images matching your search. Please try again.');
      } else {
        Notify.success(`We found ${totalHits} images.`);
        markupGallery(data.hits);
        lightbox.refresh();
        const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
        window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
        if (lastLoadedCount < totalHits) {
          observer.observe(guard);
        } else {
          reachedEndOfResults = true;
          Notify.failure("We're sorry, but you've reached the end of search results.");
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