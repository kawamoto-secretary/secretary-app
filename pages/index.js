import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    const res = await fetch("/api/gmail");
    const data = await res.json();
    setEmails(data.emails || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchEmails();
  }, [session]);

  if (!session) {
    return (
      <div style={styles.center}>
        <h1>AI秘書</h1>
        <button onClick={() => signIn("google")} style={styles.btn}>
          Googleでログイン
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>受信トレイ</h1>
        <div>
          <span style={styles.user}>{session.user.email}</span>
          <button onClick={() => signOut()} style={styles.btnSmall}>ログアウト</button>
        </div>
      </div>
      <button onClick={fetchEmails} style={styles.btn} disabled={loading}>
        {loading ? "読み込み中..." : "メールを更新"}
      </button>
      <div style={styles.list}>
        {emails.map((email, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.subject}>{email.subject}</div>
            <div style={styles.meta}>{email.from} — {email.date}</div>
            <div style={styles.snippet}>{email.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  center: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"sans-serif" },
  container: { maxWidth:700, margin:"0 auto", padding:24, fontFamily:"sans-serif" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  user: { marginRight:12, color:"#666", fontSize:14 },
  btn: { padding:"10px 20px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:15 },
  btnSmall: { padding:"6px 12px", background:"#e5e7eb", border:"none", borderRadius:6, cursor:"pointer" },
  list: { marginTop:16, display:"flex", flexDirection:"column", gap:12 },
  card: { background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:10, padding:16 },
  subject: { fontWeight:600, fontSize:15, marginBottom:4 },
  meta: { fontSize:12, color:"#6b7280", marginBottom:6 },
  snippet: { fontSize:13, color:"#374151" },
};
