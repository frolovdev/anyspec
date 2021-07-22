# anyspec [![codecov](https://codecov.io/gh/frolovdev/anyspec/branch/master/graph/badge.svg?token=8D8S09PRQI)](https://codecov.io/gh/frolovdev/anyspec)

Anyspec is a [DSL (Domain Specific Language)](https://en.wikipedia.org/wiki/Domain-specific_language) for writing API specs on top of [Openapi (swagger)](https://swagger.io/specification/).

The main problem we trying to solve is a verbosity of openapi.

* **Linting** - specs can be linted by internal linter, that can enhanced by your external rules.
* **Prettify** - we support pretifying of specs.
* Fully compatible with openapi specification

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

## License

The code in this project is released under the [MIT License](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ffrolovdev%2Fanyspec.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ffrolovdev%2Fanyspec?ref=badge_large)
