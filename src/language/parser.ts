import {
  EndpointNamespaceTypeDefinitionNode,
  EndpointParameterPathNode,
  EndpointParameterPathTypeNode,
  EndpointResponseNode,
  EndpointParameterNode,
  EndpointParameterQueryNode,
  EndpointStatusCodeNode,
  EndpointTypeDefinitionNode,
  EndpointUrlNode,
  EndpointVerbNode,
  EndpointSecurityDefinitionNode,
  EndpointParameterBodyNode,
  OptionalEndpointParameterPathTypeNode,
  ASTNodeKind,
  TypeDefinitionNode,
  DocumentNode,
  EnumInlineTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  ListTypeNode,
  DescriptionNode,
  ModelTypeDefinitionNode,
  NamedTypeNode,
  NameNode,
  ObjectTypeDefinitionNode,
  OptionalNameNode,
  TypeNode,
  EnumTypeDefinitionNode,
} from './ast';
import { syntaxError } from '../error/syntaxError';
import { Lexer, isPunctuatorTokenKind } from './lexer';
import { TokenKindEnum, Token, TokenKind } from './token';
import { isSource, Source } from './source';
import { Location } from './location';

export interface ParseOptions {
  /**
   * By default, the parser creates AST nodes that know the location
   * in the source that they correspond to. This configuration flag
   * disables that behavior for performance or testing.
   */
  noLocation?: boolean;
}

export class ModelParser {
  private options: $Maybe<ParseOptions>;
  protected lexer: Lexer;

  constructor(source: string | Source, options?: ParseOptions) {
    const sourceObj = isSource(source) ? source : new Source({ body: source });

    this.lexer = new Lexer(sourceObj);
    this.options = options;
  }
  /**
   * Returns a non-empty list of parse nodes, determined by the parseFn.
   * This list begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  many<T>(openKind: TokenKindEnum, parseFn: () => T, closeKind: TokenKindEnum): Array<T> {
    this.expectToken(openKind);
    let count = 0;
    const nodes = [];
    do {
      const curResult = parseFn.call(this);
      count++;
      if (count === 999999) {
        throw syntaxError(
          this.lexer.source,
          this.lexer.token.end,
          `Unexpected token or not closed block`,
        );
      }
      nodes.push(curResult);
    } while (!this.expectOptionalToken(closeKind));

    return nodes;
  }

  optionalMany<T>(openKind: TokenKindEnum, parseFn: () => T, closeKind: TokenKindEnum): Array<T> {
    if (this.expectOptionalToken(openKind)) {
      const nodes = [];
      let count = 0;
      while (!this.expectOptionalToken(closeKind)) {
        count++;
        if (count === 999999) {
          throw syntaxError(
            this.lexer.source,
            this.lexer.token.end,
            `Unexpected token or not closed block`,
          );
        }
        nodes.push(parseFn.call(this));
      }

      return nodes;
    }
    return [];
  }

  /**
   * Returns a non-empty list of parse nodes, determined by the parseFn.
   * This list begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the closing token.
   */
  repeatableManyTo<T>(
    openKind: TokenKindEnum,
    parseFn: () => T,
    closeKinds: TokenKindEnum[],
  ): Array<T> {
    this.expectToken(openKind);

    const nodes = [];
    do {
      const curResult = parseFn.call(this);

      nodes.push(curResult);
    } while (!this.peekMany(closeKinds));

    return nodes;
  }

  /**
   * Returns a node that, if configured to do so, sets a "loc" field as a
   * location object, used to identify the place in the source that created a
   * given parsed object.
   */
  node<T extends { loc?: Location }>(startToken: Token, node: T): T {
    if (this.options?.noLocation !== true) {
      node.loc = new Location(startToken, this.lexer.lastToken, this.lexer.source);
    }
    return node;
  }

  /**
   * If the next token is of the given kind, return that token after advancing the lexer.
   * Otherwise, do not change the parser state and throw an error.
   */
  expectToken(kind: TokenKindEnum): Token {
    const token = this.lexer.token;
    if (token.kind === kind) {
      this.lexer.advance();
      return token;
    }

    throw syntaxError(
      this.lexer.source,
      token.start,
      `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`,
    );
  }

