import { parse, print } from './language';
import { dedent } from './__testsUtils__';

describe(__filename, () => {
  it('correctly parse and print model without description', () => {
    const model = `AcDocument {}`;

    const ast = parse(model);
    const printed = print(ast);
    expect(printed).toEqual(dedent`AcDocument {}`);
  });
  it('correctly parse and print model without description', () => {
    const model = `
// лул
// kek
AcDocument {name?: s[], nameL2: Name}`;

    const ast = parse(model);
    const printed = print(ast);
    console.log(printed);
    expect(printed).toEqual(dedent`
    // лул
    // kek
    AcDocument {}`);
  });
});
