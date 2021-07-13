import { ASTNodeKind, parse, ParseOptions, Source } from '../language';
import { assert } from '../utils';
import { BuildSchemaOptions, AnySpecSchema } from './schema';

/**
 * A helper function to build a AnySpecSchema directly from a source
 * document.
 */
export function buildSchema(
  source: string | Source,
  options?: BuildSchemaOptions & ParseOptions,
): AnySpecSchema {
  const document = parse(source, {
    noLocation: options?.noLocation,
  });

  assert(
    document != null && document.kind === ASTNodeKind.DOCUMENT,
    'Must provide valid Document AST.',
  );

  return new AnySpecSchema({ ast: document });
}
