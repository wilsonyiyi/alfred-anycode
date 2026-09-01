import {consola} from 'consola';
import {colors} from 'consola/utils';

export const logger = consola.withTag('AnyCode');

const modeColors = {
  conflict: colors.red,
  development: colors.yellow,
  'development-interrupted': colors.magenta,
  'foreign-link': colors.red,
  invalid: colors.red,
  missing: colors.red,
  production: colors.green,
};

export const paint = {
  command: value => colors.bold(colors.cyan(value)),
  error: colors.red,
  mode: value => (modeColors[value] ?? colors.white)(value),
  path: colors.cyan,
  reason: colors.yellow,
  version: colors.magenta,
};
