/* IMPORTS */
import { operators } from '../utility/operators';
import { charset } from '../utility/charset';
import { Token } from '../types/Parser';
import { isDev } from '../index';

/**
 * @name Lexer
 * @description The Lexer class is responsible for converting the raw code into a list of tokens.
 */
export default class Lexer {

    /* VARIABLES */
    private code: string[] = [];
    private index: number = -1;
    private power: boolean = true;
    private currentLine: number = 1;
    private currentIndex: number = -1;

    public tokens: Token[] = [];

    /**
     * @description The constructor for the Lexer class.
     * @param {string} code The raw code to be tokenized.
     */
    constructor(code: string) {
        
        this.splitCode(code);

        while (this.power) {
            let tmp = this.next() as Token; // Get the next token
            this.tokens.push(this.organizeToken(tmp)); // Push the next organized token
        }

    }

    /**
     * @name organizeToken
     * @description The organizeToken method is responsible for organizing the token.
     * @param token The token to be organized.
     * @returns {Token} The organized token.
     */
    private organizeToken(token: Token): Token {

        if (token.type == 'enter') { // New Line
            this.currentLine++;
            this.currentIndex = 0;
            return { type: 'enter', value: '\n', line: this.currentLine, index: 0 };
        }

        else return { type: token.type, value: token.value, line: this.currentLine, index: ++this.currentIndex };

    }

    /**
     * @name splitCode
     * @description The splitCode method is responsible for converting the raw code into a list of strings.
     * @param {string} code The raw code to be tokenized.
     * @returns {void}
     */
    private splitCode(code: string): void {
        this.code = code.split(''); // Split
    }

    /**
     * @name next
     * @description The next method is responsible for returning the next token in the code.
     * @returns {Token | boolean} The next token in the code.
     */
    private next(): Token | boolean {

        let tmp = undefined;

        if (!this.code[this.index + 1]) return this.power = false; // End of Lexer

        (tmp == undefined) && Object.entries(operators).forEach(o => o[1].some(r => r.test(this.code[this.index + 1]) && (tmp = o[0]))); // Operators
        (tmp == undefined) && Object.entries(charset).forEach(c => (c[1].test(this.code[this.index + 1]) && (tmp = c[0]))); // Charset

        if (tmp == undefined) {
            if (charset.numbers.test(this.code[this.index + 1])) return { type: 'number', value: this.code[++this.index], line: 0, index: 0 }; // Numbers
            else return { type: 'undefined', value: this.code[++this.index], line: 0, index: 0 }; // Undefined
        }
        else return { type: tmp, value: this.code[++this.index], line: 0, index: 0 };

    }

}