  /**
   * If the next token is of the given kind, return that token after advancing the lexer.
   * Otherwise, do not change the parser state and return undefined.
   */
  expectOptionalToken(kind: TokenKindEnum): $Maybe<Token> {
    const token = this.lexer.token;
    if (token.kind === kind) {
      this.lexer.advance();
      return token;
    }
    return undefined;
  }

  /**
   * Document : Definition+
   */
  parseDocument(): DocumentNode {
    return this.node<DocumentNode>(this.lexer.token, {
      kind: ASTNodeKind.DOCUMENT,
      definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
    });
  }

  parseDefinition(): TypeDefinitionNode {
    if (this.peek(TokenKind.DESCRIPTION)) {
      return this.parseTypeSystemDefinition();
    }

    if (this.peek(TokenKind.NAME)) {
      const nextToken = this.lexer.lookahead();

      if (
        nextToken.kind === TokenKind.BRACE_L ||
        nextToken.kind === TokenKind.BANG ||
        nextToken.kind === TokenKind.EXTENDS
      ) {
        return this.parseModelTypeDefinition();
      } else if (nextToken.kind === TokenKind.PAREN_L) {
        return this.parseEnumTypeDefinition();
      }
    }

    this.lexer.advance();

    throw this.unexpected();
  }

  /**
   * Determines if the next token is of a given kind
   */
  peek(kind: TokenKindEnum): boolean {
    return this.lexer.token.kind === kind;
  }

  peekMany(kinds: TokenKindEnum[]): boolean {
    return kinds.includes(this.lexer.token.kind);
  }

  peekDescription(): boolean {
    return this.peek(TokenKind.DESCRIPTION);
  }

  /**
   * Helper function for creating an error when an unexpected lexed token is encountered.
   */
  unexpected(atToken?: $Maybe<Token>): Error {
    const token = atToken ?? this.lexer.token;
    return syntaxError(this.lexer.source, token.start, `Unexpected ${getTokenDesc(token)}.`);
  }

  parseTypeSystemDefinition(): TypeDefinitionNode {
    // Many definitions begin with a description and require a lookahead.
    const description = this.parseDescription();
    const braces = this.lexer.lookahead();

    switch (braces.kind) {
      case TokenKind.BRACE_L:
        return this.parseModelTypeDefinition(description);
      case TokenKind.PAREN_L:
        return this.parseEnumTypeDefinition(description);
    }

    throw this.unexpected();
  }

  parseEnumTypeDefinition(description?: DescriptionNode): EnumTypeDefinitionNode {
    const start = this.lexer.token;
    const name = this.parseName();
    const kind = ASTNodeKind.ENUM_TYPE_DEFINITION;
    const values = this.parseEnumValuesDefinition();

    return this.node<EnumTypeDefinitionNode>(start, {
      kind,
      name,
      values,
      description,
    });
  }

  parseModelTypeDefinition(description?: DescriptionNode): ModelTypeDefinitionNode {
    const start = this.lexer.token;
    const name = this.parseName();
    const extendsModels = this.parseExtendsModels();

    const strictMode = Boolean(this.expectOptionalToken(TokenKind.BANG));

    const fields = this.parseFieldsDefinition();

    return this.node<ModelTypeDefinitionNode>(start, {
      kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
      description,
      name,
      extendsModels,
      fields,
      strict: strictMode,
    });
  }

  parseExtendsModels(): Array<NamedTypeNode> {
    return this.peek(TokenKind.EXTENDS)
      ? this.repeatableManyTo(TokenKind.EXTENDS, this.parseNamedType, [
          TokenKind.BRACE_L,
          TokenKind.BANG,
        ])
      : [];
  }

  /**
   * NamedType : Name
   */
  parseNamedType(): NamedTypeNode {
    return this.node<NamedTypeNode>(this.lexer.token, {
      kind: ASTNodeKind.NAMED_TYPE,
      name: this.parseName(),
    });
  }

