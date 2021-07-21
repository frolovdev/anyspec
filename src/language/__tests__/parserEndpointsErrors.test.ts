import { parse as defaultParse, Source } from '../';

const parse = (source: string | Source) => defaultParse(source, { noLocation: true });

describe(__filename, () => {
  describe('endpoints errors', () => {
    it('endpoint namespace without :', () => {
      const sourceString = `
\`/analytics_events\`
    POST /endpoint RequestModel
        => ResponseModel
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow("Syntax Error: you probably missed ':' after tag name");
    });
    it('endpoint unexpected token after namespace', () => {
      const sourceString = `
\`/analytics_events\`: POST
    /endpoint RequestModel
        => ResponseModel
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: expect <INDENT> after tag name');
    });
    it('endpoint without url', () => {
      const sourceString = `
\`/analytics_events\`:
    POST RequestModel
        => ResponseModel
`;
      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: incorrect or missed url');
    });
    it('endpoint without url and argument', () => {
      const sourceString = `
\`/analytics_events\`:
    POST
        => ResponseModel
`;
      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Expected Name, found <INDENT>.');
    });
    it('endpoint with empty return', () => {
      const sourceString = `
\`/analytics_events\`:
    POST /endpoint RequestModel
        => =>
`;
      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: incorrect or empty response');
    });
    it('endpoint with $CRUDL', () => {
      const sourceString = `
$CRUDL /roles
`;
      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: Not supported $CRUDL definition');
    });
    it('endpoint with $CRUDL with token', () => {
      const sourceString = `
@token $CRUDL /roles
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: Not supported $CRUDL definition');
    });
    it('endpoint with broken indentations', () => {
      const sourceString = `
\`/analytics_events\`:
    POST /endpoint RequestModel
        => ResponseModel
    => ResponseModel
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: Expected Name, found =>.');
    });
    it('endpoint with inline enums are not supported v2', () => {
      const sourceString = `
GET /examples?sort&limit?:i
  => {examples: Example[], totalCount?: i}
  => 404
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: Not supported inline query');
    });
    it('endpoint with inline enums are not supported v1', () => {
      const sourceString = `
GET /examples?sort:i
  => {examples: Example[], totalCount?: i}
  => 404
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: Not supported inline query');
    });
    it('endpoint with inline enums are not supported v2', () => {
      const sourceString = `
GET /examples?Sort:i
  => {examples: Example[], totalCount?: i}
  => 404
`;

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      expect(() => parse(source)).toThrow('Syntax Error: Not supported inline query');
    });
  });
});
