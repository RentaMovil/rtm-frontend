import React, { useState } from 'react';
import { Link } from "react-router-dom";
import "./RegisterForm.css";
import Quotes from './Quotes';

function RegisterForm({ onSubmit }) {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone || !username || !email || !password || !confirmPassword) {
      return setError('Rellena todos los campos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError('Introduce un email válido');
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return setError('Teléfono inválido (10 dígitos)');
    }

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true);

    try {
      await onSubmit({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        username,
        password
      });
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <section className="register">

      <form className="register-form" onSubmit={handleSubmit}>

        {/* Nombre */}
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Juan"
            required
          />
        </div>

        {/* Apellido */}
        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Pérez"
            required
          />
        </div>

        {/* Teléfono */}
        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="3001234567"
            required
          />
        </div>

        {/* Usuario */}
        <div className="form-group">
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="juan123"
            required
          />
        </div>

        {/* Email */}
        <div className="form-group full">
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="form-group full">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group full">
          <label>Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {/* Error */}
        {error && <div className="register-error">{error}</div>}

        {/* Link */}
        <Link to="/login" className="register-link">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>

        {/* Botón */}
        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

      </form>
    </section>
    <div>
    <Quotes />
    </div>
      </>
    
  );
}

export default RegisterForm;