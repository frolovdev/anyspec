import { inspect } from './utils';
import { ASTNode, isNode, ASTNodeKind } from './language';

/**
 * A visitor is provided to visit, it contains the collection of
 * relevant functions to be called during the visitor's traversal.
 */
export type ASTVisitor = EnterLeaveVisitor<ASTNode> | KindVisitor;

type KindVisitor = {
  readonly [NodeT in ASTNode as NodeT['kind']]?: ASTVisitFn<NodeT> | EnterLeaveVisitor<NodeT>;
};

interface EnterLeaveVisitor<TVisitedNode extends ASTNode> {
  readonly enter?: ASTVisitFn<TVisitedNode>;
  readonly leave?: ASTVisitFn<TVisitedNode>;
}

/**
 * A visitor is comprised of visit functions, which are called on each node
 * during the visitor's traversal.
 */
export type ASTVisitFn<TVisitedNode extends ASTNode> = (
  /** The current node being visiting. */
  node: TVisitedNode,
  /** The index or key to this node from the parent node or Array. */
  key: string | number | undefined,
  /** The parent immediately above this node, which may be an Array. */
  parent: ASTNode | ReadonlyArray<ASTNode> | undefined,
  /** The key path to get to this node from the root node. */
  path: ReadonlyArray<string | number>,
  /**
   * All nodes and Arrays visited before reaching parent of this node.
   * These correspond to array indices in `path`.
   * Note: ancestors includes arrays which contain the parent of visited node.
   */
  ancestors: ReadonlyArray<ASTNode | ReadonlyArray<ASTNode>>,
) => any;

/**
 * A reducer is comprised of reducer functions which convert AST nodes into
 * another form.
 */
export type ASTReducer<R> = {
  readonly [NodeT in ASTNode as NodeT['kind']]?: {
    readonly enter?: ASTVisitFn<NodeT>;
    readonly leave: ASTReducerFn<NodeT, R>;
  };
};

type ASTReducerFn<TReducedNode extends ASTNode, R> = (
  /** The current node being visiting. */
  node: { [K in keyof TReducedNode]: ReducedField<TReducedNode[K], R> },
  /** The index or key to this node from the parent node or Array. */
  key: string | number | undefined,
  /** The parent immediately above this node, which may be an Array. */
  parent: ASTNode | ReadonlyArray<ASTNode> | undefined,
  /** The key path to get to this node from the root node. */
  path: ReadonlyArray<string | number>,
  /**
   * All nodes and Arrays visited before reaching parent of this node.
   * These correspond to array indices in `path`.
   * Note: ancestors includes arrays which contain the parent of visited node.
   */
  ancestors: ReadonlyArray<ASTNode | ReadonlyArray<ASTNode>>,
) => R;

type ReducedField<T, R> = T extends null | undefined
  ? T
  : T extends ReadonlyArray<any>
  ? ReadonlyArray<R>
  : R;

const QueryDocumentKeys: { [NodeT in ASTNode as NodeT['kind']]: ReadonlyArray<keyof NodeT> } = {
  Description: [],
  Name: [],
  // @ts-ignore because of types
  OptionalName: [],
  Document: ['definitions'],

  NamedType: ['name'],
  ListType: ['type'],

  ObjectTypeDefinition: ['fields'],
  ModelTypeDefinition: ['description', 'name', 'extendsModels', 'fields'],
  FieldDefinition: ['name', 'type'],
  EnumInlineTypeDefinition: ['name', 'values'],
  EnumValueDefinition: ['name'],
  EndpointNamespaceTypeDefinition: ['tag', 'endpoints'],
  EndpointTypeDefinition: ['verb', 'url', 'responses'],
  EndpointResponse: ['type'],
  EnumTypeDefinition: ['name', 'values', 'description'],
  EndpointVerb: ['name'],
  EndpointUrl: ['name', 'parameters'],
  EndpointParameter: ['type'],
  EndpointParameterBody: ['type'],
} as const;

export const BREAK = {
  __brand: 'BREAK',
} as const;

