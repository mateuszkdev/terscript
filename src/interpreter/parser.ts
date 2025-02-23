import { Token, Node } from '../types/Parser';
import { operators } from '../utility/operators';
import { charset } from '../utility/charset';

/**
 * @name Parser
 * @description The Parser class is responsible for converting the list of tokens into a list of nodes.
 */
export default class Parser {

    /* VARIABLES */
    private power: boolean = true;
    private tokens: Token[] = [];
    private index: number = -1;
    private current: Token = { type: 'undefined', value: '', line: 0, index: 0 };
    private node: Node = { type: 'undefined', value: '', children: [] };

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

        // Loop through the tokens for parsing
        while(this.power) this.tree.push(this.parse() as Node);

    }

    /**
     * @name parse
     * @description The parse method is responsible for parsing the tokens into nodes.
     * @returns {Node | boolean} The next node.
     */
    private parse(): Node | boolean {

        this.current = this.tokens[++this.index];

        if (typeof this.current == 'undefined' || typeof this.current == 'boolean') return this.power = false;

        else if (this.current.type == 'space' || this.current.type == 'tab' || this.current.type == 'enter') return this.parse();
        else if (this.current.type == 'quote') return this.parseString();
        // else if (this.current.type == 'assign') return this.parseAssign();
        // else if (this.current.type == 'add' || this.current.type == 'subtract' || this.current.type == 'multiply' || this.current.type == 'divide') return this.parseOperation();
        // else if (this.current.type == 'identifier') return this.parseIdentifier();
        else return this.parse();

    }

    private parseString(): Node {

        let value = '';
        this.current = this.tokens[++this.index];

        while (this.current.type != 'quote') {
            value += this.current.value;
            this.current = this.tokens[++this.index];
        }

        return { type: 'string', value: value, children: [] };

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