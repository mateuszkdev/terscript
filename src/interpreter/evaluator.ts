import { Token, Node } from '../types/Parser';
import { STORAGE, FUNCTIONS } from '../index';
import { StorageVariableCell } from 'types/Storage';

/**
 * @name Evaluator
 * @description Evaluate the tree
 */
export class Evaluator {

    /* VARIABLES */
    private tree: Node[] = [];
    private current: Node = { type: 'undefined', value: '', children: [] };
    private index: number = -1;
    private power: boolean = true;

    public output: string = '';

    /**
     * @name constructor
     * @description Initialize the Evaluator
     */
    constructor(tree: Node[]) {

        this.tree = tree;
        
        while (this.power) {

            if (this.index + 1 >= this.tree.length) this.power = false;
            this.evaluate();

        }

    }

    /**
     * @name next
     * @description Get the next node in the tree
     * @returns {Node | boolean} The next node in the tree
     */
    private next(): Node | boolean {
        
        if (this.index + 1 >= this.tree.length) return this.power = false;
        return this.tree[++this.index];

    }

    private evaluate(): any { // @TODO Add type

        this.current = this.next() as Node;

        // console.log(this.current);

        if (typeof this.checkNextNode == 'undefined' || typeof this.checkNextNode == 'boolean' ) return this.power = false;

        switch (this.current.type) {

            case 'assign': return this.assign();
            case 'identifier': return this.identifier(this.current);


        }

        return true;

    }

    /**
     * @name identifier
     * @description Identify variable or function
     * @argument {Node} node The node to identify
     * @returns {void}
     */
    private identifier(node: Node): any { // @TODO Add type

        if (node.type == 'string') return node;
        else if (node.type == 'number') return node;
        else if (FUNCTIONS.isFunction(node.value)) return this.itsFunction();
        else return this.itsVariable(node);
    }

    /**
     * @name itsFunction
     * @description Evaluate a function
     * @returns {void}
     */
    private itsFunction(): void {

        if (this.checkNextNode.type != 'arguments') throw new Error(`Function ${this.current.value} requires arguments.`);

        const fun = FUNCTIONS.getFunction(this.current.value);
        let args = (this.next() as Node).children!;
        args = args.map((arg: Node) => this.identifier(arg));
        fun.run(args.map((arg: any) => {
            if (arg.type == 'string') return arg.value;
            else if (arg.type == 'number') return arg.value;
            else if (arg.name) return arg.value.value;
            else return arg;
        }));
        this.addOutput = `Function "${this.current.value}" called with arguments: ${JSON.stringify(args)}\n`;

    }

    /**
     * @name itsVariable
     * @description Evaluate a variable
     * @argument {Node} node The node to check
     * @returns {void}
     */
    private itsVariable(node: Node): any { // @TODO Add type

        let variable = STORAGE.getVariable(node.value);
        this.addOutput = `Variable "${node.value}" called. Value: ${variable}\n`;
        return variable;

    }

    /**
     * @name assign
     * @description Assign a variable
     * @returns {void}
     */
    private assign(): void {
        STORAGE.setVariable = { name: this.current.children![0].value, value: this.current.children![1] as Node };
        this.addOutput = `Variable "${this.current.children![0].value}" set to ${JSON.stringify(this.current.children![1])}\n`;
    }

    /**
     * @name checkNextNode
     * @description The checkNextNode method is responsible for checking the next Node.
     * @returns {Node} The next Node.
     */
    private get checkNextNode(): Node {
        return this.tree[this.index + 1];
    }

    /**
     * @name addOutput
     * @description The addOutput method is responsible for adding to the output.
     * @param {string} x The string to add to the output.
     * @setter
     */
    private set addOutput(x: string) {
        this.output += `${x}\n`;
    }

}