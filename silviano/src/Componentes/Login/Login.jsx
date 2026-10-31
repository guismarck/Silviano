import React, { useState, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../Servicios/LoginService/authService';
import { RecuperarPasswordOTPModal } from '../Academico/controllers/RecuperarPasswordModal';
import nicaraguaBg from '../../assets/img/nicaragua.jpg';
import '../../css/Login.css';

export const Login = () => {
  const toast = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const logoUrl = `${process.env.PUBLIC_URL}/img/Silviano.png`;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const getDestinationRoute = (roles = []) => {
    if (roles.includes('DIRECTOR') || roles.includes('ADMIN')) return '/dashboard';
    if (roles.includes('DOCENTE')) return '/calificaciones';
    if (roles.includes('SECRETARIA')) return '/estudiantes';
    if (roles.includes('CAJERO')) return '/gestionCobro';
    return '/dashboard';
  };

  // Login principal llamando a POST /auth/login (LoginRequestDTO)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameTrimmed = formData.username.trim();

    if (!usernameTrimmed || !formData.password) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos Incompletos',
        detail: 'Por favor, ingrese su usuario o Código MINED y contraseña.',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const userData = await authService.login({
        username: usernameTrimmed,
        password: formData.password,
      });

      if (userData) {
        login(userData);

        toast.current?.show({
          severity: 'success',
          summary: 'Acceso Concedido',
          detail: `Bienvenido(a) ${userData.nombreCompleto || userData.username}`,
          life: 1500,
        });

        setTimeout(() => {
          const targetRoute = getDestinationRoute(userData.roles);
          navigate(targetRoute, { replace: true });
        }, 1200);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Autenticación',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOTPModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOTPModal(true);
  };

  return (
    <div
      className="login-fullscreen-wrapper flex align-items-center justify-content-center"
      style={{ '--bg-flag': `url(${nicaraguaBg})` }}
    >
      <Toast ref={toast} />

      <div className="login-card-expanded p-fluid shadow-4">
        {/* Encabezado Institucional */}
        <div className="flex flex-column align-items-center mb-4 text-center">
          <img
            src={logoUrl}
            alt="Escudo Colegio Silviano Matamoros"
            className="login-logo-large mb-2"
          />
          <h1 className="login-title-large font-bold m-0 text-900">
            Colegio Silviano Matamoros
          </h1>
          <span className="text-sm text-500 font-medium mt-1">
            Sistema Integrado de Gestión Escolar (SIGE)
          </span>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div className="field m-0">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-700 mb-1"
            >
              Usuario / Código MINED
            </label>
            <InputText
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej. WGUZMAN o MINED-2026-99"
              className="w-full custom-input-lg"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="field m-0">
            <div className="flex justify-content-between align-items-center mb-1">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-700 m-0"
              >
                Contraseña
              </label>
              <button
                type="button"
                className="p-link text-xs text-primary font-semibold border-none bg-transparent cursor-pointer hover:underline p-0"
                onClick={handleOpenOTPModal}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              toggleMask
              feedback={false}
              className="w-full"
              inputClassName="w-full custom-input-lg"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Iniciando Sesión...' : 'Ingresar al Sistema'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            loading={loading}
            className="login-btn-lg border-none font-bold text-white w-full mt-3 p-button-success"
          />
        </form>
      </div>

      <RecuperarPasswordOTPModal
        visible={showOTPModal}
        onHide={() => setShowOTPModal(false)}
        toastRef={toast}
      />
    </div>
  );
};