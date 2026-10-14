import React, { useState } from 'react';
import "./RegisterForm.css";
import Quotes from '../../../shared/components/Quotes';
import { useTranslation } from 'react-i18next'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function RegisterForm({ onSubmit, onSwitchToLogin }) {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Un solo toggle para contraseña y su confirmación: es el mismo valor.
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // El teléfono es opcional
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      return setError(t('register.errorFields'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError(t('register.emailInvalid'));
    }

    // Opcional. Si se escribe, lo mismo que acepta el backend: dígitos, espacios y "+" (hasta 20)
    if (phone && !/^[0-9+ ]{7,20}$/.test(phone)) {
      return setError(t('register.phoneInvalid'));
    }

    // RegisterRequest exige 8+ caracteres, una mayúscula y un número.
    if (password.length < 8) {
      return setError(t('register.passwordShort'));
    }

    if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
      return setError(t('register.passwordWeak'));
    }

    if (password !== confirmPassword) {
      return setError(t('register.passwordMatch'));
    }

    // Validación solo en frontend (Ley 1581 de 2012 - Habeas Data)
    if (!acceptedTerms) {
      return setError(t('register.termsRequired'));
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
      setError(err.message || t('register.errorCreate'));
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
          <label>{t('register.firstName')}</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t('register.firstNamePlaceholder')}
            required
          />
        </div>

        {/* Apellido */}
        <div className="form-group">
          <label>{t('register.lastName')}</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t('register.lastNamePlaceholder')}
            required
          />
        </div>

        {/* Teléfono */}
        <div className="form-group">
          <label>{t('register.phone')}</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('register.phonePlaceholder')}
          />
        </div>

        {/* Usuario */}
        <div className="form-group">
          <label>{t('register.username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('register.usernamePlaceholder')}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group full">
          <label>{t('register.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('register.emailPlaceholder')}
            required
          />
        </div>

        {/* Contraseña */}
        <div className="form-group full">
          <label>{t('register.password')}</label>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('register.passwordPlaceholder')}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={t(showPassword ? 'loginForm.hidePassword' : 'loginForm.showPassword')}
              title={t(showPassword ? 'loginForm.hidePassword' : 'loginForm.showPassword')}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group full">
          <label>{t('register.confirmPassword')}</label>
          {/* Comparte el toggle: es la misma contraseña que se está confirmando */}
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('register.passwordPlaceholder')}
              required
            />
          </div>
        </div>

        {/* Términos y condiciones / tratamiento de datos */}
        <div className="form-group full terms-group">
          <label className="terms-label">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span>
              {t('register.termsAccept')}{' '}
              <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>
                {t('register.termsLink')}
              </button>
            </span>
          </label>
        </div>

        {/* Error */}
        {error && <div className="register-error">{error}</div>}

        {/* Link */}
        <button type="button" className="register-link" onClick={onSwitchToLogin}>
          {t('register.haveAccount')}
        </button>
        
        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? t('register.submitting') : t('register.submit')}
        </button>

      </form>
    </section>
    {showTerms && (
      <div className="terms-overlay" onClick={() => setShowTerms(false)}>
        <div className="terms-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <h3>{t('register.termsTitle')}</h3>
          {t('register.termsBody', { returnObjects: true }).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <button type="button" className="register-btn" onClick={() => setShowTerms(false)}>
            {t('register.termsClose')}
          </button>
        </div>
      </div>
    )}
    <div>
    <Quotes />
    </div>
      </>
    
  );
}

export default RegisterForm;