// import axios from 'axios';
// import { API_BASE_URL } from '@env';
// const BASE_URL = API_BASE_URL;

// export async function fetchTestTasks(level) {
//   const api = axios.create({
//     baseURL: `${BASE_URL}/api`,
//     headers: { 'Content-Type': 'application/json' },
//   });

//   const flashRes = await api.get(`/flashcards`, {
//     params: { level, limit: 5 },
//   });

//   const flashcards = flashRes.data.map((item, i) => ({
//     id: `fc_${i}`,
//     type: 'flashcard',
//     question: `What is the translation of: ${item.word}`,
//     options: item.options,
//     correctAnswer: item.correctAnswer,
//   }));

//   const fillRes = await api.get(`/fill-blank/${level}`, {
//     params: { count: 5 },
//   });

//   const fillBlank = fillRes.data.map((item, i) => ({
//     id: `gr_${i}`,
//     type: 'grammar',
//     question: 'Fill in the blank:',
//     sentence: item.sentence,
//     options: item.options,
//     correctAnswer: item.correctAnswer,
//   }));

//   const listeningRes = await api.get(`/getRandomRecording`);
//   const lesson = listeningRes.data;

//   let listening = null;
//   if (lesson.questions && lesson.questions.length > 0) {
//     const randomQuestion = lesson.questions[Math.floor(Math.random() * lesson.questions.length)];
//     listening = {
//       id: `ls_${lesson.id}`,
//       type: 'listening',
//       question: randomQuestion.question,
//       mediaUrl: lesson.audioUrl,
//       options: randomQuestion.options,
//       correctAnswer: randomQuestion.correctAnswer,
//     };
//   }
//   console.log('📦 Zadania testowe:', [...flashcards, ...fillBlank, ...(listening ? [listening] : [])]);

//   return [...flashcards, ...fillBlank, ...(listening ? [listening] : [])];
  
// }
