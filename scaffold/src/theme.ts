// Marque de la vidéo. Par défaut : tokens Zeliq (design-like-zeliq/references/tokens.md).
// Pour une autre marque, l'agent remplace ces valeurs depuis la section « Marque » du storyboard.
export const C = {
  brand100: '#F2FFF0', brand200: '#D6F8D1', brand300: '#ADE1B0', brand600: '#4C8676', brand700: '#326E5E', brand800: '#195747', brand900: '#00402F',
  grey100: '#F7FAF9', grey200: '#F2F5F4', grey300: '#E4EBE8', grey400: '#D7E0DD', grey700: '#96A39F', grey800: '#717A77', grey900: '#4D5754', grey1000: '#2D3331',
  green500: '#6BD345', green700: '#268504', orange500: '#FFA25C', orange700: '#E56229', red700: '#E03D24', blue500: '#00A0F0', blue700: '#0978AF', logo: '#9FE870', white: '#FFFFFF',
  // Rôles (c'est ceux-là que les composants consomment)
  pageBg: '#F2F5F4',     // fond des plans d'écran = --bg-page de l'app, pour que le débordement caméra soit invisible
  cardBg: '#00402F',     // fond des cartons titre / outro
  accent: '#4C8676',     // pastilles, cadres de surlignage, ripple du clic
  accentSoft: '#D6F8D1', // sous-titre des cartons
  captionBg: 'rgba(45,51,49,.93)',
};
export const LOGO = 'zeliq-logo-white.svg'; // dans public/ ; null pour aucun logo
export const LOGO_RATIO = 61 / 25;          // largeur / hauteur du SVG
import {DEMO} from './demo.mjs';
// Police des cartons : PP Telegraf si présente sur la machine (voir fonts.ts), sinon Inter (libre, embarquée).
export const FONT_HEAD = (DEMO as {headFont?: string}).headFont === 'PPTelegraf' ? 'PPTelegraf' : 'Inter';
export const FONT_BODY = 'Inter';
// Personnalité de motion « Corporate » (skill motion-design) : durées en frames @30fps, zéro overshoot
export const EASE_EMPH: [number, number, number, number] = [0.05, 0.7, 0.1, 1];
export const D = {quick: 6, std: 11, slow: 18, page: 15} as const;
export const EASE: [number, number, number, number] = [0.2, 0, 0, 1];
