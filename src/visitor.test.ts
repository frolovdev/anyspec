import { ASTNodeKind, NamedTypeNode, NameNode, OptionalNameNode, TypeNode } from './ast';
import { parse } from './parser';
import { log } from './utils';
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

    expect(visited).toEqual([
      ['enter', []],
      ['enter', ['definitions', 0]],
      ['enter', ['definitions', 0, 'name']],
      ['leave', ['definitions', 0, 'name']],
      ['enter', ['definitions', 0, 'fields', 0]],
      ['enter', ['definitions', 0, 'fields', 0, 'name']],
      ['leave', ['definitions', 0, 'fields', 0, 'name']],
      ['enter', ['definitions', 0, 'fields', 0, 'type']],
      ['enter', ['definitions', 0, 'fields', 0, 'type', 'name']],
      ['leave', ['definitions', 0, 'fields', 0, 'type', 'name']],
      ['leave', ['definitions', 0, 'fields', 0, 'type']],
      ['leave', ['definitions', 0, 'fields', 0]],
      ['leave', ['definitions', 0]],
      ['leave', []],
    ]);
  });

  it('validates ancestors argument', () => {
    const ast = parse('AcDocument { a }', { noLocation: true });
    const visitedNodes: Array<any> = [];

    visit(ast, {
      enter(node, key, parent, _path, ancestors) {
        const inArray = typeof key === 'number';
        if (inArray) {
          visitedNodes.push(parent);
        }
        visitedNodes.push(node);

        const expectedAncestors = visitedNodes.slice(0, -2);
        expect(ancestors).toEqual(expectedAncestors);
      },
      leave(_node, key, _parent, _path, ancestors) {
        const expectedAncestors = visitedNodes.slice(0, -2);
        expect(ancestors).toEqual(expectedAncestors);

        const inArray = typeof key === 'number';
        if (inArray) {
          visitedNodes.pop();
        }
        visitedNodes.pop();
      },
    });
  });

  it('allows editing a node both on enter and on leave', () => {
    const ast = parse('AcDoc { a, b, c: { a, b, c } }', { noLocation: true });

    let name: NameNode | OptionalNameNode;

    const editedAST = visit(ast, {
      NamedType: {
        enter(node) {
          checkVisitorFnArgs(ast, arguments);
          name = node.name;
          return {
            ...node,
            name: { ...name, value: 'boolean' },
            didEnter: true,
          };
        },
        leave(node) {
          checkVisitorFnArgs(ast, arguments, true);
          return {
            ...node,
            didLeave: true,
          };
        },
      },
    });

    expect(editedAST).toEqual({
      kind: 'Document',
      definitions: [
        {
          kind: 'ModelTypeDefinition',
          description: undefined,
          name: { kind: 'Name', value: 'AcDoc' },
          extendsModels: [],
          fields: [
            {
              kind: 'FieldDefinition',
              name: { kind: 'Name', value: 'a' },
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'boolean' },
                didEnter: true,
                didLeave: true,
              },
              omitted: false,
              optional: false,
            },
            {
              kind: 'FieldDefinition',
              name: { kind: 'Name', value: 'b' },
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'boolean' },
                didEnter: true,
                didLeave: true,
              },
              omitted: false,
              optional: false,
            },
            {
              kind: 'FieldDefinition',
              name: { kind: 'Name', value: 'c' },
              omitted: false,
              type: {
                kind: 'ObjectTypeDefinition',
                fields: [
                  {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'a' },
                    type: {
                      kind: 'NamedType',
                      name: { kind: 'Name', value: 'boolean' },
                      didEnter: true,
                      didLeave: true,
                    },
                    omitted: false,
                    optional: false,
                  },
                  {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'b' },
                    type: {
                      kind: 'NamedType',
                      name: { kind: 'Name', value: 'boolean' },
                      didEnter: true,
                      didLeave: true,
                    },
                    omitted: false,
                    optional: false,
                  },
                  {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'c' },
                    type: {
                      kind: 'NamedType',
                      name: { kind: 'Name', value: 'boolean' },
                      didEnter: true,
                      didLeave: true,
                    },
                    omitted: false,
                    optional: false,
                  },
                ],
              },
              optional: false,
            },
          ],
          strict: false,
        },
      ],
    });
  });

  it('allows editing the root node on enter and on leave', () => {
    const ast = parse('Doc { a, b, c: { a, b, c } }', { noLocation: true });

    const { definitions } = ast;

    const editedAST = visit(ast, {
      Document: {
        enter(node) {
          checkVisitorFnArgs(ast, arguments);
          return {
            ...node,
            definitions: [],
            didEnter: true,
          };
        },
        leave(node) {
          checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
          return {
            ...node,
            definitions,
            didLeave: true,
          };
        },
      },
    });

    expect(editedAST).toEqual({
      ...ast,
      didEnter: true,
      didLeave: true,
    });
  });

  it('allows for editing on enter', () => {
    const ast = parse('Doc { a, b, c: { a, b, c } }', { noLocation: true });

    const editedAST = visit(ast, {
      enter(node) {
        checkVisitorFnArgs(ast, arguments);
        if (node.kind === 'FieldDefinition' && node.name.value === 'b') {
          return null;
        }
      },
    });

    expect(ast).toEqual(parse('Doc { a, b, c: { a, b, c } }', { noLocation: true }));

    expect(editedAST).toEqual(parse('Doc { a,    c: { a,    c } }', { noLocation: true }));
  });

  it('allows for editing on leave', () => {
    const ast = parse('Doc { a, b, c: { a, b, c } }', { noLocation: true });
    const editedAST = visit(ast, {
      leave(node) {
        checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
        if (node.kind === 'FieldDefinition' && node.name.value === 'b') {
          return null;
        }
      },
    });

    expect(ast).toEqual(
      parse('Doc { a, b, c: { a, b, c } }', { noLocation: true }),
    );

    expect(editedAST).toEqual(
      parse('Doc { a,    c: { a,    c } }', { noLocation: true }),
    );
  });

  it('ignores false returned on leave', () => {
    const ast = parse('Doc { a, b, c: { a, b, c } }', { noLocation: true });
    const returnedAST = visit(ast, {
      leave() {
        return false;
      },
    });

    expect(returnedAST).toEqual(
      parse('Doc { a, b, c: { a, b, c } }', { noLocation: true }),
    );
  });

  it('visits edited node', () => {
    const addedField = {
      kind: ASTNodeKind.NAME,
      value: 'kek'
    };

    let didVisitAddedField;

    const ast = parse('Doc { a: { x } }', { noLocation: true });
    visit(ast, {
      enter(node) {
        checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
        if (node.kind === 'FieldDefinition' && node.name.value === 'a') {
          return {
            kind: 'FieldDefinition',
            name: addedField,
            type: node.type
          };
        }
        if (node === addedField) {
          didVisitAddedField = true;
        }
      },
    });

    expect(didVisitAddedField).toEqual(true);
  });

});
