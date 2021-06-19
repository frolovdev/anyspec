import { dedent } from '__testsUtils__';

import { invariant, log, toJSONDeep } from 'utils';

import { ASTNodeKind } from 'language';
import { parse } from 'parser';
import { Source } from 'source';

import { AnySpecError, printError } from '../AnySpecError';

const source = new Source(dedent`
  Doc {
    field
  }
`);
const ast = parse(source);
const operationNode = ast.definitions[0];
invariant(operationNode.kind === ASTNodeKind.MODEL_TYPE_DEFINITION);
const fieldNode = operationNode.fields[0];
invariant(fieldNode);

describe(__filename, () => {
  it('is a class and is a subclass of Error', () => {
    expect(new AnySpecError('str')).toBeInstanceOf(Error);
    expect(new AnySpecError('str')).toBeInstanceOf(AnySpecError);
  });

  it('has a name, message, and stack trace', () => {
    const e = new AnySpecError('msg');

    expect(e).toMatchObject({ name: 'AnySpecError', message: 'msg' });
    expect(typeof e.stack).toEqual('string');
  });

  it('uses the stack of an original error', () => {
    const original = new Error('original');
    const e = new AnySpecError('msg', undefined, undefined, undefined, undefined, original);

    expect(e).toMatchObject({
      name: 'AnySpecError',
      message: 'msg',
      stack: original.stack,
      originalError: original,
    });
  });

  it('creates new stack if original error has no stack', () => {
    const original = new Error('original');
    const e = new AnySpecError('msg', null, null, null, null, original);

    expect(e).toMatchObject({
      name: 'AnySpecError',
      message: 'msg',
      originalError: original,
    });
    expect(typeof e.stack).toEqual('string');
  });

  it('converts nodes to positions and locations', () => {
    const e = new AnySpecError('msg', [fieldNode]);
    expect(e).toHaveProperty('source', source);

    expect(e).toMatchObject({
      locations: [{ line: 2, column: 3 }],
    });
    expect(e.nodes).toEqual([fieldNode]);
    expect(e.positions).toEqual([8]);
  });

  it('converts single node to positions and locations', () => {
    const e = new AnySpecError('msg', fieldNode); // Non-array value.
    expect(e).toHaveProperty('source', source);
    expect(e).toMatchObject({
      
      locations: [{ line: 2, column: 3 }],
    });

    expect(e.positions).toEqual([8])
    expect(e.nodes).toEqual([fieldNode])
  });

  it('converts node with loc.start === 0 to positions and locations', () => {
    const e = new AnySpecError('msg', operationNode);
    expect(e).toHaveProperty('source', source);
    expect(e).toMatchObject({
      nodes: [operationNode],
      positions: [0],
      locations: [{ line: 1, column: 1 }],
    });
  });

  it('converts source and positions to locations', () => {
    const e = new AnySpecError('msg', null, source, [6]);
    expect(e).toHaveProperty('source', source);
    expect(e).toMatchObject({
      nodes: undefined,
      positions: [6],
      locations: [{ line: 2, column: 1 }],
    });
  });

  it('serializes to include message', () => {
    const e = new AnySpecError('msg');
    expect(JSON.stringify(e)).toEqual('{"message":"msg"}');
  });

  it('serializes to include message and locations', () => {
    const e = new AnySpecError('msg', fieldNode);
    expect(JSON.stringify(e)).toEqual('{"message":"msg","locations":[{"line":2,"column":3}]}');
  });

  it('serializes to include path', () => {
    const e = new AnySpecError('msg', null, null, null, ['path', 3, 'to', 'field']);
    expect(e).toHaveProperty('path', ['path', 3, 'to', 'field']);
    expect(JSON.stringify(e)).toEqual('{"message":"msg","path":["path",3,"to","field"]}');
  });
});

describe.skip('printError', () => {
  it('prints an error without location', () => {
    const error = new AnySpecError('Error without location');
    expect(printError(error)).toEqual('Error without location');
  });

  it('prints an error using node without location', () => {
    const error = new AnySpecError(
      'Error attached to node without location',
      parse('{ foo }', { noLocation: true }),
    );
    expect(printError(error)).toEqual('Error attached to node without location');
  });

  it('prints an error with nodes from different sources', () => {
    const docA = parse(
      new Source(
        dedent`
          type Foo {
            field: String
          }
        `,
        'SourceA',
      ),
    );
    const opA = docA.definitions[0];
    invariant(opA.kind === ASTNodeKind.MODEL_TYPE_DEFINITION && opA.fields);
    const fieldA = opA.fields[0];

    const docB = parse(
      new Source(
        dedent`
          type Foo {
            field: Int
          }
        `,
        'SourceB',
      ),
    );
    const opB = docB.definitions[0];
    invariant(opB.kind === ASTNodeKind.MODEL_TYPE_DEFINITION && opB.fields);
    const fieldB = opB.fields[0];

    const error = new AnySpecError('Example error with two nodes', [fieldA.type, fieldB.type]);

    expect(printError(error)).toEqual(dedent`
      Example error with two nodes

      SourceA:2:10
      1 | type Foo {
      2 |   field: String
        |          ^
      3 | }

      SourceB:2:10
      1 | type Foo {
      2 |   field: Int
        |          ^
      3 | }
    `);
  });
});
