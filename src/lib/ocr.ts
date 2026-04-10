import { createWorker, Worker } from "tesseract.js";

let worker: Worker | null = null;

export async function extractTextFromImage(imageData: string): Promise<string> {
  if (!worker) {
    worker = await createWorker("eng");
  }
  const result = await worker.recognize(imageData);
  return result.data.text;
}

export async function parseGCSETimetable(text: string): Promise<{
  exams: Array<{
    title: string;
    date: string;
    time: string;
  }>;
}> {
  const lines = text.split("\n").filter(l => l.trim());
  const exams: Array<{ title: string; date: string; time: string }> = [];

  const monthMap: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };

  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})|(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i;
  const timeRegex = /(\d{1,2}:\d{2}\s*(?:am|pm)?)|(\d{1,2}\s*(?:am|pm))/i;
  const subjectKeywords = [
    "maths", "mathematics", "english", "biology", "chemistry", "physics",
    "combined science", "trilogy", "history", "geography", "re", "religious",
    "computer science", "art", "music", "french", "spanish", "german",
    "dt", "design", "technology", "pe", "physical", "business", "economics",
    "psychology", "sociology", "media", "film", "drama", "theatre",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const hasSubject = subjectKeywords.some(kw => line.includes(kw));
    
    if (hasSubject) {
      const dateMatch = text.substring(text.indexOf(line), text.indexOf(line) + 100).match(dateRegex);
      const timeMatch = text.substring(text.indexOf(line), text.indexOf(line) + 100).match(timeRegex);
      
      if (dateMatch) {
        let date = "";
        let time = "09:00";
        
        if (dateMatch[1]) {
          const day = dateMatch[1].padStart(2, "0");
          const month = dateMatch[2].padStart(2, "0");
          let year = dateMatch[3];
          if (year.length === 2) year = "20" + year;
          date = `${year}-${month}-${day}`;
        } else if (dateMatch[4]) {
          const day = dateMatch[4].padStart(2, "0");
          const month = monthMap[dateMatch[5].toLowerCase().slice(0, 3)] || "05";
          const year = dateMatch[6];
          date = `${year}-${month}-${day}`;
        }

        if (timeMatch) {
          let t = timeMatch[0].toLowerCase().trim();
          if (t.includes("pm") && !t.includes("12:")) {
            const [h, m] = t.replace(/[a-z]/g, "").split(":").map(Number);
            if (h && h < 12) time = `${h + 12}:${(m || 0).toString().padStart(2, "0")}`;
          } else if (t.includes("am") && t.includes("12:")) {
            time = "00:00";
          } else if (!t.includes(":")) {
            const h = parseInt(t.replace(/[a-z]/g, ""));
            if (h && h < 12 && t.includes("pm")) time = `${h + 12}:00`;
            else if (h) time = `${h.toString().padStart(2, "0")}:00`;
          } else {
            const [h, m] = t.replace(/[a-z]/g, "").split(":").map(Number);
            if (h !== undefined) time = `${h.toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`;
          }
        }

        const title = lines[i].replace(dateRegex, "").replace(timeRegex, "").trim().slice(0, 50);
        
        if (title && date) {
          exams.push({ title, date, time });
        }
      }
    }
  }

  return { exams };
}

export async function processGCSEImage(imageData: string): Promise<{
  exams: Array<{ title: string; date: string; time: string }>;
}> {
  const text = await extractTextFromImage(imageData);
  return parseGCSETimetable(text);
}