/**
 * visit() will walk through an AST using a depth-first traversal, calling
 * the visitor's enter function at each node in the traversal, and calling the
 * leave function after visiting that node and all of its child nodes.
 *
 * By returning different values from the enter and leave functions, the
 * behavior of the visitor can be altered, including skipping over a sub-tree of
 * the AST (by returning false), editing the AST by returning a value or null
 * to remove the value, or to stop the whole traversal by returning BREAK.
 *
 * When using visit() to edit an AST, the original AST will not be modified, and
 * a new version of the AST with the changes applied will be returned from the
 * visit function.
 *
 *     const editedAST = visit(ast, {
 *       enter(node, key, parent, path, ancestors) {
 *         // @return
 *         //   undefined: no action
 *         //   false: skip visiting this node
 *         //   visitor.BREAK: stop visiting altogether
 *         //   null: delete this node
 *         //   any value: replace this node with the returned value
 *       },
 *       leave(node, key, parent, path, ancestors) {
 *         // @return
 *         //   undefined: no action
 *         //   false: no action
 *         //   visitor.BREAK: stop visiting altogether
 *         //   null: delete this node
 *         //   any value: replace this node with the returned value
 *       }
 *     });
 *
 * Alternatively to providing enter() and leave() functions, a visitor can
 * instead provide functions named the same as the kinds of AST nodes, or
 * enter/leave visitors at a named key, leading to three permutations of the
 * visitor API:
 *
 * 1) Named visitors triggered when entering a node of a specific kind.
 *
 *     visit(ast, {
 *       Kind(node) {
 *         // enter the "Kind" node
 *       }
 *     })
 *
 * 2) Named visitors that trigger upon entering and leaving a node of
 *    a specific kind.
 *
 *     visit(ast, {
 *       Kind: {
 *         enter(node) {
 *           // enter the "Kind" node
 *         }
 *         leave(node) {
 *           // leave the "Kind" node
 *         }
 *       }
 *     })
 *
 * 3) Generic visitors that trigger upon entering and leaving any node.
 *
 *     visit(ast, {
 *       enter(node) {
 *         // enter any node
 *       },
 *       leave(node) {
 *         // leave any node
 *       }
 *     })
 */
export function visit<N extends ASTNode>(root: N, visitor: ASTVisitor): N;
export function visit<R>(root: ASTNode, visitor: ASTReducer<R>): R;
export function visit(root: ASTNode, visitor: ASTVisitor | ASTReducer<any>): any {
  /* eslint-disable no-undef-init */
  let stack: any = undefined;
  let inArray = Array.isArray(root);
  let keys: any = [root];
  let index = -1;
  let edits = [];
  let node: any = undefined;
  let key: any = undefined;
  let parent: any = undefined;
  const path: any = [];
  const ancestors = [];
  let newRoot = root;
  /* eslint-enable no-undef-init */

  do {
    index++;
    const isLeaving = index === keys.length;
    const isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : path[path.length - 1];
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        node = inArray
          ? node.slice()
          : Object.defineProperties({}, Object.getOwnPropertyDescriptors(node));
        let editOffset = 0;
        for (let ii = 0; ii < edits.length; ii++) {
          let editKey: any = edits[ii][0];
          const editValue = edits[ii][1];
          if (inArray) {
            editKey -= editOffset;
          }
          if (inArray && editValue === null) {
            node.splice(editKey, 1);
            editOffset++;
          } else {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else {
      key = parent ? (inArray ? index : keys[index]) : undefined;
      node = parent ? parent[key] : newRoot;
      if (node === null || node === undefined) {
        continue;
      }
      if (parent) {
        path.push(key);
      }
    }

    let result;
    if (!Array.isArray(node)) {
      if (!isNode(node)) {
        throw new Error(`Invalid AST Node: ${inspect(node)}.`);
      }
      const visitFn = getVisitFn(visitor, node.kind, isLeaving);
      if (visitFn) {
        result = visitFn.call(visitor, node, key, parent, path, ancestors);

        if (result === BREAK) {
          break;
        }

        if (result === false) {
          if (!isLeaving) {
            path.pop();
            continue;
          }
        } else if (result !== undefined) {
          edits.push([key, result]);
          if (!isLeaving) {
            if (isNode(result)) {
              node = result;
            } else {
              path.pop();
              continue;
            }
          }
        }
      }
    }

    if (result === undefined && isEdited) {
      edits.push([key, node]);
    }

    if (isLeaving) {
      path.pop();
    } else {
      stack = { inArray, index, keys, edits, prev: stack };
      inArray = Array.isArray(node);
      keys = inArray ? node : (QueryDocumentKeys as any)[node.kind] ?? [];
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== undefined);

  if (edits.length !== 0) {
    newRoot = edits[edits.length - 1][1];
  }

  return newRoot;
}

/**
 * Given a visitor instance, if it is leaving or not, and a node kind, return
 * the function the visitor runtime should call.
 */
export function getVisitFn(
  visitor: ASTVisitor,
  kind: ASTNodeKind,
  isLeaving: boolean,
): $Maybe<ASTVisitFn<ASTNode>> {
  const kindVisitor: ASTVisitFn<ASTNode> | EnterLeaveVisitor<ASTNode> | undefined = (
    visitor as any
  )[kind];
  if (kindVisitor) {
    if (typeof kindVisitor === 'function') {
      // { Kind() {} }
      return isLeaving ? undefined : kindVisitor;
    }
    // { Kind: { enter() {}, leave() {} } }
    return isLeaving ? kindVisitor.leave : kindVisitor.enter;
  }
  // { enter() {}, leave() {} }
  return isLeaving ? (visitor as any).leave : (visitor as any).enter;
}
