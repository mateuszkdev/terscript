import { Node } from '../types/Parser';
import { STORAGE, FUNCTIONS, isDebug, debugFile } from '../index';
import { FunctionDeclaration } from 'types/Functions';

/**
 * @name Evaluator
 * @description Evaluate the tree
 */
export class Evaluator {

    private debug = (x: any, c?: string) => (isDebug && debugFile == 'eval') && console.log(x, c);

    /* VARIABLES */
    private current: Node = { type: 'undefined', value: '', children: [] };
    private index: number = -1;
    private power: boolean = true;

    public output: string = '';

    /**
     * @name constructor
     * @description Initialize the Evaluator
     */
    constructor(private tree: Node[]) {

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
        if (typeof this.tree[this.index + 1] == 'boolean') { this.power = false; return false; }; // Skip the node if it is undefined
        return this.current = this.tree[++this.index]; // Return the next node

    }

    /**
     * @name evaluate
     * @description Evaluate the tree
     * @returns {*}
     */
    private evaluate(): any {

        this.current = this.next() as Node;
        this.skipNode(); // Skip a node if needed

        if (typeof this.checkNextNode == 'undefined' || typeof this.checkNextNode == 'boolean') return this.power = false; // Check if the program should stop

        this.debug(this.current, `evaluate call`)

        switch (this.current.type) {

            case 'assign': { return this.assign(this.current.children![0].value, this.current.children![1] as Node); } // Assigning a variable
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
        else if (node.type == 'add' || node.type == 'subtract' || node.type == 'multiply' || node.type == 'divide') return this.isMath(node)
        else if (node.type == 'arguments') return node; // Returning arguments
        else if (node.type == 'string') return node; // Returning a string
        else if (node.type == 'number') return node; // Returning a number
        else if (this.checkFunctionDeclarationNodes(node)) return this.itsFunction(node); // Checking if the node is a function declaration
        else if (FUNCTIONS.isFunction(node.value)) return this.itsFunction(node); // Checking if the node is a function  
        else if (typeof node == 'boolean') return node; // Returning a boolean
        else this.itsVariable(node); // Returning a variable

    }

    /**
     * @name isMath
     * @description Evaluate math
     * @param {Node} node The math node 
     * @returb {Node}
     */
    private isMath(node: Node): Node {

        let value = '';

        console.log(node)

        return { type: 'number', value: eval(value) }

    }

    /**
     * @name checkFunctionDeclarationNodes
     * @description Check if the function is correctly declared
     * @param {Node} node The node to check
     * @returns {boolean} If the function is correctly declared
     */
    private checkFunctionDeclarationNodes(node: Node): boolean {

        this.debug(node, `checkFunctionDeclarationNodes call`);

        if (node.type != 'identifier') return false;

        if (this.checkNextNode.type == 'arguments' || node.children?.some((child: Node) => child.type == 'arguments')) {
            if (!this.checkNextNode || !this.tree[this.index + 2]) { return false; }

            if (this.checkNextNode.type == 'arguments' && this.tree[this.index + 2].type == 'braces') { return true; }

            if (node.children?.some((child: Node) => child.type == 'arguments') && this.checkNextNode.type == 'braces') { return true; }
        }

        return false

    }

    /**
     * @name checkFunctionDeclaration
     * @description Check if the function is correctly declared
     * @param {Node} node The node to check
     * @returns {boolean} If the function is correctly declared
     * @throws {Error} If the function is not correctly declared
     * @throws {Error} If the function does not have arguments
     * @throws {Error} If the function does not have braces
     */
    private checkFunctionDeclaration(node: Node): boolean {

        this.debug(node, `checkFunctionDeclaration call`);

        if (FUNCTIONS.isFunction(node.value)) return true; // Check if the function is declared
        if (this.checkNextNode.type == 'arguments' || node.children?.some((child: Node) => child.type == 'arguments')) { // Check if the function has arguments

            const functionData: FunctionDeclaration = { name: node.value, args: [], run: [] };

            if (this.checkNextNode.type == 'arguments') functionData.args = (this.next() as Node).children!; // Getting the arguments from next node
            else functionData.args = node.children!.filter((child: Node) => child.type == 'arguments') as Node[]; // Getting the arguments from node children

            // this.next(); // Skip the arguments

            if (!this.checkNextNode || this.checkNextNode.type != 'braces') throw new Error(`Function ${node.value} requires braces.`); // Throw an error if the function does not have braces
            functionData.run = (this.next() as Node).children!; // Getting the function run Nodes

            FUNCTIONS.setFunction(functionData.name, functionData); // Setting the function
            this.addOutput = `Function "${functionData.name}" declared with arguments:\n${JSON.stringify(functionData.args)}\nand exec:\n${JSON.stringify(functionData.run)}\n`; // Adding to the output

        } else throw new Error(`Function ${node.value} requires arguments.`); // Throw an error if the function does not have arguments

        return false;

    }

    /**
     * @name itsFunction
     * @description Evaluate a function
     * @returns {void}
     */
    private itsFunction(node: Node): any {

        this.debug(node, `itsFunction call`)
        if (this.checkFunctionDeclaration(node)) { // Check if the function is declared, if not declare it and skip function execution
            let args = [] as Node[];

            if ((node.children && node.children.length >= 1) || this.checkNextNode.type == 'arguments') { // Check if the function has arguments
                if (node.children![1] && node.children![1].type == 'arguments') {
                    args = node.children![1].children!; // Getting the arguments from node children
                }
                else if (this.checkNextNode.type == 'arguments') {
                    args = (this.next() as Node).children!; // Getting the arguments from next node
                }
                else throw new Error(`Function ${node.value} requires arguments.`); // Throw an error if the function does not have arguments
            }


            if (args.some((arg: Node) => arg.type == 'identifier' || arg.type == 'arguments')) { // Check if the arguments are functions with arguments

                let newArgs = [];
                for (let i = 0; i <= args.length; i++) {

                    if (args[i] && args[i].type == 'identifier' && args[i + 1] && args[i + 1].type == 'arguments') {
                        let arg = args[i]
                        arg.children?.push(args[++i]); // Adding the arguments to the function children
                        newArgs.push(arg)
                        i++;
                    }
                }

                return newArgs.forEach((arg: Node) => this.identifier(arg)); // Identifying the arguments
            }

            args = this.parseArguments(args as Node[]); // Parsing the arguments

            // console.log(`{args: ${JSON.stringify(args)}}`)

            return this.callFunction(node.value, args); // Calling the function and returning output

        }
    }

    /**
     * @name callFunction
     * @description Call a function
     * @param {string} functionName The function name
     * @param {Node[]} args The arguments
     * @returns {*} The output of the function         
     */
    private callFunction(functionName: string, args: Node[]): any {

        const fun = FUNCTIONS.getFunction(functionName); // Getting the function
        const isProcessFunction = typeof fun.run !== 'function'; // Check if the function is a process function

        const output = !isProcessFunction ? (fun as any).run(args.map((arg: Node) => arg.value)) : this.callEvaluator(fun.run as Node[]);

        this.addOutput = `Function "${functionName}" called with arguments: ${JSON.stringify(args)}`;
        this.addOutput = `${functionName} output: ${JSON.stringify(output)}\n`;
        return output;

    }

    private callEvaluator(tree: Node[]): string {
        const output = new Evaluator(tree).output;
        this.addOutput = `Calling new evaluator with tree: ${JSON.stringify(tree)}\nOutput: ${output}`;
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
        // const lastNode = this.tree[this.index - 1] || { type: 'undefined' };
        const nextNode = this.checkNextNode;

        // console.log(this.current, lastNode, nextNode, 1)
        if (currentNode && currentNode.type == 'identifier') {
            // console.log(2)
            if (nextNode.type == 'assign' && nextNode.children![0].value == currentNode.value) this.current = this.next() as Node;
        } else this.current = this.next() as Node;

    }

}