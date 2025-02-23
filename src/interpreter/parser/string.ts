import { Token } from '../../types/Parser';
import { operators } from '../../utility/operators';

export default class String {

    /* VARIABLES */
    private index: number = -1;
    private power: boolean = true;  
    private current: Token = { type: 'undefined', value: '', line: 0, index: 0 };
    private tokens: Token[] = [];

    public value: string = '';
    public token: Token = { type: 'string', value: '', line: 0, index: 0 };

    constructor (tokens: Token[]) {

        this.tokens = tokens;

        while(this.power) this.value += this.parse();

        this.token = { type: 'string', value: this.value, line: this.current.line, index: this.current.index };

    }

    private parse(): void {
        
        this.current = this.tokens[++this.index];

        if (operators.quote.some(r => r.test(this.current.value))) this.power = false;
        else this.value += this.current.value;
    }

}