// Google Workspace Integration Service (Gmail, Calendar, Drive)

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  from?: string;
  subject?: string;
  date?: string;
}

export interface CalendarEventSummary {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  htmlLink?: string;
}

export interface DriveFileSummary {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

// ---------------- GMAIL API ----------------
export async function fetchGmailMessages(accessToken: string): Promise<GmailMessageSummary[]> {
  try {
    const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listRes.ok) {
      const err = await listRes.json();
      throw new Error(err.error?.message || 'Failed to fetch Gmail messages');
    }
    const listData = await listRes.json();
    if (!listData.messages || !Array.isArray(listData.messages)) {
      return [];
    }

    const messages: GmailMessageSummary[] = [];
    for (const msg of listData.messages.slice(0, 8)) {
      try {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
          messages.push({
            id: detail.id,
            threadId: detail.threadId,
            snippet: detail.snippet || '',
            from,
            subject,
            date,
          });
        }
      } catch (err) {
        console.warn('Error fetching message detail:', err);
      }
    }
    return messages;
  } catch (error: any) {
    console.error('fetchGmailMessages failed:', error);
    throw error;
  }
}

export async function sendGmailEmail(accessToken: string, to: string, subject: string, bodyText: string): Promise<any> {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to send Gmail message');
  }
  return await res.json();
}

// ---------------- CALENDAR API ----------------
export async function fetchCalendarEvents(accessToken: string): Promise<CalendarEventSummary[]> {
  try {
    const timeMin = new Date().toISOString();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=10&singleEvents=true&orderBy=startTime`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch calendar events');
    }
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => ({
      id: item.id,
      summary: item.summary || 'Scheduled Appointment',
      description: item.description || '',
      start: item.start?.dateTime || item.start?.date || '',
      end: item.end?.dateTime || item.end?.date || '',
      htmlLink: item.htmlLink,
    }));
  } catch (error: any) {
    console.error('fetchCalendarEvents failed:', error);
    throw error;
  }
}

export async function createCalendarEvent(
  accessToken: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string
): Promise<any> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create calendar event');
  }
  return await res.json();
}

// ---------------- DRIVE API ----------------
export async function fetchDriveFiles(accessToken: string): Promise<DriveFileSummary[]> {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=12&fields=files(id,name,mimeType,webViewLink,createdTime)', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch Drive files');
    }
    const data = await res.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      createdTime: file.createdTime,
    }));
  } catch (error: any) {
    console.error('fetchDriveFiles failed:', error);
    throw error;
  }
}

export async function uploadDriveReceipt(
  accessToken: string,
  fileName: string,
  content: string
): Promise<any> {
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to upload document to Google Drive');
  }
  return await res.json();
}