  /**
   * FieldDefinition :
   *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
   */
  parseFieldDefinition(): FieldDefinitionNode {
    const start = this.lexer.token;

    // FIXME: delete omitted functionality at all because it really sucks
    const { node: name, omitted } = this.parseNameInFieldDefinition();
    const isOptionalField = Boolean(this.expectOptionalToken(TokenKind.QUESTION_MARK));

    if (this.peek(TokenKind.COLON)) {
      this.expectToken(TokenKind.COLON);
      const type = this.parseTypeReference();
      return this.node<FieldDefinitionNode>(start, {
        kind: ASTNodeKind.FIELD_DEFINITION,
        name,
        omitted,
        type,
        optional: isOptionalField,
      });
    }
    const type = this.parseEmptyTypeReference();
    return this.node<FieldDefinitionNode>(start, {
      kind: ASTNodeKind.FIELD_DEFINITION,
      name,
      type,
      omitted,
      optional: isOptionalField,
    });
  }

  // FIXME: delete omitted functionality at all because it really sucks
  parseNameInFieldDefinition(): { node: NameNode; omitted: boolean } {
    const token = this.expectToken(TokenKind.NAME);

    if (token.value[0] === '-') {
      return {
        node: this.node<NameNode>(token, {
          kind: ASTNodeKind.NAME,
          value: token.value.slice(1),
        }),
        omitted: true,
      };
    }
    return {
      node: this.node<NameNode>(token, {
        kind: ASTNodeKind.NAME,
        value: token.value,
      }),
      omitted: false,
    };
  }

  /**
   * Recursively parse list types
   * a[][]
   */
  parseListReference(name: NameNode, startToken: Token): ListTypeNode | NamedTypeNode {
    const closeBrackets = this.expectOptionalToken(TokenKind.BRACKET_L);
    if (!closeBrackets) {
      return this.node<NamedTypeNode>(startToken, {
        kind: ASTNodeKind.NAMED_TYPE,
        name,
      });
    }
    this.expectToken(TokenKind.BRACKET_R);

    return this.node<ListTypeNode>(startToken, {
      kind: ASTNodeKind.LIST_TYPE,
      type: this.parseListReference(name, startToken),
    });
  }

  // Name, (, {

  parseTypeReference(): TypeNode {
    const startToken = this.lexer.token;

    if (this.peek(TokenKind.NAME)) {
      const name = this.parseName();

      if (this.peek(TokenKind.BRACKET_L)) {
        return this.parseListReference(name, startToken);
      }

      return this.node<NamedTypeNode>(startToken, {
        kind: ASTNodeKind.NAMED_TYPE,
        name,
      });
    } else if (this.peek(TokenKind.PAREN_L)) {
      return this.parseEnumInlineTypeDefinition();
    }

    const strict = Boolean(this.expectOptionalToken(TokenKind.BANG));

    const fields = this.parseFieldsDefinition();

    const bracket = this.expectOptionalToken(TokenKind.BRACKET_L);
    if (bracket) {
      this.expectToken(TokenKind.BRACKET_R);
      return this.node<ListTypeNode>(startToken, {
        kind: ASTNodeKind.LIST_TYPE,
        type: {
          kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
          fields,
          strict,
        },
      });
    }

    return this.node<ObjectTypeDefinitionNode>(startToken, {
      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
      fields,
      strict,
    });
  }

  parseEmptyTypeReference(): NamedTypeNode {
    const token = this.lexer.token;
    return this.node<NamedTypeNode>(token, {
      kind: ASTNodeKind.NAMED_TYPE,
      name: this.parseOptionalName(),
    });
  }

  parseEnumInlineTypeDefinition(): EnumInlineTypeDefinitionNode {
    const startToken = this.lexer.token;
    const values = this.parseEnumValuesDefinition();

    return this.node<EnumInlineTypeDefinitionNode>(startToken, {
      kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
      values,
    });
  }

  parseFieldsDefinition(): Array<FieldDefinitionNode> {
    return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
  }

  parseEnumValuesDefinition(): Array<EnumValueDefinitionNode> {
    return this.optionalMany(TokenKind.PAREN_L, this.parseEnumValueDefinition, TokenKind.PAREN_R);
  }

