const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('status');
const submitButton = dateForm.querySelector('button[type="submit"]');
const apiKeyInput = document.getElementById('apiKey');

setupDateInputs(startInput, endInput);

// Build the photo details dialog once, then fill it with the selected APOD.
const modal = document.createElement('dialog');
modal.className = 'photo-modal';
modal.setAttribute('aria-labelledby', 'modalTitle');
modal.innerHTML = `
	<div class="modal-content">
		<button class="modal-close" type="button" aria-label="Close photo details">&times;</button>
		<img class="modal-image" alt="" />
		<div class="modal-copy">
			<p class="modal-date"></p>
			<h2 id="modalTitle"></h2>
			<p class="modal-explanation"></p>
			<a class="modal-video-link" target="_blank" rel="noopener noreferrer">Watch this APOD video</a>
		</div>
	</div>
`;
document.body.append(modal);

modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
	if (event.target === modal) modal.close();
});

function showStatus(message, state = '') {
	statusMessage.textContent = message;
	statusMessage.className = `status ${state}`.trim();
}

function openPhotoDetails(photo) {
	const image = modal.querySelector('.modal-image');
	const videoLink = modal.querySelector('.modal-video-link');

	image.hidden = photo.media_type !== 'image';
	image.src = photo.hdurl || photo.url || photo.thumbnail_url || '';
	image.alt = photo.title;
	modal.querySelector('.modal-date').textContent = photo.date;
	modal.querySelector('#modalTitle').textContent = photo.title;
	modal.querySelector('.modal-explanation').textContent = photo.explanation;
	videoLink.hidden = photo.media_type !== 'video';
	videoLink.href = photo.url || photo.href || '#';
	modal.showModal();
}

function createPhotoCard(photo) {
	const card = document.createElement('button');
	card.className = 'gallery-item';
	card.type = 'button';
	card.setAttribute('aria-label', `View ${photo.title}, ${photo.date}`);

	const image = document.createElement('img');
	image.src = photo.media_type === 'video'
		? photo.thumbnail_url
		: photo.hdurl || photo.url;
	image.alt = photo.title;
	image.loading = 'lazy';

	const details = document.createElement('span');
	details.className = 'gallery-copy';
	const date = document.createElement('span');
	date.className = 'gallery-date';
	date.textContent = photo.date;
	const title = document.createElement('span');
	title.className = 'gallery-title';
	title.textContent = photo.title;
	details.append(date, title);
	card.append(image, details);
	card.addEventListener('click', () => openPhotoDetails(photo));

	return card;
}

async function loadPhotos(event) {
	event.preventDefault();
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		showStatus('Choose a valid date range to continue.', 'error');
		return;
	}

	const apiKey = apiKeyInput.value.trim();
	if (!apiKey || apiKey === 'DEMO_KEY') {
		showStatus('Enter your personal NASA API key. The shared demo key is returning a generic image.', 'error');
		return;
	}

	// Ask APOD for the selected dates and thumbnails for video entries.
	const params = new URLSearchParams({ start_date: startDate, end_date: endDate, thumbs: 'true', api_key: apiKey });
	const apiUrl = `https://api.nasa.gov/planetary/apod?${params}`;

	submitButton.disabled = true;
	gallery.replaceChildren();
	showStatus('Loading space photos...');

	try {
		const response = await fetch(apiUrl);
		const result = await response.json();
		if (!response.ok) {
			throw new Error(result.error?.message || `NASA's API returned an error (${response.status}).`);
		}

		// APOD returns an array for a date range and one object for a single date.
		const photos = Array.isArray(result) ? result : [result];
		const hasDemoPlaceholder = photos.some((photo) => (
			photo.title === 'NASA Science' && photo.url?.includes('nasa-logo@2x.png')
		));
		if (hasDemoPlaceholder) {
			showStatus('NASA returned its generic placeholder instead of APOD photos. This is not the invalid-key response; try again later rather than generating another key.', 'error');
			return;
		}

		const displayablePhotos = photos.filter((photo) => (
			photo.media_type === 'image' || (photo.media_type === 'video' && photo.thumbnail_url)
		));

		if (displayablePhotos.length === 0) {
			showStatus('No displayable space photos were found for those dates.', 'empty');
			return;
		}

		const fragment = document.createDocumentFragment();
		displayablePhotos.forEach((photo) => fragment.append(createPhotoCard(photo)));
		gallery.append(fragment);
		showStatus(`${displayablePhotos.length} space photo${displayablePhotos.length === 1 ? '' : 's'} found.`);
	} catch (error) {
		showStatus(`${error.message} Please try again in a moment.`, 'error');
	} finally {
		submitButton.disabled = false;
	}
}

dateForm.addEventListener('submit', loadPhotos);
