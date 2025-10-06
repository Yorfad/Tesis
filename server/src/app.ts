// srcServer/app.ts

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { router as specs } from './routes/specs';
import { router as practice } from './routes/practice';
import { router as issues } from './routes/issues';
import { router as health } from './routes/health';
import { router as auth } from './routes/auth';         // <-- Verifica esta línea
import { router as student } from './routes/student';   // <-- Verifica esta línea
import { router as generator } from './routes/generator';
import { router as tts } from './routes/tts';
import { router as teacher } from './routes/teacher';

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/health', health);
app.use('/api/auth', auth);         // <-- Y esta
app.use('/api/student', student);   // <-- Y sobre todo esta
app.use('/api/specs', specs);
app.use('/api/practice', practice);
app.use('/api/issues', issues);
app.use('/api/generator', generator); // <-- Y añade esta línea
app.use('/api/tts', tts);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API up on :${PORT}`));