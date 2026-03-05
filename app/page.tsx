"use client";

import { useState, useEffect, KeyboardEvent } from "react";

// --- TYPES & INTERFACES ---
interface MovieData {
  title: string;
  year: string;
  poster: string;
  rating: string;
  genre: string;
  votes: string;
  cast: string;
  plot: string;
  sentimentLabel: "Positive" | "Mixed" | "Negative";
  aiSummary: string;
}

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  
  const [query, setQuery] = useState("");
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stages = [
    "Initializing Neural Core...",
    "Synchronizing Metadata Streams...",
    "Calibrating Sentiment Analyzers...",
    "Establishing Secure Connection..."
  ];

  const startDiving = () => {
    setIsTransitioning(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage < stages.length) {
        setLoadingStage(stage);
      } else {
        clearInterval(interval);
        setHasStarted(true);
        setIsTransitioning(false);
      }
    }, 800); 
  };

  const fetchMovie = async () => {
    if (!query) { setError("Please enter a movie name."); return; }
    try {
      setLoading(true);
      setError("");
      setMovie(null);
      const res = await fetch(`/api/movie?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMovie(data);
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => { 
    if (e.key === "Enter") fetchMovie(); 
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "Positive": return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "#22c55e"};
      case "Mixed": return { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15", border: "#eab308" };
      case "Negative": return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "#ef4444" };
      default: return { bg: "rgba(148, 163, 184, 0.1)", text: "#94a3b8", border: "#475569" };
    }
  };

  const themeStyles = {
    pageWrapper: {
      ...styles.pageWrapper,
      backgroundColor: isDarkMode ? "#0a0a0c" : "#f8fafc",
      color: isDarkMode ? "#e2e8f0" : "#1e293b",
      backgroundImage: isDarkMode 
        ? "radial-gradient(circle at 50% -20%, #1e1b4b 0%, #0a0a0c 80%)" 
        : "radial-gradient(circle at 50% -20%, #e0e7ff 0%, #f8fafc 80%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: !hasStarted ? "center" : "flex-start",
      alignItems: "center",
    },
    title: { ...styles.title, color: isDarkMode ? "#ffffff" : "#0f172a" },
    subtitle: { ...styles.subtitle, color: isDarkMode ? "#94a3b8" : "#64748b" },
    searchBox: { 
        ...styles.searchBox, 
        backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"
    },
    input: { 
        ...styles.input, 
        backgroundColor: isDarkMode ? "#0f172a" : "#ffffff", 
        color: isDarkMode ? "#fff" : "#000",
        borderColor: isDarkMode ? "#334155" : "#cbd5e1"
    },
    card: { 
        ...styles.card, 
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.9)",
        borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    movieTitle: { ...styles.movieTitle, color: isDarkMode ? "#fff" : "#0f172a" },
    sectionText: { ...styles.sectionText, color: isDarkMode ? "#cbd5e1" : "#334155" },
    summaryBox: { ...styles.summaryBox, backgroundColor: isDarkMode ? "rgba(2, 6, 23, 0.4)" : "#f1f5f9" },
    insightTitle: { ...styles.insightTitle, color: isDarkMode ? "#f8fafc" : "#1e293b" }
  };

  if (!hasStarted) {
    return (
      <div style={themeStyles.pageWrapper as any}>
        <button onClick={toggleTheme} style={styles.themeToggle}>
          {isDarkMode ? "🌙 DARK" : "☀️ LIGHT"}
        </button>
        <div style={styles.bootContainer}>
          {!isTransitioning ? (
            <div style={{ animation: 'fadeInScale 1.2s ease-out', padding: '0 20px' }}>
              <h1 style={{ ...themeStyles.title, fontSize: 'clamp(2.2rem, 8vw, 4.2rem)', lineHeight: '1.1' }}>
                Ready to dive into <br/>
                <span style={styles.aiSparkle}>Cinematic Intelligence?</span>
              </h1>
              <button onClick={startDiving} style={styles.glowButton}>
                YES, INITIALIZE ACCESS
              </button>
            </div>
          ) : (
            <div style={styles.loaderContent}>
               <div style={styles.progressBarBg}>
                  <div style={{...styles.progressBarFill, width: `${(loadingStage + 1) * 25}%`}}></div>
               </div>
               <h2 style={styles.loadingStatus}>{stages[loadingStage]}</h2>
               <div style={styles.binaryOverlay}>01010110 10010101 11010010</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{...themeStyles.pageWrapper as any, padding: "80px 20px", animation: 'revealDashboard 1.2s cubic-bezier(0.16, 1, 0.3, 1)'}}>
      <button onClick={toggleTheme} style={styles.themeToggle}>
        {isDarkMode ? "🌙 DARK" : "☀️ LIGHT"}
      </button>

      <main style={styles.container}>
        <header style={styles.header}>
          <h1 style={{...themeStyles.title, fontSize: 'clamp(1.8rem, 6vw, 3.2rem)'}}>
            🎬 <span style={styles.aiSparkle}>AI</span> Movie Insights
          </h1>
          <p style={themeStyles.subtitle}>Cinematic Insights, Brewed Instantly.</p>
        </header>

        <div style={themeStyles.searchBox}>
          <input
            type="text"
            placeholder="Search movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            style={themeStyles.input}
          />
          <button onClick={fetchMovie} style={styles.button} disabled={loading}>
            {loading ? "..." : "ANALYZE"}
          </button>
        </div>

        {error && <div style={styles.errorCard}>{error}</div>}

        {loading && (
          <div style={styles.loaderContainer}>
            <div style={styles.shimmerLine}></div>
            <p style={styles.loadingText}>EXTRACTING MOVIE DETAILS...</p>
          </div>
        )}

        {movie && (
          <div style={{...themeStyles.card, animation: 'fadeInBlur 0.8s ease'}}>
            <div style={{...styles.posterWrapper, maxWidth: isMobile ? "250px" : "280px"}}>
              <img src={movie.poster} alt={movie.title} style={styles.poster} />
              <div style={styles.ratingBadge}>{movie.rating} ⭐</div>
            </div>
            
            <div style={styles.details}>
              <h2 style={{...themeStyles.movieTitle, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', textAlign: isMobile ? 'center' : 'left'}}>
                {movie.title} <span style={styles.year}>({movie.year})</span>
              </h2>
              <div style={{...styles.metaRow, justifyContent: isMobile ? 'center' : 'flex-start'}}>
                <span><strong>Genre:</strong> {movie.genre}</span>
                <span><strong>Votes:</strong> {movie.votes}</span>
              </div>
              <div style={styles.section}>
                <h4 style={styles.sectionLabel}>The Cast</h4>
                <p style={themeStyles.sectionText}>{movie.cast}</p>
              </div>
              <div style={styles.section}>
                <h4 style={styles.sectionLabel}>Analysis</h4>
                <p style={themeStyles.sectionText}>{movie.plot}</p>
              </div>
              
              <div style={{...themeStyles.summaryBox, borderLeft: `4px solid ${getSentimentColor(movie.sentimentLabel).border}`}}>
                <div style={styles.summaryHeader}>
                  <h3 style={themeStyles.insightTitle}>🧠 Intelligence Report</h3>
                  {/* --- FIXED THE ERROR AND REFINED THE BADGE STYLE BELOW --- */}
                  <span style={{
                    ...styles.badge, 
                    backgroundColor: getSentimentColor(movie.sentimentLabel).bg, 
                    color: getSentimentColor(movie.sentimentLabel).text, 
                    border: `1px solid ${getSentimentColor(movie.sentimentLabel).border}`
                  }}>
                    {movie.sentimentLabel}
                  </span>
                </div>
                <p style={styles.summaryText}>{movie.aiSummary}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: any = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    transition: "all 0.6s ease",
    position: "relative",
    overflowX: "hidden"
  },
  themeToggle: { 
    position: "absolute", 
    top: "20px", 
    right: "20px", 
    padding: "10px 16px", 
    borderRadius: "6px", 
    border: "1px solid #818cf8", 
    background: "transparent", 
    color: "#818cf8", 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    cursor: "pointer", 
    zIndex: 1000 
  },
  bootContainer: { 
    textAlign: 'center', 
    width: '100%', 
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  glowButton: {
    marginTop: '40px',
    padding: '18px 40px',
    background: 'transparent',
    border: '2px solid #818cf8',
    color: '#818cf8',
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '0.2em',
    cursor: 'pointer',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(129, 140, 248, 0.2)',
    transition: 'all 0.3s ease'
  },
  // REFINED BADGE STYLE: Standard size and elegant border radius
  badge: {
    padding: "4px 12px",
    borderRadius: "50px", 
    fontSize: "0.65rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "inline-block"
  },
  progressBarBg: { width: '80%', maxWidth: '350px', height: '2px', backgroundColor: 'rgba(129, 140, 248, 0.1)', margin: '0 auto', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#818cf8', transition: 'width 0.8s ease' },
  loadingStatus: { marginTop: '25px', fontSize: '0.7rem', letterSpacing: '0.4em', color: '#818cf8' },
  container: { width: "100%", maxWidth: "1000px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "10px" },
  aiSparkle: { background: "linear-gradient(to right, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle: { fontSize: "0.75rem", fontWeight: "700", letterSpacing: '0.3em' },
  searchBox: { 
    display: "flex", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    marginBottom: "50px", 
    gap: "12px", 
    padding: "14px", 
    borderRadius: "14px", 
    border: "1px solid" 
  },
  input: { 
    padding: "14px 20px", 
    flex: "1 1 250px", 
    maxWidth: "450px",
    borderRadius: "10px", 
    border: "1px solid", 
    fontSize: "1rem", 
    outline: "none" 
  },
  button: { padding: "14px 28px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: "900", cursor: "pointer" },
  card: { 
    display: "flex", 
    gap: "40px", 
    padding: "35px", 
    borderRadius: "24px", 
    border: "1px solid",
    width: "100%"
  },
  posterWrapper: { position: "relative", width: "100%" },
  poster: { width: "100%", borderRadius: "14px", objectFit: "cover" },
  ratingBadge: { position: "absolute", top: "-8px", right: "-8px", backgroundColor: "#000", padding: "6px 12px", borderRadius: "8px", border: "1px solid #eab308", color: "#fff", fontSize: "0.9rem", fontWeight: "bold" },
  details: { width: "100%" },
  movieTitle: { fontWeight: "900", marginBottom: '8px' },
  metaRow: { display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "25px", fontSize: "0.9rem", color: '#94a3b8' },
  sectionLabel: { color: "#818cf8", fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" },
  sectionText: { lineHeight: "1.7", fontSize: "0.95rem" },
  summaryBox: { marginTop: "30px", padding: "20px", borderRadius: "12px" },
  summaryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  insightTitle: { margin: 0, fontSize: "1.1rem", fontWeight: "800" },
  errorCard: { backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#f87171", padding: "18px", borderRadius: "12px", textAlign: "center", margin: "0 auto 30px auto", maxWidth: "500px", border: "1px solid rgba(220, 38, 38, 0.3)" },
  loadingText: { color: "#818cf8", marginTop: "20px", fontSize: '0.7rem', letterSpacing: '0.3em', fontWeight: 'bold' },
  binaryOverlay: { fontSize: '0.6rem', color: '#1e1b4b', marginTop: '15px', fontFamily: 'monospace' }
};