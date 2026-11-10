# NASA Space Explorer
Browse NASA's Astronomy Picture of the Day (APOD) by date range. Select dates, load the gallery, and open a photo to read its explanation.

## Run the app
Open `index.html` in a browser. The date inputs default to the most recent nine days, and the gallery uses NASA's APOD API.

Enter a personal key from [api.nasa.gov](https://api.nasa.gov/) in the form before loading photos. NASA's shared `DEMO_KEY` currently returns a generic placeholder instead of APOD content. Keys entered in the form are used for that request only and are not saved.

The date controls are limited to APOD's archive dates by `js/dateRange.js`. APOD can return videos as well as images; video entries with thumbnails appear in the gallery and link to the original video from the details dialog.
