1.I'm building a platform where we watch movies so can you give me basic structure i'm providing you basic logics and design.
The Core Application.

  1.The Setup: Get a free API Key from TMDB (themoviedb.org).

  2.The Layout: Fetch the "Popular Movies" endpoint and display them in a beautiful CSS Grid (Movie Poster, Title, Release Year, and Rating).

  3.The Search Bar: Implement a search bar at the top. When the user types a movie name, fetch and display the results from the TMDB "Search" endpoint.

2. Performance Mastery.

Everything in Level 1, PLUS:

  1.Infinite Scroll: Remove traditional pagination (Page 1, 2, 3 buttons). Instead, when the user scrolls to the bottom of the page, automatically fetch and append "Page 2" of the movies to your grid.

  2.Debouncing: When searching, your app should NOT make an API call for every single keystroke. It should wait until the user stops typing for 500ms before making the request.

  3.Favorites List: Add a "Heart" icon to each movie. Clicking it saves the movie to a "My Favorites" list (save this to LocalStorage). Create a separate route/view to see saved favorites.

3.The AI "Mood Matcher".

Everything in Level 2, PLUS:

  1.Lazy Loading: Ensure all movie poster <img> tags utilize native lazy loading (loading="lazy") so images only download when they enter the viewport.

  2.AI Integration: Add a specific "Mood Matcher" input field.

  3.The Logic: The user types: "I am feeling sad but want an action movie." You send this prompt to Google Gemini/OpenAI to return a single Movie Title. You then silently search TMDB for that title and display the result to the user!

4. add a toggle switch feature for ai mood matcher and movies banner and add watch full movies button and trailer button where trailer are shown by youtube and movies are watched by the real owner of movies like netflix or others.
5.give a black red theme to the site and make it responsive for mobile and not zoomable in phones and make sure app name should not be hidden and allow horizontal scroll and not show scroll bar. .
  
