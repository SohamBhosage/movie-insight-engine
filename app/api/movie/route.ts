import { NextResponse } from "next/server";

// This replaces the expensive OpenAI call with a lightning-fast local logic
function getMovieInsights(data: any) {
  const rating = parseFloat(data.imdbRating) || 0;
  const title = data.Title;
  const actors = data.Actors.split(',').slice(0, 2).join(' & ');
  const genre = data.Genre.split(',')[0];
  const director = data.Director;

  let summary = "";
  let label = "Neutral";

  if (rating >= 8.0) {
    label = "Positive";
    summary = `A masterclass in ${genre} storytelling. Directed by ${director}, this film is anchored by the remarkable chemistry of ${actors}. Its high rating reflects a rare alignment of critical success and massive audience appeal.`;
  } else if (rating >= 6.5) {
    label = "Mixed";
    summary = `${title} represents a strong entry in the ${genre} category. While ${director} leans into some familiar tropes, the performances by ${actors} provide enough emotional weight to keep the audience engaged.`;
  } else {
    label = "Negative";
    summary = `This ${genre} title has sparked significant debate. While the collaboration between ${director} and lead stars like ${actors} showed promise, the current sentiment suggests a disconnect in pacing or plot execution.`;
  }

  return { summary, label };
}

async function fetchTMDBData(movieTitle: string) {
  try {
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieTitle)}&api_key=${process.env.TMDB_API_KEY}`
    );
    const searchData = await searchRes.json();
    return searchData.results?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  

  if (!query) {
    return NextResponse.json({ error: "Search query required" }, { status: 400 });
  }

  try {
    const imdbRegex = /^tt\d{7,8}$/;
    const apiUrl = imdbRegex.test(query)
      ? `http://www.omdbapi.com/?i=${query}&apikey=${process.env.OMDB_API_KEY}`
      : `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${process.env.OMDB_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.Response === "False") {
      return NextResponse.json({ error: "Movie not found !" }, { status: 404 });
    }

    const rating = parseFloat(data.imdbRating) || 0;
    
    // Generate the "Fixed" AI Summary locally
   const insights = getMovieInsights(data);

return NextResponse.json({
  title: data.Title || "Unknown Title",
  year: data.Year || "N/A",
  rating: data.imdbRating || "0.0",
  votes: data.imdbVotes || "0",
  // Ensure we have a fallback for the poster
  poster: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/300x450?text=No+Poster+Found",
  plot: data.Plot || "No plot available.",
  cast: data.Actors || "Cast information not found.",
  genre: data.Genre || "N/A",
  aiSummary: insights.summary,
  sentimentLabel: insights.label
});

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}