/**
 * Parses the natural-language style input you originally gave me.
 * Looks for a YouTube URL + numbered clips with timestamps.
 */

export function parseNaturalInput(text) {
  const urlMatch = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i);
  const url = urlMatch ? urlMatch[0] : null;

  const clips = [];

  // Match patterns like:
  // 1. The "Burning Man" Rant (Timestamp: 00:02:35 to 00:03:15)
  // or
  // 1. Something (00:02:35 to 00:03:15)
  // or
  // * Timestamp: 00:02:35 to 00:03:15

  const clipRegex = /(?:^|\n)\s*(?:\d+\.|[-*])\s*(.+?)\s*(?:\(.*?Timestamp:\s*)?(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:to|-)\s*(\d{1,2}:\d{2}(?::\d{2})?)/gim;

  let match;
  while ((match = clipRegex.exec(text)) !== null) {
    let name = match[1].trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\(.*$/, '')
      .trim();

    // Clean up common junk
    name = name.replace(/rant$/i, 'Rant').replace(/\s+/g, ' ');
    if (!name) name = `clip_${clips.length + 1}`;

    clips.push({
      name: sanitizeFilename(name),
      start: match[2],
      end: match[3]
    });
  }

  // Fallback: look for any "HH:MM:SS to HH:MM:SS" pairs
  if (clips.length === 0) {
    const simpleRegex = /(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:to|-)\s*(\d{1,2}:\d{2}(?::\d{2})?)/g;
    let i = 1;
    while ((match = simpleRegex.exec(text)) !== null) {
      clips.push({
        name: `clip_${i++}`,
        start: match[1],
        end: match[2]
      });
    }
  }

  return { url, clips };
}

function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'clip';
}
