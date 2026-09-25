import React from 'react';
import { Sun } from 'lucide-react';

export const Header: React.FC = () => (
  <header className="site-header">
    <div className="site-header-inner">
      <div className="brand-mark">
        <Sun size={21} strokeWidth={2} />
      </div>
      <div>
        <h1 className="brand-title">Maker Mosaic Light Guide</h1>
        <p className="brand-subtitle">See where light and shadow belong — then make it yours.</p>
      </div>
    </div>
  </header>
);
