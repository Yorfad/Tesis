import { Router } from 'express';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';
import path from 'path';

export const router = Router();
router.use(verifyToken);

// --- CORRECCIÓN ---
// Construimos la ruta al archivo de credenciales desde la raíz del proyecto.
// 'process.cwd()' obtiene la ruta de la carpeta donde iniciaste 'npm run dev'.
const keyFilePath = path.join(process.cwd(), 'google-credentials.json');

// Configura el cliente de Google Cloud, apuntando a la ruta correcta.
const ttsClient = new TextToSpeechClient({
    keyFilename: keyFilePath
});

const SpeakSchema = z.object({
    text: z.string().min(1)
});

router.post('/speak', async (req: AuthRequest, res) => {
    const parsed = SpeakSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Texto para leer requerido.' });
    }

    try {
        const { text } = parsed.data;

        const request = {
            input: { text: text },
            voice: { languageCode: 'es-US', name: 'es-US-Wavenet-A' },
            audioConfig: { audioEncoding: 'MP3' as const },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        
        res.json({ audioContent: response.audioContent?.toString('base64') });

    } catch (error) {
        console.error("Error en Google TTS:", error);
        res.status(500).json({ error: 'Error al sintetizar el audio.' });
    }
});