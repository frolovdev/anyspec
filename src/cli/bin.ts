import { Command, OptionValues } from 'commander';
import path from 'path';
import { readFile } from 'fs/promises';
import { parse } from 'parser';
import { AnySpecSchema } from 'runtypes';
import { validate } from 'validation/validate';
import { baseRules } from 'validation/baseRules';

const program = new Command();

async function main(opts: OptionValues, args: string[]) {
  console.log('argsargs', opts, args);

  const specFiles = args.map((arg) => path.resolve(process.cwd(), arg));

  const content = await readFile(specFiles[0], { encoding: 'utf-8' });

  const doc = parse(content);

  const schema = new AnySpecSchema({ ast: doc });
  const errors = validate(schema, doc, baseRules);

  console.log(errors)
}

program
  .requiredOption('-o, --outDir <dir>', 'path to a directory for a generated SDK')
  .arguments('<specFiles...>');

program.parse(process.argv);

main(program.opts(), program.args).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
