import { Node } from '../types/Parser';
import { STORAGE, FUNCTIONS } from '../index';

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
        
        // Loop through the tree
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
        
        if (this.index + 1 >= this.tree.length) return this.power = false; // Check if the program should stop
        return this.tree[++this.index]; // Return the next node

    }

    private evaluate(): any {

        this.current = this.next() as Node;

        // console.log(this.current);

        if (typeof this.checkNextNode == 'undefined' || typeof this.checkNextNode == 'boolean' ) return this.power = false;

        switch (this.current.type) {

            case 'assign': { return this.assign(this.current.children![0].value, this.current.children![1] as Node);} // Assigning a variable
            case 'identifier': return this.identifier(this.current); // Identifying rest of the nodes


        }

        return true;

    }

    /**
     * @name identifier
     * @description Identify variable or function
     * @argument {Node} node The node to identify
     * @returns {void}
     */
    private identifier(node: Node): Node | void {

        if (node.type == 'assign') return this.assign(this.current.children![0].value, this.current.children![1] as Node); // Assigning a variable
        else if (node.type == 'string') return node; // Returning a string
        else if (node.type == 'number') return node; // Returning a number
        else if (FUNCTIONS.isFunction(node.value)) return this.itsFunction(); // Checking if the node is a function  
        else if (typeof node == 'boolean') return node; // Returning a boolean
        else return this.itsVariable(node); // Returning a variable
    }

    /**
     * @name itsFunction
     * @description Evaluate a function
     * @returns {void}
     */
    private itsFunction(): void {

        if (this.checkNextNode.type != 'arguments') throw new Error(`Function ${this.current.value} requires arguments.`); // Checking if the function has arguments

        const fun = FUNCTIONS.getFunction(this.current.value); // Getting the function

        let args = (this.next() as Node).children!; // Getting the arguments

        // for (let i = 0; i < args.length; i++) {
        //     if (args[i].type == 'identifier' && args[i+1].type == 'assign' && (args[i].value == args[i+1].children![0].value)) {
        //         args[i+1] = this.assign(args[i].value, args[i+1] as Node);
        //         args.splice(i+1, 1);
        //     }
        // }

        console.log(args)
        args = args.map((arg: Node) => this.identifier(arg)).filter((arg): arg is Node => arg !== undefined); // Getting the arguments

        fun.run(args.map((arg: Node) => arg.value)); // Running the function

        this.addOutput = `Function "${this.current.value}" called with arguments: ${JSON.stringify(args)}\n`;

    }

    /**
     * @name itsVariable
     * @description Evaluate a variable
     * @argument {Node} node The node to check
     * @returns {void}
     */
    private itsVariable(node: Node): Node {

        // console.log(node)
        let variable = STORAGE.getVariable(node.value);
        this.addOutput = `Variable "${node.value}" called. Value: ${variable}\n`;
        return variable;

    }

    /**
     * @name assign
     * @description Assign a variable
     * @returns {void}
     */
    private assign(name: string, value: Node): Node {

        // console.log(name, value)
        STORAGE.setVariable = { name, value };
        this.addOutput = `Variable "${name}" set to ${JSON.stringify(value)}\n`;
        return value;
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