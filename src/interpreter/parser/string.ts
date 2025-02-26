import { Token } from '../../types/Parser';
import { operators } from '../../utility/operators';

export default class String {

    /* VARIABLES */
    private power: boolean = true;  
    private current: Token = { type: 'undefined', value: '', line: 0, index: 0 };
    private tokens: Token[] = [];

    public index: number = -1;
    public value: string = '';
    public token: Token = { type: 'string', value: '', line: 0, index: 0 };

    constructor (tokens: Token[]) {

        this.tokens = tokens;
        // console.log(this.tokens, "string parsing input")
        if (this.tokens[0].type == 'quote') this.index = 0;
        while(this.power) this.parse();

        this.token = { type: 'string', value: this.value, line: this.current.line, index: this.current.index };
        // console.log(this.token, "string parsing output")

    }

    private parse(): void {
        
        this.current = this.tokens[++this.index];
        if (operators.quote.some(r => r.test(this.current.value))) this.power = false;
        else this.value += this.current.value;

    }

}