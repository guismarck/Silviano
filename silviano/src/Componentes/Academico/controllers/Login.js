import React, { useState, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import authService from '../../../Servicios/LoginService/authService';

import nicaraguaBg from '../../../assets/img/nicaragua.jpg';
import '../../../css/Login.css';

export const Login = () => {
  const toast = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const logoUrl = `${process.env.PUBLIC_URL}/img/Silviano.png`;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Ingrese su usuario y contraseña.',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const authData = await authService.login(formData);

      if (authData && authData.token) {
        login(authData);

        toast.current?.show({
          severity: 'success',
          summary: 'Acceso Autorizado',
          detail: `Bienvenido ${authData.username}`,
          life: 2000,
        });

        setTimeout(() => {
          if (authData.roles?.includes('ADMIN') || authData.roles?.includes('ROLE_ADMIN')) {
            navigate('/dashboard-admin');
          } else if (authData.roles?.includes('DOCENTE') || authData.roles?.includes('ROLE_DOCENTE')) {
            navigate('/calificaciones');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Autenticación',
        detail: error.message || 'Credenciales inválidas o error de conexión.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-fullscreen-wrapper flex align-items-center justify-content-center" style={{ '--bg-flag': `url(${nicaraguaBg})` }}>
      <Toast ref={toast} />
      <div className="login-card-expanded p-fluid">
        <div className="flex flex-column align-items-center mb-4">
          <img src={logoUrl} alt="Escudo Silviano Matamoros" className="login-logo-large mb-2" />
          <h1 className="login-title-large font-bold m-0 text-center">Silviano Matamoros</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div className="field m-0">
            <label htmlFor="username" className="block text-sm font-semibold text-700 mb-1">Usuario / Código MINED</label>
            <InputText id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Ej. MGARCIA o admin" className="w-full custom-input-lg" autoComplete="username" />
          </div>

          <div className="field m-0">
            <label htmlFor="password" className="block text-sm font-semibold text-700 mb-1">Contraseña</label>
            <Password id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" toggleMask feedback={false} className="w-full" inputClassName="w-full custom-input-lg" autoComplete="current-password" />
          </div>

          <Button type="submit" label="Iniciar Sesión" icon="pi pi-sign-in" loading={loading} className="login-btn-lg border-none font-bold text-white w-full mt-2" />
        </form>
      </div>
    </div>
  );
};