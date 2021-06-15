import { ASTNodeKind, NameNode } from './ast';
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

    let nameNode: NameNode;

    const editedAST = visit(ast, {
      FieldDefinition: {
        enter(node) {
          checkVisitorFnArgs(ast, arguments);
          nameNode = node.name;
          return {
            ...node,
            name: {
              kind: nameNode.kind,
              value: 'boolean',
            },
            didEnter: true,
          };
        },
        leave(node) {
          checkVisitorFnArgs(ast, arguments, true);
          return {
            ...node,
            ...nameNode,
            didLeave: true,
          };
        },
      },
    });

    expect(editedAST).toEqual({
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
          description: undefined,
          name: { kind: ASTNodeKind.NAME, value: 'AcDoc' },
          extendsModels: [],
          fields: [
            {
              kind: ASTNodeKind.NAME,
              name: { kind: ASTNodeKind.NAME, value: 'boolean' },
              type: {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: undefined },
              },
              omitted: false,
              optional: false,
              didEnter: true,
              value: 'a',
              didLeave: true,
            },
            {
              kind: ASTNodeKind.NAME,
              name: { kind: ASTNodeKind.NAME, value: 'boolean' },
              type: {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: undefined },
              },
              omitted: false,
              optional: false,
              didEnter: true,
              value: 'b',
              didLeave: true,
            },
            {
              kind: ASTNodeKind.NAME,
              name: { kind: ASTNodeKind.NAME, value: 'boolean' },
              omitted: false,
              type: {
                kind: ASTNodeKind.NAMED_TYPE,
                fields: [
                  {
                    kind: ASTNodeKind.FIELD_DEFINITION,
                    name: { kind: ASTNodeKind.NAME, value: 'a' },
                    type: {
                      kind: ASTNodeKind.NAMED_TYPE,
                      name: { kind: ASTNodeKind.NAME, value: undefined },
                    },
                    omitted: false,
                    optional: false,
                  },
                  {
                    kind: ASTNodeKind.FIELD_DEFINITION,
                    name: { kind: ASTNodeKind.NAME, value: 'b' },
                    type: {
                      kind: ASTNodeKind.NAMED_TYPE,
                      name: { kind: ASTNodeKind.NAME, value: undefined },
                    },
                    omitted: false,
                    optional: false,
                  },
                  {
                    kind: ASTNodeKind.FIELD_DEFINITION,
                    name: { kind: ASTNodeKind.NAME, value: 'c' },
                    type: {
                      kind: ASTNodeKind.NAMED_TYPE,
                      name: { kind: ASTNodeKind.NAME, value: undefined },
                    },
                    omitted: false,
                    optional: false,
                  },
                ],
              },
              optional: false,
              didEnter: true,
              value: 'c',
              didLeave: true,
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
});
