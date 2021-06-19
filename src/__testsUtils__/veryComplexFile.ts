export const modelsFile = `

AcDocument < Kek, Lel !{
  -name?: s[],
  type?: ( standard | service ),
  kek: { conversationId: i, users: { id: i, nickname, avatar? }[] },
  surname: b[],
}


A {
  b?: i,
  c: (a | b | c),

}

# enum
A (
  f | b | 
)

A # comment {
  {
  b,
  # comment
  b?,
  -b,
  -b?: i,
  -b?: i,
}

MyModel {ekek: b[],kek: i[] }

# inline enum
MyModel {color: (sample|42|true)}

# commnet
A !{
  b?,
  c: (a | b | c),
  l: {
    c: i,
    e: b
  }
}

// My _perfect_ tiny model
MyModel2 {dimensions?: Dimensions, color: Color}


A < B, C {foo}

AgentCompaniesQuery {
  sort?: (
    tickets |
    -tickets |
    transactions |
    -transactions |
    documents |
    -documents
  ),
}

AskerLinesQuerySort (
  smart |
  date | +date | -date
)




`;
