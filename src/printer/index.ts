import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import * as plugin from './plugin';

const filePath = path.resolve(__dirname, 'kek.models.tinyspec');
const file = fs.readFileSync(filePath, 'utf8');

const a = prettier.format(file, { filepath: filePath, plugins: [plugin] });

console.log(a);
