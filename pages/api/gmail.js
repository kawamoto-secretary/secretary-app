import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "未ログイン" });

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "in:inbox",
      maxResults: 20,
    });

    const messages = response.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });
        const headers = detail.data.payload.headers;
        const get = (name) => headers.find((h) => h.name === name)?.value || "";
        return {
          subject: get("Subject"),
          from: get("From"),
          date: get("Date"),
          snippet: detail.data.snippet,
        };
      })
    );

    res.status(200).json({ emails });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
