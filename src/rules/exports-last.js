function isNonExportStatement({ type }) {
  return type !== 'ExportDefaultDeclaration' &&
    type !== 'ExportNamedDeclaration' &&
    type !== 'ExportAllDeclaration'
}

const ruleDocsUrl = 'https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules'

module.exports = {
  meta: {
    docs: {
      url: `${ruleDocsUrl}/exports-last.md`,
    },
  },

  create: function (context) {
    return {
      Program: function ({ body }) {
        const lastNonExportStatementIndex = body.reduce(function findLastIndex(acc, item, index) {
          if (isNonExportStatement(item)) {
            return index
          }
          return acc
        }, -1)

        if (lastNonExportStatementIndex !== -1) {
          body.slice(0, lastNonExportStatementIndex).forEach(function checkNonExport(node) {
            if (!isNonExportStatement(node)) {
              context.report({
                node,
                message: 'Export statements should appear at the end of the file',
              })
            }
          })
        }
      },
    }
  },
}
