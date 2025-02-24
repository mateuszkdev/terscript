import { Token, Node } from '../types/Parser';
import { operators } from '../utility/operators';
import { charset } from '../utility/charset';

import String from './parser/string';

/**
 * @name Parser
 * @description The Parser class is responsible for converting the list of tokens into a list of nodes.
 */
export class Parser {

    /* VARIABLES */
    private power: boolean = true;
    private tokens: Token[] = [];
    private index: number = -1;
    private current: Token = { type: 'undefined', value: '', line: 0, index: 0 };
    private node: Node = { type: 'undefined', value: '', children: [] };
    private lastToken: Token = { type: 'undefined', value: '', line: 0, index: 0 };

    public tree: Node[] = [];

    /**
     * @description The constructor for the Parser class.
     * @param tokens 
     */
    constructor(tokens: Token[]) {

        // Set the tokens
        this.tokens = tokens;

        // Loop through the tokens for splitting
        let tmpTokens: Token[] = [];
        while(this.power) tmpTokens.push(this.split() as Token);

        // Set the tokens and reset variables
        this.power = true;
        this.tokens = tmpTokens;
        this.index = -1;

        console.log(this.tokens) // test log

        // Loop through the tokens for parsing
        while(this.power) {
            this.node = this.parse() as Node;
            this.tree.push(this.node);
        }

    }

    /**
     * @name parse
     * @description The parse method is responsible for parsing the tokens into nodes.
     * @returns {Node | boolean} The next node.
     */
    private parse(): Node | boolean {

        if (typeof this.checkNextToken == 'undefined' || typeof this.checkNextToken == 'boolean') return this.power = false;
        if (this.checkNextToken.type == 'space' || this.checkNextToken.type == 'tab' || this.checkNextToken.type == 'enter') { this.next(); return this.parse()}

        this.lastToken = this.current
        this.current = this.next();

        if (this.current.type == 'quote') return this.parseString();
        else if (this.current.type == 'letters') return { type: 'identifier', value: this.current.value, children: [] }
        else if (this.current.type == 'numbers') return { type: 'number', value: this.current.value, children: [] }
        else if (this.current.type == 'assign') return this.parseAssign();
        else if (this.current.type == 'leftParenthesis') return this.parseArguments();
        // else if (this.current.type == 'add' || this.current.type == 'subtract' || this.current.type == 'multiply' || this.current.type == 'divide') return this.parseOperation();
        else return this.parse();

    }

    /**
     * @name parseArguments
     * @description The parseArguments method is responsible for parsing the arguments.
     * @returns {Node} Parsed Arguments
     */
    private parseArguments(): Node {
        
        let args: Node[] = [];
        let pwr: boolean = true;
        while (pwr) {
            if (this.checkNextToken.type == 'rightParenthesis') { this.next(); pwr = false; }
            if (this.current.type == 'comma') {
                this.next();
                args.push(this.parse() as Node)
            }
            else args.push(this.parse() as Node);
        }

        return { type: 'arguments', value: '', children: args };
    }

    /**
     * @name parseString
     * @description The parseString method is responsible for parsing the string token.
     * @returns {Node} Parsed String
     */
    private parseString(): Node {

        const string = new String(this.scaleTokens());
        this.updateIndex(string.index);
        return { type: 'string', value: string.value, children: [] };

    }

    /**
     * @name parseAssign
     * @description The parseAssign method is responsible for parsing the assign token.
     * @returns {Node} Parsed Assign
     */
    private parseAssign(): Node {

        return { type: 'assign', value: '=', children: [this.lastToken, this.parse() as Token] };

    }

    /**
     * @name scaleTokens
     * @description The scaleTokens method is responsible for scaling the tokens.
     * @returns {Token[]} The scaled tokens.
     */
    private scaleTokens(): Token[] {
        return this.tokens.slice(this.index);
    }

    /**
     * @name updateIndex
     * @description The updateIndex method is responsible for updating the index.
     * @param {number} i The number to add to the index. 
     * @returns {void}
     */
    private updateIndex(i: number): void {
        this.index += (i + 0);
    }

    /**
     * @name checkNextToken
     * @description The checkNextToken method is responsible for checking the next token.
     * @returns {Token} The next token.
     */
    private get checkNextToken(): Token {
        return this.tokens[this.index + 1];
    }

    /**
     * @name next
     * @description The next method is responsible for returning the next token in the code.
     * @param {number} i Number to add to the index ( default 0 ) 
     * @returns 
     */
    private next(i: number = 0): Token { // can't be used in split method because it will skip space etc.

        let next = this.tokens[this.index + (1 + i)];
        if (next.type == 'space' || next.type == 'tab' || next.type == 'enter') return this.next(1);
        else return this.tokens[++this.index];

    }

    /**
     * @name split
     * @description The split method is responsible for splitting the single tokens into multiple tokens.
     * @returns {Token | boolean} The next token. 
     */
    private split(): Token | boolean {

        this.current = this.tokens[++this.index];

        if (typeof this.current == 'undefined' || !this.current.type) return this.power = false;
        else {

            let tmp = ''
            if (Object.values(charset).some(r => r.test(this.current.type))) {

                tmp = this.current.value
                while (this.tokens[this.index + 1].type == this.current.type) {
                    this.current = this.tokens[++this.index];
                    tmp += this.current.value;
                }

                return this.current = { type: this.current.type, value: tmp, line: this.current.line, index: this.current.index };
                
            } else return this.current = this.tokens[++this.index];

        }
        

    }

}