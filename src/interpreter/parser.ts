import { Token, Node } from '../types/Parser';
import { operators } from '../utility/operators';
import { charset } from '../utility/charset';
import { isDebug } from '../index';

import String from './parser/string';

const DEBUG: boolean = true;

/**
 * @name Parser
 * @description The Parser class is responsible for converting the list of tokens into a list of nodes.
 */
export class Parser {

    private debug = (x: any, c: string) => (isDebug && DEBUG) && console.log(x, c);
    #i = 0;

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
        this.clearTokens(); // clear the tokens

        // console.log(this.tokens) // test log

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

        this.debug(this.current, `parse call ${++this.#i}`) // debug log;

        /* Check if program should sotp and skipping whitechars */
        if (typeof this.checkNextToken == 'undefined' || typeof this.checkNextToken == 'boolean') return this.power = false;
        if (this.checkNextToken.type == 'space' || this.checkNextToken.type == 'tab' || this.checkNextToken.type == 'enter') { this.next(); return this.parse()}

        this.lastToken = this.current || { type: 'undefined', value: '', line: 0, index: 0 };
        this.current = this.next();
        // console.log(this.current)
        /* Checking maths */
        if (this.current.type == 'add' || this.current.type == 'subtract' || this.current.type == 'multiply' || this.current.type == 'divide') return this.parseMath();

        /* Check for the type of token */
        if (this.current.type == 'quote') return this.parseString();
        else if (this.current.type == 'letters') return { type: 'identifier', value: this.current.value, children: [] }
        else if (this.current.type == 'numbers') return { type: 'number', value: this.current.value, children: [] }
        else if (this.current.type == 'assign') return this.parseAssign();
        else if (this.current.type == 'leftParenthesis') return this.parseArguments();
        else if (this.current.type == 'leftBrace') return this.parseBrances();
        else return this.parse();

    }

    /**
     * @name parseMath
     * @description The parseMath method is responsible for parsing the math token.
     * @returns {Node} Parsed Math
     */
    private parseMath(): Node {

        this.debug(this.current, 'parseMath call') // debug log;

        return { type: 'math', value: this.current.type, children: [this.lastToken, this.parse() as Node] }

    }

    /**
     * @name parseArguments
     * @description The parseArguments method is responsible for parsing the arguments.
     * @returns {Node} Parsed Arguments
     */
    private parseArguments(): Node {
        
        this.debug(this.current, 'parseArguments call') // debug log;

        let args: Node[] = [];
        let pwr: boolean = true;
        while (pwr) {
            
            if (typeof this.checkNextToken == 'undefined' || typeof this.checkNextToken == 'boolean') { this.next(); pwr = false; }
            
            if (this.checkNextToken.type == 'leftParenthesis') { this.next(); args.push(this.parseArguments()); };
            if (this.checkNextToken.type == 'rightParenthesis') { this.next(); pwr = false; }
            else if (this.lastToken.type == 'identifier' && (this.current.type == 'assign' && this.lastToken.value == this.current.value)) {
                this.next();
            }
            else if (this.current.type == 'comma') {
                this.next();
                args.push(this.parse() as Node)
            }
            else args.push(this.parse() as Node);

        }

        return { type: 'arguments', value: '', children: args };

    }

    /**
     * @name parseBrances
     * @description The parseBrances method is responsible for parsing the brances.
     * @returns {Node} Parsed Brances
     */
    private parseBrances(): Node {

        this.debug(this.current, 'parseBrances call') // debug log;

        let brances: Node[] = [];
        let pwr: boolean = true;

        while (pwr) {

            console.log(this.current, this.checkNextToken)
            if (typeof this.checkNextToken == 'undefined' || typeof this.checkNextToken == 'boolean' || !this.checkNextToken) { this.next(); pwr = false; break; }
            if (this.checkNextToken.type == 'leftBrace') throw new Error('Braces are not allowed in braces');
            if (this.checkNextToken.type == 'rightBrace') { this.next(); pwr = false; }

            brances.push(this.parse() as Node);

        }
        
        return { type: 'brances', value: '', children: brances }

    }

    /**
     * @name parseString
     * @description The parseString method is responsible for parsing the string token.
     * @returns {Node} Parsed String
     */
    private parseString(): Node {

        this.debug(this.current, 'parseString call') // debug log;

        const string = new String(this.scaleTokens()); // parse the string
        this.updateIndex(string.index); // update the index
        if (this.tokens.slice(this.index)[0].type == 'quote') this.next(); // fix the index

        return { type: 'string', value: string.value, children: [] };

    }

    /**
     * @name parseAssign
     * @description The parseAssign method is responsible for parsing the assign token.
     * @returns {Node} Parsed Assign
     */
    private parseAssign(): Node {

        this.debug(this.current, 'parseAssign call') // debug log;

        this.tree.pop();
        return { type: 'assign', value: '=', children: [this.lastToken, this.parse() as Token] };

    }

    /**
     * @name scaleTokens
     * @description The scaleTokens method is responsible for scaling the tokens.
     * @returns {Token[]} The scaled tokens.
     */
    private scaleTokens(): Token[] { return this.tokens.slice(this.index); }

    /**
     * @name updateIndex
     * @description The updateIndex method is responsible for updating the index.
     * @param {number} i The number to add to the index. 
     * @returns {void}
     */
    private updateIndex(i: number): void { this.index += (i + 0); }

    /**
     * @name checkNextToken
     * @description The checkNextToken method is responsible for checking the next token.
     * @returns {Token} The next token.
     */
    private get checkNextToken(): Token { return this.tokens[this.index + 1]; }

    /**
     * @name next
     * @description The next method is responsible for returning the next token in the code.
     * @param {number} i Number to add to the index ( default 0 ) 
     * @returns 
     */
    private next(i: number = 0): Token { // can't be used in split method because it will skip space etc.

        let next = this.tokens[this.index + (1 + i)];

        if (!next || !next.type) { this.power = false; return { type: 'undefined', value: '', line: 0, index: 0 }; } // check if the next token is undefined
        if (next.type == 'space' || next.type == 'tab' || next.type == 'enter' || next.type == 'carriageReturn') { // check if the next token is a whitechar ( there is no need due to the clearTokens method but better to be prepared)
            this.index++;
            return this.next();
        }
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

                if (this.current.type == 'letters' || this.current.type == 'numbers') {

                    tmp = this.current.value
                    while (this.tokens[this.index + 1].type == this.current.type) {
                        this.current = this.tokens[++this.index];
                        tmp += this.current.value;
                    }

                } else tmp = this.current.value;

                return this.current = { type: this.current.type, value: tmp, line: this.current.line, index: this.current.index };
                
            } else return this.current = this.tokens[++this.index];

        }
        
    }

    /**
     * @name clearTokens
     * @description The clearTokens method is responsible for clearing the tokens.
     * @returns {void} 
     */
    private clearTokens(): void {

        this.debug('clearTokens call', 'clearTokens call') // debug log;
        this.tokens = this.tokens.filter(t => t.type != 'space' && t.type != 'tab' && t.type != 'enter' && t.type != 'carriageReturn');

    }

}