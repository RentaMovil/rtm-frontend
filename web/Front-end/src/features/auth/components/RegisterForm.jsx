import React, { useState } from 'react';
import "./RegisterForm.css";
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Mismas reglas que RegisterRequest.java (iam), para que el frontend nunca
// deje pasar algo que el backend va a rechazar.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]+$/;
const PHONE_REGEX = /^[0-9+ ]*$/;

function RegisterForm({ onSubmit }) {
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

  // Validación por campo, calculada en cada render: así el error/acierto se
  // ve en tiempo real mientras la persona escribe, igual que valida el backend.
  const emailError = email && !EMAIL_REGEX.test(email) ? t('register.emailInvalid') : null;
  const usernameError = username && username.length < 3
    ? t('register.usernameShort')
    : username && !USERNAME_REGEX.test(username)
      ? t('register.usernameInvalid')
      : null;
  const phoneError = phone && !PHONE_REGEX.test(phone) ? t('register.phoneInvalid') : null;

  const passwordRequirements = [
    { met: password.length >= 8, label: t('register.requirementLength') },
    { met: /[A-Z]/.test(password), label: t('register.requirementUppercase') },
    { met: /\d/.test(password), label: t('register.requirementNumber') },
  ];
  const isPasswordValid = passwordRequirements.every((r) => r.met);
  const confirmMatches = confirmPassword.length > 0 && confirmPassword === password;
  const confirmError = confirmPassword && confirmPassword !== password ? t('register.passwordMatch') : null;

  const hasBlockingErrors = Boolean(emailError || usernameError || phoneError)
    || (password.length > 0 && !isPasswordValid)
    || (confirmPassword.length > 0 && !confirmMatches);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // El teléfono es opcional
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      return setError(t('register.errorFields'));
    }

    if (emailError) return setError(emailError);
    if (usernameError) return setError(usernameError);
    if (phoneError) return setError(phoneError);
    if (!isPasswordValid) return setError(t('register.passwordWeak'));
    if (!confirmMatches) return setError(t('register.passwordMatch'));

    // Validación solo en frontend (Ley 1581 de 2012 - Habeas Data)
    if (!acceptedTerms) {
      return setError(t('register.termsRequired'));
    }

    setError(null);
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
            maxLength={100}
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
            maxLength={100}
            required
          />
        </div>

        {/* Teléfono */}
        <div className="form-group">
          <label>{t('register.phone')}</label>
          <div className="input-with-icon">
            <FaPhone className="field-icon" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('register.phonePlaceholder')}
              maxLength={20}
            />
          </div>
          {phoneError && <span className="field-error">{phoneError}</span>}
        </div>

        {/* Usuario */}
        <div className="form-group">
          <label>{t('register.username')}</label>
          <div className="input-with-icon">
            <FaUser className="field-icon" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('register.usernamePlaceholder')}
              maxLength={50}
              required
            />
          </div>
          {usernameError && <span className="field-error">{usernameError}</span>}
        </div>

        {/* Email */}
        <div className="form-group full">
          <label>{t('register.email')}</label>
          <div className="input-with-icon">
            <FaEnvelope className="field-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('register.emailPlaceholder')}
              maxLength={150}
              required
            />
          </div>
          {emailError && <span className="field-error">{emailError}</span>}
        </div>

        {/* Contraseña */}
        <div className="form-group full">
          <label>{t('register.password')}</label>
          <div className="password-field">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('register.passwordPlaceholder')}
              maxLength={100}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={t(showPassword ? 'loginForm.hidePassword' : 'loginForm.showPassword')}
              title={t(showPassword ? 'loginForm.hidePassword' : 'loginForm.showPassword')}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Checklist en vivo: mismas reglas que valida iam en RegisterRequest */}
          {password.length > 0 && (
            <ul className="password-requirements">
              {passwordRequirements.map((req) => (
                <li key={req.label} className={req.met ? 'met' : ''}>
                  {req.met ? <FaCheckCircle /> : <FaTimesCircle />} {req.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group full">
          <label>{t('register.confirmPassword')}</label>
          {/* Comparte el toggle: es la misma contraseña que se está confirmando */}
          <div className="password-field">
            <FaLock className="field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('register.passwordPlaceholder')}
              required
            />
          </div>
          {confirmError && <span className="field-error">{confirmError}</span>}
          {confirmMatches && <span className="field-success"><FaCheckCircle /> {t('register.passwordsMatchOk')}</span>}
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

        <button className="register-btn" type="submit" disabled={loading || hasBlockingErrors}>
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
    </>
  );
}

export default RegisterForm;
