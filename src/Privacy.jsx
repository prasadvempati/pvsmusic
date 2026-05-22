import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      background: "#0a0a0c",
      minHeight: "100vh",
      color: "#f0ece4",
      fontFamily: "'DM Sans', sans-serif",
      padding: "60px 24px",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ color: "#c9a84c", fontSize: 14, textDecoration: "none" }}>
            ← Back to PVS Music
          </a>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "2.5rem",
          color: "#e4c06e",
          marginBottom: 8,
        }}>Privacy Policy</h1>

        <p style={{ color: "#7a7570", fontSize: 14, marginBottom: 40 }}>
          Last updated: May 22, 2026
        </p>

        <div style={{ lineHeight: 1.8, color: "#c0bbb4" }}>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>1. Introduction</h2>
            <p>Welcome to PVS Music ("we", "our", or "us"). This Privacy Policy explains how we handle information when you use our website (pvsmusic.com) and mobile application (PVS Music app).</p>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>2. Information We Collect</h2>
            <p>PVS Music is a music discovery app. We do <strong style={{ color: "#f0ece4" }}>not</strong> collect, store, or share any personal information from users.</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>We do not require account registration</li>
              <li style={{ marginBottom: 8 }}>We do not collect your name, email, or contact details</li>
              <li style={{ marginBottom: 8 }}>We do not track your location</li>
              <li style={{ marginBottom: 8 }}>We do not use advertising identifiers</li>
              <li style={{ marginBottom: 8 }}>We do not sell any user data</li>
            </ul>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>3. Favorites Feature</h2>
            <p>The app allows you to save favorite songs. This data is stored <strong style={{ color: "#f0ece4" }}>locally on your device only</strong> using AsyncStorage. It is never transmitted to our servers or any third party.</p>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>4. YouTube API</h2>
            <p>Our app uses the YouTube Data API v3 to display public music videos from the PVS Music YouTube channel (@pvs4001). When you use our app, YouTube's own privacy policy applies to any interactions with YouTube content. You can review YouTube's privacy policy at <a href="https://policies.google.com/privacy" style={{ color: "#c9a84c" }} target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.</p>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>5. Third-Party Links</h2>
            <p>Our app contains links to YouTube videos. When you click these links, you are directed to YouTube, which has its own privacy policy. We are not responsible for the privacy practices of YouTube or any other third-party services.</p>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>6. Children's Privacy</h2>
            <p>PVS Music is intended for users 18 years and older. We do not knowingly collect any information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.</p>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={{ color: "#e4c06e", fontSize: "1.2rem", marginBottom: 12 }}>8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p style={{ marginTop: 8 }}>
              <strong style={{ color: "#f0ece4" }}>Email:</strong> pvs4001@gmail.com<br />
              <strong style={{ color: "#f0ece4" }}>Website:</strong> www.pvsmusic.com
            </p>
          </section>

        </div>

        <div style={{
          borderTop: "1px solid rgba(201,168,76,0.2)",
          marginTop: 60,
          paddingTop: 24,
          color: "#4a4845",
          fontSize: 13,
          textAlign: "center",
        }}>
          © {new Date().getFullYear()} PVS Music · All rights reserved
        </div>
      </div>
    </div>
  );
}
