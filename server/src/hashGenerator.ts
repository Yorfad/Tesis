// srcServer/hashGenerator.ts

import bcrypt from 'bcryptjs';

// La contraseña en texto plano que quieres hashear
const plainPassword = 'profe';

// El "coste" o "rondas de sal". 10 es un valor estándar y seguro.
const saltRounds = 10;

// Generamos el hash de forma síncrona (más simple para un script)
const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);

// Imprimimos el resultado en la consola
console.log(`Contraseña en texto plano: ${plainPassword}`);
console.log(`Contraseña Hasheada (para la BD): ${hashedPassword}`);