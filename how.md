```
AcDocument { a: string ;                   # qweijqhgwe  






 }
 
 ``` -> Lexer -> `[AcDocument, {, a, :, string, ; , }]`
                    Token[]


Lexer.next()
# => {kind: Name, value: AcDocument }

Lexer.next() = Lexer.advance()
# => {

Lexer.next()
# => {a}

Lexer возвращает смысловые единицы языка



AST