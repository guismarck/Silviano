import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));

    useEffect(() => {
        const storedUser = localStorage.getItem('user_data');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, [token]);

    const login = (data) => {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.usuario));
        localStorage.setItem('user_permisos', JSON.stringify(data.permisos));
        setToken(data.token);
        setUser(data.usuario);
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);