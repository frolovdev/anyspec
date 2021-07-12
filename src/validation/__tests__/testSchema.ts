import { AnySpecSchema, buildSchema } from '../../runtypes';
import { modelsFile } from '../../__testsUtils__';

export const testSchema: AnySpecSchema = buildSchema(modelsFile);
