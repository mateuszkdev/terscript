import { Node } from '../types/Parser';
import { STORAGE, FUNCTIONS, isDebug } from '../index';

/**
 * @name Evaluator
 * @description Evaluate the tree
 */
export class Evaluator {

    private debug = (x: any, c: string) => isDebug && console.log(x, c);

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

    /**
     * @name evaluate
     * @description Evaluate the tree
     * @returns {*}
     */
    private evaluate(): any {

        this.current = this.next() as Node;
        this.skipNode(); // Skip a node if needed

        if (typeof this.checkNextNode == 'undefined' || typeof this.checkNextNode == 'boolean' ) return this.power = false; // Check if the program should stop
        
        this.debug(this.current, `evaluate call`)

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

        this.debug(node, `identifier call`)
        if (node.type == 'assign') return this.assign(node.children![0].value, node.children![1] as Node); // Assigning a variable
        else if (node.type == 'string') return node; // Returning a string
        else if (node.type == 'number') return node; // Returning a number
        else if (FUNCTIONS.isFunction(node.value)) return this.itsFunction(node); // Checking if the node is a function  
        else if (typeof node == 'boolean') return node; // Returning a boolean
        else return this.itsVariable(node); // Returning a variable

    }

    /**
     * @name itsFunction
     * @description Evaluate a function
     * @returns {void}
     */
    private itsFunction(node: Node): any {

        if (this.checkNextNode.type != 'arguments') throw new Error(`Function ${node.value} requires arguments.`); // Checking if the function has arguments

        this.debug(node, `itsFunction call`)

        const fun = FUNCTIONS.getFunction(node.value); // Getting the function
        const args = this.parseArguments((this.next() as Node).children!); // Getting the arguments

        // console.log(`{args: ${JSON.stringify(args)}}`)

        const output = fun.run(args.map((arg: Node) => arg.value)) || 'void'; // Running the function
        console.log(output)
        this.addOutput = `Function "${node.value}" called with arguments: ${JSON.stringify(args)}\n`;
        return output;

    }

    /**
     * @name parseArguments
     * @description Parse the arguments
     * @argument {Node[]} args The arguments to parse
     * @returns {Node[]} The parsed arguments
     */
    private parseArguments(args: Node[]): Node[] {

        args = args.map((arg: Node) => this.identifier(arg)).filter((arg): arg is Node => arg !== undefined); // Parse the arguments
        if (args.some((arg: Node) => arg.type == 'assign' || arg.type == 'identifier')) return this.parseArguments(args); // Check if the arguments are variables
        return args;

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
        // console.log(this.checkNextNode)
        if (FUNCTIONS.isFunction(value.value)) { // Check if the value is a function

            const nextNode = this.next() as Node;
            if (nextNode.type == 'arguments') { // Check if the function has arguments

                value.children?.push(nextNode); // Add the arguments to the function
                this.current = this.next() as Node; // Skip the arguments

            } else throw new Error(`Function ${value.value} requires arguments.`); // Throw an error if the function does not have arguments

        }
        STORAGE.setVariable = { name, value };
        this.addOutput = `Variable "${name}" set to ${JSON.stringify(value)}\n`;
        return value;
    }

    /**
     * @name checkNextNode
     * @description The checkNextNode method is responsible for checking the next Node.
     * @returns {Node} The next Node.
     */
    private get checkNextNode(): Node { return this.tree[this.index + 1]; }

    /**
     * @name addOutput
     * @description The addOutput method is responsible for adding to the output.
     * @param {string} x The string to add to the output.
     * @setter
     */
    private set addOutput(x: string) { this.output += `${x}\n`; }

    /**
     * @name skipNode
     * @description Skip a node
     * @returns 
     */
    private skipNode(): void {

        const currentNode = this.current;
        const lastNode = this.tree[this.index - 1] || { type: 'undefined' };
        const nextNode = this.checkNextNode;

        // console.log(this.current, lastNode, nextNode, 1)
        if (currentNode.type == 'identifier') {
            // console.log(2)
            if (nextNode.type == 'assign' && nextNode.children![0].value == currentNode.value) this.current = this.next() as Node;
        }
        
    }

}