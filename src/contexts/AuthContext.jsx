import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API_ENDPOINTS from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('auth_user', JSON.stringify(u));
    else localStorage.removeItem('auth_user');
  };

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const getEmployeeRole = async (employee_id) => {
    try {
      const res = await fetch(API_ENDPOINTS.EMPLOYEE_ROLES_BY_EMPLOYEE(employee_id));
      if (!res.ok) return '';
      const roles = await res.json();
      if (!Array.isArray(roles) || roles.length === 0) return '';
      const code = roles[0]?.role_type_code || roles[0]?.role_type || '';
      if (!code) return '';
      try {
        const r = await fetch(API_ENDPOINTS.ROLE_TYPE(code));
        if (r.ok) {
          const rt = await r.json();
          return rt?.description || code;
        }
      } catch {}
      return code;
    } catch { return ''; }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.EMPLOYEE_LOGIN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (!res.ok) throw new Error((await res.json())?.message || 'Login failed');
      const emp = await res.json();
      const role = await getEmployeeRole(emp.employee_id);
      const u = { id: emp.employee_id, username: emp.username, first_name: emp.first_name, last_name: emp.last_name, role };
      saveUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const body = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        middle_name: payload.middle_name || null,
        gender: payload.gender || 'M',
        birth_date: payload.birth_date || null,
        username: payload.username,
        password: payload.password, // NOTE: store plaintext unless backend hashes
        employee_status: '0001'
      };
      const res = await fetch(API_ENDPOINTS.EMPLOYEES, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      const u = { id: created.employee_id, username: created.username, first_name: created.first_name, last_name: created.last_name, role: '' };
      saveUser(u);
      return u;
    } finally { setLoading(false); }
  };

  const logout = () => saveUser(null);

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
