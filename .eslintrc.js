module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true
    }
  },
  "rules": {
    "indent": "off",
    "comma-dangle": [
      "error",
      {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "only-multiline",
        "functions": "never"
      }
    ],
    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],
    "semi": [
      "error",
      "always"
    ],
    "semi-spacing": [
      "error",
      {
        "before": false,
        "after": false
      }
    ],
    "no-trailing-spaces": "error",
    "no-duplicate-imports": "error",
    "no-useless-computed-key": "error",
    "rest-spread-spacing": [
      "error",
      "never"
    ],
    "no-console": "off",
    "eqeqeq": [
      "error",
      "smart"
    ],
    "brace-style": [
      "error",
      "1tbs",
      {
        "allowSingleLine": true
      }
    ],
    "curly": "off",
    "object-shorthand": [
      "warn",
      "always"
    ],
    "key-spacing": [
      "error",
      {
        "beforeColon": false,
        "afterColon": true,
        "mode": "strict"
      }
    ],
    "camelcase": [
      "warn",
      {
        "properties": "always"
      }
    ],
    "dot-location": [
      "error",
      "property"
    ],
    "generator-star-spacing": [
      "off"
    ],
    "block-spacing": [
      "error",
      "always"
    ],
    "comma-style": [
      "error",
      "last"
    ],
    "comma-spacing": [
      "error",
      {
        "before": false,
        "after": true
      }
    ],
    "no-extend-native": "error",
    "no-loop-func": "error",
    "no-implied-eval": "error",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-multi-str": "error",
    "no-script-url": "error",
    "no-shadow-restricted-names": "error",
    "no-spaced-func": "error",
    "no-sparse-arrays": "warn",
    "no-fallthrough": "warn",
    "no-caller": "error",
    "no-eval": "error",
    "no-multiple-empty-lines": [
      "error",
      {
        "max": 2,
        "maxEOF": 1
      }
    ],
    "no-multi-spaces": [
      "error",
      {
        "ignoreEOLComments": true
      }
    ],
    "no-negated-in-lhs": "error",
    "no-new": "error",
    "no-new-require": "error",
    "block-scoped-var": "error",
    "no-use-before-define": "warn",
    "no-proto": "error",
    "complexity": [
      "warn",
      50
    ],
    "wrap-iife": [
      "error",
      "outside"
    ],
    "new-parens": "error",
    "space-infix-ops": "error",
    "eol-last": [
      "error",
      "always"
    ],
    "space-unary-ops": "error",
    "arrow-parens": [
      "error",
      "as-needed"
    ],
    "arrow-spacing": "error",
    "space-before-blocks": [
      "error",
      "always"
    ],
    "yoda": [
      "error",
      "never"
    ],
    "space-before-function-paren": "off",
    "spaced-comment": [
      "error",
      "always"
    ]
  }
}
