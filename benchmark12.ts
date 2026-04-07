import { HealthTimeline } from './frontend/app/lib/healthTimeline.ts';

const generateChats = (numChats, msgsPerChat) => {
  const chats = [];
  const words = ['hello', 'doctor', 'i', 'am', 'having', 'severe', 'pain', 'and', 'headache', 'i', 'started', 'taking', 'Aspirin', 'yesterday', 'but', 'the', 'fever', 'is', 'still', 'there', 'with', 'nausea', 'prescribed', 'Amoxicillin', 'tablet'];

  for (let i = 0; i < numChats; i++) {
    const messages = [];
    for (let j = 0; j < msgsPerChat; j++) {
      const content = Array(50).fill(0).map(() => words[Math.floor(Math.random() * words.length)]).join(' ');
      messages.push({
        isUser: true,
        content: content,
        timestamp: new Date()
      });
    }
    chats.push({ messages });
  }
  return chats;
};

const chats = generateChats(1000, 50);

const symptomKeywords = ['pain', 'headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizzy', 'ache'];

const start1 = performance.now();
for (const chat of chats) {
  for (const msg of chat.messages) {
    if (!msg.isUser) continue;
    const content = msg.content.toLowerCase();
    symptomKeywords.forEach(symptom => {
      if (content.includes(symptom)) {
      }
    });
  }
}
const end1 = performance.now();


const symptomRegex = new RegExp(`(${symptomKeywords.join('|')})`);

const start2 = performance.now();
for (const chat of chats) {
  for (const msg of chat.messages) {
    if (!msg.isUser) continue;
    const content = msg.content.toLowerCase();

    if (symptomRegex.test(content)) {
      symptomKeywords.forEach(symptom => {
        if (content.includes(symptom)) {
        }
      });
    }
  }
}
const end2 = performance.now();

console.log(`Original loop: ${end1 - start1} ms`);
console.log(`Regex check + loop: ${end2 - start2} ms`);
