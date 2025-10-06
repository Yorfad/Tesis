// src/api.ts

const API = 'http://localhost:4000/api';

// Asegúrate de que esta función exista y tenga 'export'
export async function generateExercises(id_subtopic: number) {
  const token = localStorage.getItem('authToken');
  const r = await fetch(`${API}/generator/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ id_subtopic }),
  });

  if (!r.ok) {
    throw new Error('Failed to generate exercises');
  }
  return r.json();
}

// Asegúrate de que esta función también exista y tenga 'export'
export async function finishPractice(payload: {
  id_subtopic: number;
  exercises_presented: number;
  correct: number;
  avg_time_sec: number;
  score: number;
  issues?: { issue_key: string; attempts: number; errors: number }[];
}) {
  const token = localStorage.getItem('authToken');
  const r = await fetch(`${API}/practice/finish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('failed finish');
  return r.json();
}