// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const gallery = document.getElementById('gallery');
const loadButton = document.getElementById('loadButton');
const apiKeyInput = document.getElementById('apiKey');
const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.querySelector('.modal-close');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch the selected dates from NASA's public APOD API.
dateForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	if (startInput.value > endInput.value) {
		showMessage('Choose a start date that is before the end date.');
		return;
	}

	gallery.setAttribute('aria-busy', 'true');
	gallery.innerHTML = '<div class="placeholder"><p>Loading space photos...</p></div>';
	loadButton.disabled = true;

	const apiUrl = new URL('https://api.nasa.gov/planetary/apod');
	apiUrl.searchParams.set('start_date', startInput.value);
	apiUrl.searchParams.set('end_date', endInput.value);
	apiUrl.searchParams.set('api_key', apiKeyInput.value.trim() || 'DEMO_KEY');

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA could not load those photos. Please try again.');
		}

		const photos = await response.json();
		const hasDemoPlaceholder = photos.some((photo) =>
			photo.title === 'NASA Science' && photo.url?.includes('nasa-logo@2x.png')
		);

		if (hasDemoPlaceholder) {
			showMessage('NASA returned its generic demo image instead of APOD photos. Enter a personal NASA API key above and try again.');
			return;
		}

		const imagePhotos = photos.filter((photo) => photo.media_type === 'image');

		if (imagePhotos.length === 0) {
			showMessage('No images were found for this date range.');
			return;
		}

		displayPhotos(imagePhotos);
	} catch (error) {
		showMessage(error.message || 'Something went wrong while loading photos.');
	} finally {
		gallery.setAttribute('aria-busy', 'false');
		loadButton.disabled = false;
	}
});

function displayPhotos(photos) {
	gallery.replaceChildren();

	photos.forEach((photo) => {
		const card = document.createElement('button');
		const image = document.createElement('img');
		const title = document.createElement('span');
		const date = document.createElement('span');

		card.type = 'button';
		card.className = 'gallery-item';
		image.src = photo.hdurl || photo.url;
		image.alt = photo.title;
		image.loading = 'lazy';
		title.className = 'photo-title';
		title.textContent = photo.title;
		date.className = 'photo-date';
		date.textContent = photo.date;

		card.append(image, title, date);
		card.addEventListener('click', () => openPhoto(photo));
		gallery.append(card);
	});
}

function openPhoto(photo) {
	modalImage.src = photo.hdurl || photo.url;
	modalImage.alt = photo.title;
	modalDate.textContent = photo.date;
	modalTitle.textContent = photo.title;
	modalExplanation.textContent = photo.explanation;
	photoModal.showModal();
}

function showMessage(message) {
	const placeholder = document.createElement('div');
	const text = document.createElement('p');

	placeholder.className = 'placeholder';
	text.textContent = message;
	placeholder.append(text);
	gallery.replaceChildren(placeholder);
}

modalClose.addEventListener('click', () => photoModal.close());

photoModal.addEventListener('click', (event) => {
	if (event.target === photoModal) {
		photoModal.close();
	}
});