  parseEnumValueDefinition(): EnumValueDefinitionNode {
    const start = this.lexer.token;
    const name = this.parseName();
    this.expectOptionalToken('|');

    return this.node<EnumValueDefinitionNode>(start, {
      kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
      name,
    });
  }

  parseDescription(): DescriptionNode | undefined {
    if (this.peekDescription()) {
      const token = this.lexer.token;

      let mergedValue = token.value;
      this.lexer.advance();
      while (this.lexer.token.kind === TokenKind.DESCRIPTION) {
        mergedValue = mergedValue.concat(`\n${this.lexer.token.value}`);
        this.lexer.advance();
      }

      return this.node<DescriptionNode>(token, {
        kind: ASTNodeKind.DESCRIPTION,
        value: mergedValue,
      });
    }

    return undefined;
  }

  expectKeyword(value: string): void {
    const token = this.lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.lexer.advance();
    } else {
      throw syntaxError(
        this.lexer.source,
        token.start,
        `Expected "${value}", found ${getTokenDesc(token)}.`,
      );
    }
  }

  /**
   * Converts a name lex token into a name parse node.
   */
  parseName(): NameNode {
    const token = this.expectToken(TokenKind.NAME);
    return this.node<NameNode>(token, {
      kind: ASTNodeKind.NAME,
      value: token.value,
    });
  }

  parseNumber(): NameNode {
    const token = this.expectToken(TokenKind.NUMBER);
    return this.node<NameNode>(token, {
      kind: ASTNodeKind.NAME,
      value: token.value,
    });
  }

  // FIXME: in futrue
  // because of tinyspec allows to use syntactic sugar around string

  // {
  //  s,
  //   b
  //  }
  parseOptionalName(): OptionalNameNode {
    return this.node<OptionalNameNode>(this.lexer.token, {
      kind: ASTNodeKind.NAME,
      value: undefined,
    });
  }
}

export class EndpointsParser extends ModelParser {
  /**
   * parse multiple endpoint responses (model or names after multiple => at same indent levels)
   */
  parseEndpointResponses(): EndpointResponseNode[] {
    if (this.peek(TokenKind.INDENT)) {
      return this.many(TokenKind.INDENT, this.parseEndpointResponse, TokenKind.DEDENT);
    }
    return [];
  }

  /**
   * parse status code (404, 202, etc)
   */
  parseEndpointStatusCode(): EndpointStatusCodeNode {
    const status = this.peek(TokenKind.NUMBER)
      ? this.parseNumber()
      : this.node<NameNode>(this.lexer.token, {
          kind: ASTNodeKind.NAME,
          value: '200',
        });

    return this.node<EndpointStatusCodeNode>(this.lexer.token, {
      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
      name: status,
    });
  }

  /**
   * parse endpoint response (model or name after =>)
   */
  parseEndpointResponse(): EndpointResponseNode {
    const description = this.parseDescription();

    this.expectToken(TokenKind.RETURN);

    if (this.peek(TokenKind.DEDENT) || this.peek(TokenKind.INDENT)) {
      throw syntaxError(this.lexer.source, this.lexer.token.start, `incorrect or empty response`);
    }

    const status = this.parseEndpointStatusCode();
    const type =
      this.peek(TokenKind.NAME) || this.peek(TokenKind.BRACE_L) || this.peek(TokenKind.PAREN_L)
        ? this.parseTypeReference()
        : undefined;

    return this.node<EndpointResponseNode>(this.lexer.token, {
      kind: ASTNodeKind.ENDPOINT_RESPONSE,
      type,
      status,
      description,
    });
  }

  /**
   * parse endpoint request (model or name after url string)
   */
  parseEndpointParameterRequest(): EndpointParameterNode | undefined {
    if (this.peek(TokenKind.INDENT)) {
      return;
    }
    const type = this.parseTypeReference();
    return this.node<EndpointParameterNode>(this.lexer.token, {
      kind: ASTNodeKind.ENDPOINT_PARAMETER,
      type: this.node<EndpointParameterBodyNode>(this.lexer.token, {
        kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY,
        type,
      }),
    });
  }

