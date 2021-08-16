import fs from 'fs';
import path from 'path';
import { format, BuiltInParsers } from 'prettier';
import * as plugin from './plugin';

const filePath = path.resolve(__dirname, 'kek.models.tinyspec');
const file = fs.readFileSync(filePath, 'utf8');

const a = format(file, { filepath: filePath, plugins: [plugin] });

console.log(a);
