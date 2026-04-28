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

The views recorder can use Firebase Firestore for global counts.

It records:

- Today's views
- Total views
- Last 7 days
- Last 14 days
- Last 30 days

When Firebase is configured, each page load increments a Firestore document for the current date in the `quickflixViews` collection. The document id is the date, for example:

```txt
quickflixViews/2026-04-28
```

Example document:

```json
{
  "count": 24,
  "date": "2026-04-28"
}
```

Firestore transactions are used so multiple visitors can load the page at the same time without overwriting each other's count.

If Firebase config is missing or Firebase cannot be reached, the app falls back to `localStorage`. That fallback is useful for local demos, but it is not a real global traffic counter because each visitor's browser has separate storage.

To enable global views:

1. Create a Firebase project.
2. Add a Web App in Firebase.
3. Enable Firestore Database.
4. Copy the Firebase web config into `window.QUICKFLIX_FIREBASE_CONFIG` in `index.html`.
5. Deploy the site.

Starting Firestore rules:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /quickflixViews/{viewDate} {
      allow read: if true;

      allow create: if request.resource.data.keys().hasOnly(["count", "date"])
        && request.resource.data.count == 1
        && request.resource.data.date == viewDate;

      allow update: if request.resource.data.keys().hasOnly(["count", "date"])
        && request.resource.data.date == resource.data.date
        && request.resource.data.count == resource.data.count + 1;

      allow delete: if false;
    }
  }
}
```

For a small personal website, direct Firestore writes are okay as a simple starting point. For stronger protection against fake view spam, use a Firebase Cloud Function or another serverless API to record views instead of allowing browser clients to write counts directly.

Other good global view options include:

- A serverless API with a database
- Supabase
- An analytics tool such as Plausible, Umami, or Google Analytics

A production-ready custom counter would usually use endpoints like:

```txt
POST /api/views
GET /api/views
```

`POST /api/views` would record a page view for today's date.

`GET /api/views` would return today's views, total views, and the 7/14/30 day report data.
