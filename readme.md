# anyspec [![codecov](https://codecov.io/gh/frolovdev/anyspec/branch/master/graph/badge.svg?token=8D8S09PRQI)](https://codecov.io/gh/frolovdev/anyspec)

Anyspec is a [DSL (Domain Specific Language)](https://en.wikipedia.org/wiki/Domain-specific_language) for writing API specs on top of [Openapi (swagger)](https://swagger.io/specification/).

The main problem we trying to solve is a verbosity of openapi.

* **Linting** - specs can be linted by internal linter, that can enhanced by your external rules.
* **Prettify** - we support pretifying of specs.
* Fully compatible with openapi specification

<table style="border-collapse: collapse !important; border: none !important;">
    <tbody>
        <tr>
          <td valign="middle">Built by 2 engineers related to Osome with love ❤️</td>
          <td valign="middle">
          <svg height="54" viewBox="0 0 115.7 40" width="156.25" xmlns="http://www.w3.org/2000/svg"><path d="m20 0c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm9.3 14.2c2.8 0 5.2 1.9 5.9 4.7.1.3 0 .6-.1.9-.2.3-.4.5-.7.5h-.3c-.5 0-1-.4-1.1-.9-.2-.8-.6-1.5-1.3-2.1-.6-.5-1.5-.8-2.3-.8-1.7 0-3.2 1.2-3.6 2.9-.1.3-.3.6-.5.7-.3.2-.6.2-.9.2-.3-.1-.6-.3-.7-.6-.2-.3-.2-.6-.1-.9.3-1.3 1-2.5 2.1-3.4.9-.7 2.2-1.1 3.6-1.2zm-18.6.1c2.8 0 5.2 1.9 5.9 4.7.1.3 0 .6-.1.9-.2.3-.4.5-.7.5-.6.2-1.3-.2-1.4-.9-.2-.8-.6-1.5-1.3-2s-1.5-.8-2.3-.8c-1.7 0-3.2 1.2-3.6 2.9-.1.3-.2.5-.4.7s-.6.1-.8.1h-.3c-.3-.1-.6-.3-.7-.5-.2-.3-.2-.6-.1-.9.3-1.3 1-2.5 2.1-3.4 1-.9 2.3-1.3 3.7-1.3zm57 4.8c-1.8-.4-2.7-.9-2.7-1.6s.6-1.2 1.7-1.2c1 0 1.8.6 2.3 1.6l2.1-1.2c-.4-.7-.9-1.3-1.6-1.8-.9-.5-1.9-.8-2.9-.7-1.2 0-2.2.3-3 .9-.4.3-.7.7-.9 1.1s-.3.9-.3 1.4c0 1.8 1.3 3 4 3.5.9.2 1.5.4 1.9.6s.6.5.6.9-.2.7-.5.9c-.4.2-.8.3-1.3.3-.7 0-1.3-.2-1.8-.7-.3-.3-.6-.6-.8-1l-2.3 1.4c.4.7.9 1.3 1.6 1.8.9.6 2 1 3.3 1 1.4 0 2.5-.4 3.3-1.1.4-.3.7-.7.9-1.2s.3-1 .3-1.5c0-.9-.3-1.7-.9-2.2s-1.6-.9-3-1.2zm33.9-1.2v7.9h-2.8v-7c0-1.4-.6-2.1-1.8-2.1-.6 0-1.2.2-1.6.7s-.6 1.2-.6 2.1v6.3h-2.8v-6.9c0-1.4-.6-2.2-1.8-2.2-.6 0-1.1.2-1.5.7-.4.6-.7 1.3-.6 2v6.3h-2.8v-11.2h2.8v1.5c.3-.6.8-1 1.4-1.3s1.2-.5 1.9-.5c1.6 0 2.6.6 3.1 1.9.4-.6.9-1.1 1.5-1.5.6-.3 1.3-.5 2-.5 1.1 0 2 .3 2.7 1 .6.8.9 1.7.9 2.8zm-23.4 5.7c-.9 0-1.7-.3-2.3-1-.6-.6-1-1.5-1-2.3s.3-1.7 1-2.3c.6-.6 1.5-1 2.3-1 .9 0 1.7.3 2.3 1 .6.6 1 1.5 1 2.3s-.3 1.7-1 2.3c-.6.6-1.5 1-2.3 1zm0-9.4c-.8 0-1.6.2-2.3.5s-1.4.8-2 1.3c-.6.6-1 1.2-1.3 2-.3.7-.5 1.5-.5 2.3s.2 1.6.5 2.3.8 1.4 1.3 2c.6.6 1.2 1 2 1.3.7.3 1.5.5 2.3.5 1.6 0 3.1-.6 4.3-1.8 1.1-1.1 1.8-2.7 1.8-4.3s-.6-3.1-1.8-4.3-2.7-1.8-4.3-1.8zm-23.2 9.4c-.9 0-1.7-.3-2.3-1-.6-.6-1-1.5-1-2.3s.3-1.7 1-2.3c.6-.6 1.5-1 2.3-1 .9 0 1.7.3 2.3 1s1 1.5 1 2.3-.3 1.7-1 2.3c-.6.6-1.4 1-2.3 1zm0-9.4c-.8 0-1.6.2-2.3.5s-1.4.8-2 1.3c-.6.6-1 1.2-1.3 2-.3.7-.5 1.5-.5 2.3s.2 1.6.5 2.3.8 1.4 1.3 2c.6.6 1.2 1 2 1.3.7.3 1.5.5 2.3.5 1.6 0 3.1-.6 4.3-1.8 1.1-1.1 1.8-2.7 1.8-4.3s-.6-3.1-1.8-4.3-2.7-1.8-4.3-1.8zm54.9 2.5c1.7 0 2.7 1 3.1 2.4h-6.2c0-.1.1-.2.1-.3.5-1.2 1.6-2.1 3-2.1zm5.8 4.5c0-.6-.1-2.5-.6-3.5-.4-1-1.2-1.9-2.1-2.5s-2-.9-3.1-.9c-3.4 0-6.1 2.8-6.1 6.3 0 3.2 2.6 6.3 6.3 6.3 2.3 0 4.4-1.2 5.6-2.9l-2.3-1.3c-.4.5-1 .9-1.5 1.1s-1.2.4-1.9.4c-.8 0-1.6-.3-2.3-.9s-1-1.3-1.2-2.1z" fill="#244ba8"/></svg>
          </td>
        </tr>
    </tbody>
</table>   




[We are hiring](https://osome.com/careers/positions/)

Example in action

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
