import { syntaxError } from './error/syntaxError';
import { Lexer, isPunctuatorTokenKind } from './lexer';
import { TokenKindEnum, Token, TokenKind } from './token';
import { isSource, Source } from './source';
import {
  ASTNodeKind,
  DefinitionNode,
  DocumentNode,
  EnumInlineTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  ListTypeNode,
  ModelDescriptionNode,
  ModelTypeDefinitionNode,
  NamedTypeNode,
  NameNode,
  OptionalNameNode,
  TypeNode,
} from './ast';
import { Location } from './location';

export interface ParseOptions {
  /**
   * By default, the parser creates AST nodes that know the location
   * in the source that they correspond to. This configuration flag
   * disables that behavior for performance or testing.
   */
  noLocation?: boolean;
}

class Parser {
  private options: $Maybe<ParseOptions>;
  private lexer: Lexer;

  constructor(source: string | Source, options?: ParseOptions) {
    const sourceObj = isSource(source) ? source : new Source(source);

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

    const nodes = [];
    do {
      const curResult = parseFn.call(this);

      nodes.push(curResult);
    } while (!this.expectOptionalToken(closeKind));

    return nodes;
  }

  optionalMany<T>(openKind: TokenKindEnum, parseFn: () => T, closeKind: TokenKindEnum): Array<T> {
    if (this.expectOptionalToken(openKind)) {
      const nodes = [];
      while (!this.expectOptionalToken(closeKind)) {
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
      // node.loc = new Location(
      //   startToken,
      //   this._lexer.lastToken,
      //   this._lexer.source,
      // );
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

  parseDefinition(): DefinitionNode {
    if (this.peek(TokenKind.DESCRIPTION)) {
      return this.parseModelTypeDefinition();
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

  parseTypeSystemDefinition(): DefinitionNode {
    // Many definitions begin with a description and require a lookahead.
    const braces = this.lexer.lookahead();

    switch (braces.kind) {
      case TokenKind.BRACE_L:
        return this.parseModelTypeDefinition();
    }

    throw this.unexpected();
  }

  parseEnumTypeDefinition(): $TSFixMe {}

  parseModelTypeDefinition(): ModelTypeDefinitionNode {
    const start = this.lexer.token;
    const description = this.parseModelDescription();
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

    // FIXME: delete omited functionality at all because it really sucks
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

  // FIXME: delete omited functionality at all because it really sucks
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

  parseTypeReference(): TypeNode {
    const startToken = this.lexer.token;

    if (this.peek(TokenKind.NAME)) {
      const name = this.parseName();
      const bracket = this.expectOptionalToken(TokenKind.BRACKET_L);

      if (bracket) {
        this.expectToken(TokenKind.BRACKET_R);
      }

      if (bracket) {
        return this.node<ListTypeNode>(startToken, {
          kind: ASTNodeKind.LIST_TYPE,
          name,
        });
      }

      return this.node<NamedTypeNode>(startToken, {
        kind: ASTNodeKind.NAMED_TYPE,
        name,
      });
    } else if (this.peek(TokenKind.PAREN_L)) {
      return this.parseEnumInlineTypeDefinition();
    }

    const fields = this.parseFieldsDefinition();

    const bracket = this.expectOptionalToken(TokenKind.BRACKET_L);
    if (bracket) {
      this.expectToken(TokenKind.BRACKET_R);
      return this.node<ListTypeNode>(startToken, {
        kind: ASTNodeKind.LIST_TYPE,
        fields,
      });
    }

    return this.node<NamedTypeNode>(startToken, {
      kind: ASTNodeKind.NAMED_TYPE,
      fields,
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

  parseModelDescription(): ModelDescriptionNode | undefined {
    if (this.peekDescription()) {
      const token = this.lexer.token;

      let mergedValue = token.value;
      this.lexer.advance();
      while (this.lexer.token.kind === TokenKind.DESCRIPTION) {
        mergedValue = mergedValue.concat(`\n${this.lexer.token.value}`);
        this.lexer.advance();
      }

      return this.node<ModelDescriptionNode>(token, {
        kind: ASTNodeKind.MODEL_DESCRIPTION,
        value: mergedValue,
      });
    }

    return undefined;
  }

  expectKeyword(value: string) {
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


  // FIXME: in futrue
  // becuase of tinyspec allows to use syntatic sugar around string

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
 * Throws EasySpecError if a syntax error is encountered.
 */
export function parse(source: string | Source, options?: ParseOptions): DocumentNode {
  /// DocumentNode
  const parser = new Parser(source, options);
  return parser.parseDocument();
}
