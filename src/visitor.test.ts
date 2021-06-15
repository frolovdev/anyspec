import { ASTNodeKind } from './ast';
import { parse } from './parser';
import { visit } from './visitor';

function checkVisitorFnArgs(ast: any, args: any, isEdited: boolean = false) {
  const [node, key, parent, path, ancestors] = args;

  expect(node).toBeInstanceOf(Object);
  expect(Object.values(ASTNodeKind)).toContain(node.kind);

  const isRoot = key === undefined;
  if (isRoot) {
    if (!isEdited) {
      expect(node).toEqual(ast);
    }
    expect(parent).toEqual(undefined);
    expect(path).toEqual([]);
    expect(ancestors).toEqual([]);
    return;
  }

  expect(['number', 'string']).toContain(typeof key);
  expect(parent).toHaveProperty(String(key));

  expect(path).toBeInstanceOf(Array);
  expect(path[path.length - 1]).toEqual(key);

  expect(ancestors).toBeInstanceOf(Array);
  expect(ancestors.length).toEqual(path.length - 1);

  if (!isEdited) {
    let currentNode = ast;
    for (let i = 0; i < ancestors.length; ++i) {
      expect(ancestors[i]).toEqual(currentNode);

      currentNode = currentNode[path[i]];
      expect(currentNode).not.toEqual(undefined);
    }

    expect(parent).toEqual(currentNode);
    expect(parent[key]).toEqual(node);
  }
}

describe(__filename, () => {
  it('handles empty visitor', () => {
    const ast = parse('AcDocument { a }', { noLocation: true });
    expect(() => visit(ast, {})).not.toThrowError();
  });

  it('validates path argument', () => {
    const visited: Array<any> = [];

    const ast = parse('AcDocument { a }', { noLocation: true });

    visit(ast, {
      enter(_node, _key, _parent, path) {
        checkVisitorFnArgs(ast, arguments);
        visited.push(['enter', path.slice()]);
      },
      leave(_node, _key, _parent, path) {
        checkVisitorFnArgs(ast, arguments);
        visited.push(['leave', path.slice()]);
      },
    });
  });
});
