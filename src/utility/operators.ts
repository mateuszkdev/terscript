export const operators = {
    space: [/\s/],
    tab: [/\t/],
    enter: [/\n/],
    carriageReturn: [/\r/],
    formFeed: [/\f/],
    verticalTab: [/\v/],
    assign: [/\=/, /\→/],
    quote: [/\"/, /\'/],
    comma: [/\,/],
    add: [/\+/],
    subtract: [/\-/],
    multiply: [/\*/],
    divide: [/\//],
    leftParenthesis: [/\(/],
    rightParenthesis: [/\)/],
    leftBrace: [/\{/],
    rightBrace: [/\}/],
    variableInString: [/@/],
    lessThan: [/\</],
    greaterThan: [/\>/],
    dot: [/\./],
    modulus: [/\%/],
    colon: [/\:/],
    semicolon: [/\;/],
    exclamation: [/\!/],
    question: [/\?/],
}

export const comments = {
    leftComment: /\/*/,
    rightComment: /\*/,
    inlineComment: /#/
}