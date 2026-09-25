import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {DEMO} from './demo.mjs';
// PP Telegraf (police de marque Zeliq, sous licence) n'est jamais dans le repo : gen-data.mjs la copie dans
// public/fonts/ depuis ~/.demo-video/fonts/ ou ~/Library/Fonts/ quand elle est sur la machine. Sinon, cartons en Inter.
const head = (DEMO as {headFont?: string}).headFont === 'PPTelegraf';
export const fontsReady = Promise.all([
  ...(head ? [loadFont({family: 'PPTelegraf', url: staticFile('fonts/PPTelegraf-Bold.ttf'), weight: '700'})] : []),
  loadFont({family: 'Inter', url: staticFile('fonts/Inter.ttf'), weight: '100 900'}), // Inter variable : tous les poids
]);
