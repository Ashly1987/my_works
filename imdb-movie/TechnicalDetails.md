# Technical Details

## Real-Time Movie Search

The movie search runs fully in the browser through `app.js`.

1. The user enters a movie name in the search input.
2. When the user clicks `Search`, the form submit handler runs and prevents the page from reloading.
3. The app calls IMDb's public suggestion endpoint.

Example:

```txt
https://v3.sg.media-imdb.com/suggestion/i/inception.json
```

The first folder letter is based on the first letter or number in the search query.

Examples:

```txt
Interstellar -> /suggestion/i/interstellar.json
Batman -> /suggestion/b/batman.json
```

4. IMDb returns JSON data with title details such as:

- IMDb title id
- Movie title
- Year
- Type
- Cast
- Poster image

5. The app filters the results to IMDb title IDs that start with `tt`, because IMDb title pages use IDs like:

```txt
tt1375666
```

6. The app creates the normal IMDb URL from the title ID.

```js
const getImdbUrl = (id) => `https://www.imdb.com/title/${id}/`;
```

Example:

```txt
https://www.imdb.com/title/tt1375666/
```

7. The app creates the PlayIMDb URL by replacing the IMDb domain.

```js
const getPlayUrl = (id) => getImdbUrl(id).replace("www.imdb.com", "www.playimdb.com");
```

Example:

```txt
https://www.playimdb.com/title/tt1375666/
```

8. The movie results are rendered as tiles using the template in `index.html`.

## Views Recorder

The current views recorder stores counts in the browser using `localStorage`.

It records:

- Today's views
- Total views
- Last 7 days
- Last 14 days
- Last 30 days

This is useful for local demos, but it is not a real global traffic counter. Each visitor's browser has separate `localStorage`, so the counts are not shared between users.

For a deployed website, use a backend-backed counter instead. Good options include:

- A serverless API with a database
- Supabase
- Firebase
- An analytics tool such as Plausible, Umami, or Google Analytics

A production-ready custom counter would usually use endpoints like:

```txt
POST /api/views
GET /api/views
```

`POST /api/views` would record a page view for today's date.

`GET /api/views` would return today's views, total views, and the 7/14/30 day report data.
