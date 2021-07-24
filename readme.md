# anyspec [![codecov](https://codecov.io/gh/frolovdev/anyspec/branch/master/graph/badge.svg?token=8D8S09PRQI)](https://codecov.io/gh/frolovdev/anyspec)

Anyspec is a [DSL (Domain Specific Language)](https://en.wikipedia.org/wiki/Domain-specific_language) for writing API specs with main compilation target to [Openapi (swagger)](https://swagger.io/specification/).

The main problem we are trying to solve is the verbosity of open API.

* **Write less code** - get rid of boileprate in your daily routine. 
* **Enforce best practices** - use predefined or write your own rules for specs.
* **Prettify (WIP)** - format your code without pain.
* **Compilation (WIP)** - the result json is fully compatible with openapi specification.

<table>
    <tbody>
        <tr>
          <td valign="middle">Built by 2 engineers for Osome with love ❤️</td>
          <td valign="middle">
            <img src="https://raw.githubusercontent.com/frolovdev/anyspec/master/assets/osome.svg" />
          </td>
        </tr>
    </tbody>
</table> 

[We are hiring](https://osome.com/careers/positions/)

## Watch in action

Before
```

// **Some description**
@token POST /documents DocumentNew
    => { document: Document }

DocumentNew {
  name: s, 
}

DocumentNew {
  id: i,
  name: s,
}
```

After

```json
{
  "swagger": "2.0",
  "info": {
    "title": "Test API",
    "version": "{{version}}"
  },
  "host": "{{host}}",
  "basePath": "/api/v2",
  "schemes": [
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "securityDefinitions": {
    "token": {
      "name": "X-Access-Token",
      "type": "apiKey",
      "in": "header"
    }
  },
  "paths": {
    "/documents": {
      "post": {
        "summary": "**Some description**",
        "description": "**Some description**",
        "operationId": "POST--documents",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "type": "object",
              "properties": {
                "document": {
                  "$ref": "#/definitions/Document"
                }
              },
              "required": [
                "document"
              ]
            }
          }
        },
        "security": [
          {
            "token": []
          }
        ],
        "parameters": [
          {
            "name": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/DocumentNew"
            },
            "in": "body"
          }
        ]
      }
    }
  },
  "definitions": {
    "DocumentNew": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        }
      },
      "required": [
        "id",
        "name"
      ]
    }
  }
}
```

## Table of contents

## List of rules

[Watch docs](https://frolovdev.github.io/anyspec/modules.html)

## Inspiration section

The main idea of library - DSL on top of openapi comes from [tinyspec](https://github.com/Ajaxy/tinyspec). The syntax constructions comes from tinyspec too. 

Also authors were inspired and use a lot of findings and ideas from:

* [Graphqljs implementation](https://github.com/graphql/graphql-js)
* [python lexer and parser](https://github.com/python)

## License

The code in this project is released under the [MIT License](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ffrolovdev%2Fanyspec.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ffrolovdev%2Fanyspec?ref=badge_large)
