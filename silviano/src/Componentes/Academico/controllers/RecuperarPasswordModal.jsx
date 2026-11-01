import React, { useState, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import authService from '../../../Servicios/LoginService/authService';
import { SimpleCaptcha } from './SimpleCaptcha';

export const RecuperarPasswordOTPModal = ({ visible, onHide, toastRef }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [docenteId, setDocenteId] = useState(null);
  const [tokenRecuperacion, setTokenRecuperacion] = useState('');

  const [formData, setFormData] = useState({
    identificacion: '',
    username: '',
    userInputCaptcha: '',
    otpCode: '',
    nuevaPassword: '',
    confirmarPassword: '',
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCaptchaGenerate = useCallback((generatedCode) => {
    setCaptchaCode(generatedCode);
  }, []);

  const handleResetState = () => {
    setStep(1);
    setDocenteId(null);
    setTokenRecuperacion('');
    setFormData({
      identificacion: '',
      username: '',
      userInputCaptcha: '',
      otpCode: '',
      nuevaPassword: '',
      confirmarPassword: '',
    });
  };

  const handleClose = () => {
    handleResetState();
    onHide();
  };

  // PASO 1: Envío de SolicitudOTPDTO a /auth/solicitar-otp
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { identificacion, username, userInputCaptcha } = formData;

    if (!identificacion.trim() || !username.trim() || !userInputCaptcha.trim()) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Ingrese su identificación, usuario y el código de seguridad.',
        life: 3000,
      });
      return;
    }

    if (userInputCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Captcha Incorrecto',
        detail: 'El código de verificación (CAPTCHA) no es correcto. Por favor, inténtalo de nuevo',
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.solicitarOTP({
        identificacion,
        username,
      });

      if (!response?.docenteId || !response?.tokenRecuperacion) {
        throw new Error('El servidor no devolvió los datos necesarios para verificar el código.');
      }

      setDocenteId(response.docenteId);
      setTokenRecuperacion(response.tokenRecuperacion);
      setStep(2);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Código Enviado',
        detail: response.mensaje || 'Se ha enviado el código OTP a su correo registrado.',
        life: 4000,
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de Verificación',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Envío de VerificarOTPDTO a /auth/verificar-otp
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { otpCode, nuevaPassword, confirmarPassword } = formData;

    if (!otpCode.trim() || !nuevaPassword) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Datos Incompletos',
        detail: 'Ingrese el código OTP de 6 dígitos y su nueva clave.',
        life: 3000,
      });
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Sin Coincidencia',
        detail: 'La nueva contraseña y su confirmación deben coincidir.',
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verificarOTP({
        docenteId,
        tokenRecuperacion,
        otpCode,
        nuevaPassword,
      });

      toastRef.current?.show({
        severity: 'success',
        summary: 'Actualización Exitosa',
        detail: response.mensaje || 'Contraseña actualizada con éxito.',
        life: 4000,
      });

      handleClose();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de Validación OTP',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        step === 1
          ? 'Recuperación de Contraseña'
          : 'Verificación de Código OTP '
      }
      visible={visible}
      style={{ width: '90vw', maxWidth: '520px' }}
      onHide={handleClose}
      draggable={false}
      resizable={false}
      className="p-fluid"
      appendTo={typeof window !== 'undefined' ? document.body : undefined}
      blockScroll
    >
      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="flex flex-column gap-3">
          <p className="text-sm text-600 m-0">
            Ingrese sus credenciales de expediente docente para solicitar la generación de un código OTP transaccional.
          </p>

          <div className="field m-0">
            <label htmlFor="identificacion" className="block text-xs font-semibold text-700 mb-1">
              Cédula / Código Docente *
            </label>
            <InputText
              id="identificacion"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              placeholder="Ej. 001-280590-0005Y"
              disabled={loading}
            />
          </div>

          <div className="field m-0">
            <label htmlFor="recoveryUsername" className="block text-xs font-semibold text-700 mb-1">
              Usuario de Sistema *
            </label>
            <InputText
              id="recoveryUsername"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej. WGUZMAN"
              disabled={loading}
            />
          </div>

          <div className="surface-100 p-3 border-round border-1 surface-border">
            <label className="block text-xs font-semibold text-700 mb-2">
              Verificación Captcha *
            </label>
            <div className="flex align-items-center gap-2">
              <SimpleCaptcha onCaptchaGenerate={handleCaptchaGenerate} />
              <InputText
                name="userInputCaptcha"
                value={formData.userInputCaptcha}
                onChange={handleChange}
                placeholder="CÓDIGO"
                className="text-center font-bold uppercase w-full"
                maxLength={5}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-2">
            <Button
              type="button"
              label="Cancelar"
              className="p-button-text p-button-secondary"
              onClick={handleClose}
              disabled={loading}
            />
            <Button
              type="submit"
              label={loading ? 'Solicitando...' : 'Generar Código OTP'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
              loading={loading}
              className="p-button-success font-bold"
            />
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="flex flex-column gap-3">
          <p className="text-sm text-600 m-0">
            Ingrese el código de 6 dígitos  y establezca su nueva clave.
          </p>

          <div className="field m-0">
            <label htmlFor="otpCode" className="block text-xs font-semibold text-700 mb-1">
              Código OTP (6 dígitos) *
            </label>
            <InputText
              id="otpCode"
              name="otpCode"
              value={formData.otpCode}
              onChange={handleChange}
              placeholder="123456"
              className="text-center font-bold text-xl tracking-widest"
              maxLength={6}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid grid-nogutter row-gap-3">
            <div className="col-12 col-md-6 pr-0 md:pr-2">
              <label htmlFor="nuevaPassword" className="block text-xs font-semibold text-700 mb-1">
                Nueva Contraseña *
              </label>
              <Password
                id="nuevaPassword"
                name="nuevaPassword"
                value={formData.nuevaPassword}
                onChange={handleChange}
                toggleMask
                feedback={false}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="col-12 col-md-6 pl-0 md:pl-2">
              <label htmlFor="confirmarPassword" className="block text-xs font-semibold text-700 mb-1">
                Confirmar Contraseña *
              </label>
              <Password
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                toggleMask
                feedback={false}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-content-between align-items-center mt-3">
            <Button
              type="button"
              label="Regresar"
              icon="pi pi-arrow-left"
              className="p-button-text p-button-secondary p-button-sm"
              onClick={() => setStep(1)}
              disabled={loading}
            />
            <Button
              type="submit"
              label={loading ? 'Actualizando...' : 'Establecer Clave'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              loading={loading}
              className="p-button-primary font-bold"
            />
          </div>
        </form>
      )}
    </Dialog>
  );
};