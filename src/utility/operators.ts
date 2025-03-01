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
    variableInString: [/@/]

}

export const comments = {
    leftComment: /\/*/,
    rightComment: /\*/,
    inlineComment: /#/
}