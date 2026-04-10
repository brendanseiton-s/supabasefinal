export default function Home() {
  return (
    <div style={{
      textAlign: "center",
      marginTop: "100px",
      fontFamily: "Arial"
    }}>
      
      {/* Title */}
      <h1>Student Portal Demo</h1>

      {/* Description */}
      <p>A simple integrated web app using Supabase and Vercel.</p>

      {/* Button */}
      <a href="/login">
        <button style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer"
        }}>
          Get Started
        </button>
      </a>

    </div>
  );
}