  /**
   * parse endpoint security tag (@tag)
   */
  parseSecurityDefinition(): EndpointSecurityDefinitionNode | undefined {
    if (this.peek(TokenKind.AT)) {
      this.lexer.advance();
      return this.node<EndpointSecurityDefinitionNode>(this.lexer.token, {
        kind: ASTNodeKind.ENDPOINT_SECURITY_DEFINITION,
        name: this.parseName(),
      });
    }
  }
  /**
   * parse endpoint verb (GET/POST etc)
   */
  parseEndpointVerb(): EndpointVerbNode {
    return this.node<EndpointVerbNode>(this.lexer.token, {
      kind: ASTNodeKind.ENDPOINT_VERB,
      name: this.parseName(),
    });
  }

  /**
   * split url string to tuple of url name (url string without query string)
   * and array of EndpointsParameterNodes
   * doesn't interact with lexer and parser state
   */
  parseUrlParameters(url: NameNode): [NameNode, EndpointParameterNode[]] {
    const [baseWithoutQuery, ...queries] = url.value.split('?');

    if (!url.value.startsWith('/')) {
      throw syntaxError(this.lexer.source, this.lexer.token.start, `incorrect or missed url`);
    }

    if (url.value.includes('&') || url.value.includes(';') || url.value.includes('=')) {
      throw this.throwNoInlineQuery();
    }

    const paths = baseWithoutQuery
      .split('/')
      .filter((str) => str.startsWith(':'))
      .map((a) => a.substring(1))
      .map((a) => a.split(':'));

    const pathsNodes = paths.map(([path, type]) =>
      this.node<EndpointParameterPathNode>(this.lexer.token, {
        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
        type: type
          ? this.node<EndpointParameterPathTypeNode>(this.lexer.token, {
              kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
              name: this.node<NameNode>(this.lexer.token, {
                kind: ASTNodeKind.NAME,
                value: type,
              }),
            })
          : this.node<OptionalEndpointParameterPathTypeNode>(this.lexer.token, {
              kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
            }),
        name: this.node<NameNode>(this.lexer.token, {
          kind: ASTNodeKind.NAME,
          value: path,
        }),
      }),
    );

    const queryNodes = queries.map((q) =>
      this.node<EndpointParameterQueryNode>(
        this.lexer.token,
        (() => {
          function isLowerCase(str: string) {
            return str == str.toLowerCase() && str != str.toUpperCase();
          }

          if (isLowerCase(q.charAt(0))) {
            throw this.throwNoInlineQuery();
          }

          if (q.includes(':')) {
            throw this.throwNoInlineQuery();
          }

          return {
            kind: ASTNodeKind.ENDPOINT_PARAMETER_QUERY,
            type: this.node<NamedTypeNode>(this.lexer.token, {
              kind: ASTNodeKind.NAMED_TYPE,
              name: this.node<NameNode>(this.lexer.token, {
                kind: ASTNodeKind.NAME,
                value: q,
              }),
            }),
          };
        })(),
      ),
    );

    return [
      this.node<NameNode>(this.lexer.token, {
        kind: ASTNodeKind.NAME,
        value: baseWithoutQuery,
      }),
      [...queryNodes, ...pathsNodes].map((typeNode) =>
        this.node<EndpointParameterNode>(this.lexer.token, {
          kind: ASTNodeKind.ENDPOINT_PARAMETER,
          type: typeNode,
        }),
      ),
    ];
  }

  /**
   * parse url
   */
  parseUrlTypeDefinition(): EndpointUrlNode {
    const name = this.parseName();
    const request = this.parseEndpointParameterRequest();
    const [cleanedName, params] = this.parseUrlParameters(name);

    const parameters = request ? [request, ...params] : params;

    return this.node<EndpointUrlNode>(this.lexer.token, {
      kind: ASTNodeKind.ENDPOINT_URL,
      name: cleanedName,
      parameters: parameters,
    });
  }

