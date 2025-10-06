import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token, id_user } = await response.json();
        login(token, id_user.toString());
        navigate('/dashboard');
      } else {
        const { error } = await response.json();
        setError(error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4 w-full">
      <div className="w-full max-w-sm bg-gray-700 p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">
          Bienvenido
        </h1>
        <div className="space-y-6">
          <input
            className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Usuario"
          />
          <input
            className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg p-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Ingresando...' : 'Entrar'}
          </button>
        </div>
        {error && <p className="text-red-400 text-center mt-6">{error}</p>}
      </div>
    </div>
  );
}