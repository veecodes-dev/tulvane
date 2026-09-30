// Demo chat helper. It uses simple rules, so the demo works offline.
// In a real project, replace askBot with a call to an AI API on your server.
import { products } from './data';

export async function askBot(text: string): Promise<string> {
  const t = text.toLowerCase();
  await new Promise((r) => setTimeout(r, 600));

  if (/(deliver|shipping|arrive|when)/.test(t))
    return 'We deliver in the same city every day from 9:00 to 18:00. Order before 14:00 for same-day delivery. Delivery costs €4.90 and is free from €50.';
  if (/(return|refund|wilt|dead|broken)/.test(t))
    return 'If your flowers arrive damaged, send us a photo within 24 hours. We will send new flowers or give your money back.';
  if (/(open|hour)/.test(t)) return 'Our shop is open every day from 9:00 to 19:00. This app is open all day and night.';
  if (/birthday/.test(t)) return 'For a birthday I suggest the Blush Rose & Eucalyptus or the Sunset Tulip Bunch. Both are bright and happy.';
  if (/(sorry|apolog|calm|thank)/.test(t)) return 'For a soft, calm message try the Peach Dried Bouquet. Add a card with a few kind words.';
  if (/(allerg|pollen|pet|cat|dog)/.test(t))
    return 'If you have allergies, the Peach Dried Bouquet is a good choice because dried flowers give less pollen. Some flowers, like lilies, are unsafe for cats.';
  if (/(dry|dried|long|last)/.test(t)) return 'The Peach Dried Bouquet lasts for months. Fresh bouquets last 7 to 10 days in clean water.';
  if (/(cheap|price|budget|under)/.test(t)) {
    const low = [...products].sort((a, b) => a.price - b.price).slice(0, 3);
    return `Our lowest prices: ${low.map((p) => `${p.name} (€${p.price})`).join(', ')}.`;
  }
  if (/(^|\s)(hi|hello|hey)(\s|!|$)/.test(t)) return 'Hello! I can help you choose flowers, or tell you about delivery and returns. What do you need?';
  return 'I can help with gifts, delivery, returns and flower care. Try: "What is good for a birthday?"';
}