  /**
   * parse single endpoint definition
   */
  parseEndpointNamespaceTypeDefinition(): EndpointTypeDefinitionNode {
    const optionalDescription = this.parseDescription();

    const securityDefinition = this.parseSecurityDefinition();

    if (this.peek(TokenKind.DOLLAR)) {
      throw this.throwNoCrudl();
    }

    const verb = this.parseEndpointVerb();
    const url = this.parseUrlTypeDefinition();
    const responses = this.parseEndpointResponses();

    return this.node<EndpointTypeDefinitionNode>(this.lexer.token, {
      kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
      verb,
      description: optionalDescription,
      securityDefinition,
      url,
      responses: responses,
    });
  }

  /**
   * parse all endpoints inside `tag`
   */
  parseAllEndpointNamespaceTypeDefinition(): EndpointNamespaceTypeDefinitionNode {
    const start = this.lexer.token;
    const tag = this.parseName();
    this.expectToken(TokenKind.COLON);

    const nextToken = this.lexer.lookahead();

    if (this.lexer.token.kind !== TokenKind.INDENT) {
      throw syntaxError(this.lexer.source, nextToken.start, `expect <INDENT> after tag name`);
    }

    const endpoints = this.many(
      TokenKind.INDENT,
      this.parseEndpointNamespaceTypeDefinition,
      TokenKind.DEDENT,
    );

    return this.node<EndpointNamespaceTypeDefinitionNode>(start, {
      kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
      tag,
      endpoints,
    });
  }

  /**
   * parse standalone endpoint at top level without `tag`
   *
   */
  parseEndpointWithoutNamespaceTypeDefinition(): EndpointNamespaceTypeDefinitionNode {
    const start = this.lexer.token;
    const nextToken = this.lexer.lookahead();
    if (nextToken.kind === TokenKind.INDENT) {
      throw syntaxError(
        this.lexer.source,
        nextToken.start,
        `you probably missed ':' after tag name`,
      );
    }

    const endpoint = this.parseEndpointNamespaceTypeDefinition();
    return this.node<EndpointNamespaceTypeDefinitionNode>(start, {
      kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
      endpoints: [endpoint],
    });
  }

  parseNamespaceDefinition(): EndpointNamespaceTypeDefinitionNode {
    const nextToken = this.lexer.lookahead();

    if (this.peek(TokenKind.DOLLAR)) {
      throw this.throwNoCrudl();
    }

    if (this.peek(TokenKind.NAME) && nextToken.kind === TokenKind.COLON) {
      return this.parseAllEndpointNamespaceTypeDefinition();
    }

    if (this.peek(TokenKind.NAME) || this.peek(TokenKind.AT) || this.peek(TokenKind.DESCRIPTION)) {
      return this.parseEndpointWithoutNamespaceTypeDefinition();
    }

    throw this.unexpected();
  }

  /**
   * throw error when see $ Token
   */
  throwNoCrudl(atToken?: $Maybe<Token>): Error {
    const token = atToken ?? this.lexer.token;
    return syntaxError(this.lexer.source, token.start, `Not supported $CRUDL definition`);
  }

  /**
   * throw error when see inline query
   */
  throwNoInlineQuery(atToken?: $Maybe<Token>): Error {
    const token = atToken ?? this.lexer.token;
    return syntaxError(this.lexer.source, token.start, `Not supported inline query`);
  }

  /**
   * Document : Definition+
   */
  parseDocument(): DocumentNode {
    return this.node<DocumentNode>(this.lexer.token, {
      kind: ASTNodeKind.DOCUMENT,
      definitions: this.many(TokenKind.SOF, this.parseNamespaceDefinition, TokenKind.EOF),
    });
  }
}

/**
 * A helper function to describe a token as a string for debugging.
 */
function getTokenDesc(token: Token): string {
  const value = token.value;
  return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : '');
}

/**
 * A helper function to describe a token kind as a string for debugging.
 */
function getTokenKindDesc(kind: TokenKindEnum): string {
  return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
}

/**
 * Given a source, parses it into a Document.
 * Throws AnySpecError if a syntax error is encountered.
 */
export function parse(source: string | Source, options?: ParseOptions): DocumentNode {
  /// DocumentNode

  if (typeof source !== 'string' && source.sourceType === 'endpoints') {
    const endpointParser = new EndpointsParser(source, options);
    return endpointParser.parseDocument();
  } else {
    const parser = new ModelParser(source, options);
    return parser.parseDocument();
  }
}
