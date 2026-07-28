import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gmail");
      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  if (!session) {
    return (
      <div>
        <h1>AI秘書</h1>
        <button onClick={() => signIn("google")}>Googleでログイン</button>
      </div>
    );
  }

  return (
    <div>
      <h1>受信トレイ</h1>
      <span>{session.user.email}</span>
      <button onClick={() => signOut()}>ログアウト</button>
      <br />
      <button onClick={fetchEmails} disabled={loading}>
        {loading ? "読み込み中..." : "メールを更新"}
      </button>
      {emails.map((email, i) => (
        <div key={i} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <strong>{email.subject}</strong>
          <p>{email.from}</p>
          <p>{email.date}</p>
          <p>{email.snippet}</p>
        </div>
      ))}
    </div>
  );
}
