import React, { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

const DARK_VARS = {
  '--color-background': '#0f172a',
  '--color-foreground': '#e2e8f0',
  '--color-border': '#1f2937',
  '--color-input': '#111827',
  '--color-ring': '#86efac',
  '--color-card': '#111827',
  '--color-card-foreground': '#e2e8f0',
  '--color-popover': '#111827',
  '--color-popover-foreground': '#e2e8f0',
  '--color-muted': '#0b1220',
  '--color-muted-foreground': '#94a3b8',
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    Object.entries(DARK_VARS).forEach(([k, v]) => root.style.setProperty(k, v));
  } else {
    // Reset by removing inline overrides to let :root (light) win
    Object.keys(DARK_VARS).forEach((k) => root.style.removeProperty(k));
  }
};

const Preferences = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('prefs') || '{}');
      return { compactMode: !!saved.compactMode, reduceMotion: !!saved.reduceMotion };
    } catch { return { compactMode: false, reduceMotion: false }; }
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply and persist general prefs
  useEffect(() => {
    localStorage.setItem('prefs', JSON.stringify(prefs));
    const root = document.documentElement;
    // Compact mode toggles a CSS class consumers can use
    root.classList.toggle('compact', !!prefs.compactMode);
    // Reduce motion toggles a class for CSS transitions/animations
    root.classList.toggle('reduce-motion', !!prefs.reduceMotion);
  }, [prefs]);

  const handleSave = () => {
    // Already persisted in effects; keep button for UX confirmation
    alert('Preferences saved.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-4xl">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl mb-2">Preferences</h1>
          <p className="font-body text-muted-foreground mb-6">Customize your experience.</p>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Appearance</h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  <span>Light</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  <span>Dark</span>
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">General</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={prefs.compactMode}
                    onChange={e => setPrefs({ ...prefs, compactMode: e.target.checked })}
                  />
                  <span>Compact mode</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={prefs.reduceMotion}
                    onChange={e => setPrefs({ ...prefs, reduceMotion: e.target.checked })}
                  />
                  <span>Reduce motion</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Preferences</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;


