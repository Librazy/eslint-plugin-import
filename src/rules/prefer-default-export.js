'use strict'

const ruleDocsUrl = 'https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules'

module.exports = {
  meta: {
    docs: {
      url: `${ruleDocsUrl}/prefer-default-export.md`,
    },
  },

  create: function(context) {
    let specifierExportCount = 0
    let hasDefaultExport = false
    let hasStarExport = false
    let namedExportNode = null

    function captureDeclaration(identifierOrPattern) {
      if (identifierOrPattern.type === 'ObjectPattern') {
        // recursively capture
        identifierOrPattern.properties
          .forEach(function(property) {
            captureDeclaration(property.value)
          })
      } else {
      // assume it's a single standard identifier
        specifierExportCount++
      }
    }

    return {
      'ExportDefaultSpecifier': function() {
        hasDefaultExport = true
      },

      'ExportSpecifier': function(node) {
        if (node.exported.name === 'default') {
          hasDefaultExport = true
        } else {
          specifierExportCount++
          namedExportNode = node
        }
      },

      'ExportNamedDeclaration': function(node) {
        // if there are specifiers, node.declaration should be null
        if (!node.declaration) return

        // don't count flow types exports
        if (node.exportKind === 'type') return

        if (node.declaration.declarations) {
          node.declaration.declarations.forEach(function(declaration) {
            captureDeclaration(declaration.id)
          })
        }
        else {
          // captures 'export function foo() {}' syntax
          specifierExportCount++
        }

        namedExportNode = node
      },

      'ExportDefaultDeclaration': function() {
        hasDefaultExport = true
      },

      'ExportAllDeclaration': function() {
        hasStarExport = true
      },

      'Program:exit': function() {
        if (specifierExportCount === 1 && !hasDefaultExport && !hasStarExport) {
          context.report(namedExportNode, 'Prefer default export.')
        }
      },
    }
  },
}
