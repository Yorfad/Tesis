import { useCallback } from 'react';

// Creamos un solo elemento de audio para reutilizarlo
const audio = new Audio();

export const useSpeechSynthesis = () => {
    const speak = useCallback(async (text: string) => {
        if (!text) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:4000/api/tts/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('El servidor falló al generar el audio.');
            }

            const { audioContent } = await response.json();

            // Usamos un Data URL para reproducir el audio base64 directamente
            audio.src = `data:audio/mp3;base64,${audioContent}`;
            audio.play();

        } catch (error) {
            console.error("Error al reproducir audio:", error);
        }
    }, []);

    return speak;
};