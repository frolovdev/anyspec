import { printerName, parserName } from './consts';
import { parser } from './parser';
import { printer } from './printer';

export const defaultOptions = {};

export const languages = [
  {
    name: 'Anyspec',
    parsers: [parserName],
    // since: '1.0.0',
    extensions: ['.tinyspec'],
    tmScope: 'source.tinyspec',
    aceMode: 'text',
    // linguistLanguageId: 101,
    vscodeLanguageIds: ['tinyspec'],
  },
];

export const parsers = {
  [parserName]: parser,
};

export const printers = {
  [printerName]: printer,
};
