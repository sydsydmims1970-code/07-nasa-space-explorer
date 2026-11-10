# NASA Space Explorer
Browse NASA's Astronomy Picture of the Day (APOD) by date range. Select dates, load the gallery, and open a photo to read its explanation.

## Run the app
Open `index.html` in a browser. The date inputs default to the most recent nine days, and the gallery uses NASA's APOD API.

The app starts with NASA's shared `DEMO_KEY`, which has a low request limit. For regular use, request a personal key at [api.nasa.gov](https://api.nasa.gov/) and replace the `apiKey` value near the top of `js/script.js`.

The date controls are limited to APOD's archive dates by `js/dateRange.js`. APOD can return videos as well as images; video entries with thumbnails appear in the gallery and link to the original video from the details dialog.
