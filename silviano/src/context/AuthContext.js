import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. Estado inicial dinámico para evitar el parpadeo de pantalla en F5
    const [token, setToken] = useState(() => localStorage.getItem('jwt_token'));
    
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user_data');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [permisos, setPermisos] = useState(() => {
        const storedPermisos = localStorage.getItem('user_permisos');
        return storedPermisos ? JSON.parse(storedPermisos) : [];
    });

    const login = (data) => {
        // data proviene del backend: { token, username, id, roles }
        const userObj = {
            id: data.id,
            username: data.username
        };

        // Guardar en LocalStorage
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(userObj));
        localStorage.setItem('user_permisos', JSON.stringify(data.roles || []));

        // Sincronizar estado de React
        setToken(data.token);
        setUser(userObj);
        setPermisos(data.roles || []);
    };

    // 2. Función para cerrar sesión de manera limpia
    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
        setPermisos([]);
    };

    return (
        <AuthContext.Provider value={{ user, token, permisos, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);