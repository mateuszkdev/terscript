import { Node } from '../types/Parser';
import { STORAGE, FUNCTIONS, isDebug, debugFile } from '../index';
import { FunctionDeclaration } from 'types/Functions';
import { StringStructure } from './evaluator/string';

import load from '../modules/loader';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { VariableStructure } from './evaluator/variables';
import { BooleanStructure } from './evaluator/boolean';
import { FunctionStructure } from './evaluator/function';

const test = (x: any) => false && console.log(x);

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
        if (typeof this.tree[this.index + 1] == 'boolean') { this.power = false; return false; }; // Check if the program should stop
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

        if (typeof this.current == 'undefined' || typeof this.current == 'boolean') return this.power = false; // Check if the program should stop

        this.debug(this.current, `evaluate call`)

        switch (this.current.type) {

            case 'condition': return this.itsCondition(this.current); // Evaluating a statement
            case 'assign': return this.assign(this.current.children![0].value, this.current.children![1] as Node); // Assigning a variable
            case 'identifier': return this.identifier(this.current); // Identifying rest of the nodes
            case 'math': return this.itsMath(this.current); // Evaluating math
            case 'number': return this.evaluate(); // Returning a number
            case 'string': return this.itsString(this.current); // Returning a string
            case 'objectCall': return this.objectCall(this.current) // Calling an object

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

        this.debug(node, `identifier call`);

        if (node.type === 'identifier' && node.value === 'import') return this.itsImport(node);

        if (node.type === 'assign') return this.assign(node.children![0].value, node.children![1] as Node); // Assigning a variable
        else if (node.type === 'statement') return this.itsCondition(node); // Evaluating a statement
        else if (STORAGE.memory.has(node.value)) return this.itsVariable(node); // Returning a variable
        else if (node.type === 'math') return this.itsMath(node) // Evaluating math
        else if (node.type === 'arguments') return node; // Returning arguments
        else if (node.type === 'string') return this.itsString(node); // Returning a string
        else if (node.type === 'number') return node; // Returning a number
        else if (this.checkFunctionDeclarationNodes(node)) return this.itsFunction(node); // Checking if the node is a function declaration
        else if (FUNCTIONS.isFunction(node.value)) return this.itsFunction(node); // Checking if the node is a function  
        else if (node.type === 'boolean') return node; // Returning a boolean
        else if (node.type === 'object') return this.itsObject(node); // Returning an object
        else if (node.type === 'objectCall') return this.objectCall(node); // Calling an object
        else this.itsVariable(node); // Returning a variable

    }

    /**
     * @name objectCall
     * @description Call an object by key and get value
     * @param {Node} node The node to call 
     * @returns {Node} The object value
     */
    private objectCall(node: Node): Node {

        if (!STORAGE.memory.has(node.children![0].value)) throw new Error(`Object ${node.children![0].value} does not exist`);
        const object = JSON.parse(JSON.stringify(STORAGE.getVariable(node.children![0].value).children))[0];

        const key = node.children![1].value;

        if (!object[key]) throw new Error(`Object ${node.children![0].value} does not have key ${key}`);

        const value = object[key];

        return { type: value.type, value: value.value, children: value.children };

    }

    /**
     * @name itsObject
     * @description Return an object
     * @param {Node} node The node to return 
     * @returns {Node} The object
     */
    private itsObject(node: Node): Node {
        return node;
    }

    /**
     * @name itsCondition
     * @description Evaluate a condition
     * @param {Node} node The node to check 
     * @returns {*}
     */
    private itsCondition(node: Node): void {
        
        this.debug(node, 'itsCondition call');

        if (node.value === 'if') return this.ifCondition(node);
        if (node.value === 'for') return this.forLoop(node);
        
    }

    private forLoop(node: Node): void {

        if (this.checkNextNode.type !== 'arguments') throw new Error('for requires arguments');
        const args = this.next() as Node;

        if (this.tree[this.index + 1].type !== 'braces') throw new Error('for requires braces');
        const braces = this.next() as Node;

        let variableName = 'i';
        let max: number;
        let step: number;

        if (args.children?.length == 1) { // for (max)

            step = 0;
            max = parseInt(args.children[0].value);

            // adding variables to storage for the loop to use
            STORAGE.setVariable = { name: variableName, value: { type: 'number', value: `${step}`, children: [] } };

            for (step; step < max; step++) {
                STORAGE.setVariable = { name: variableName, value: { type: 'number', value: `${step}`, children: [] } };
                new Evaluator(braces.children!);
            }

            // removing the variable from storage
            STORAGE.memory.delete(variableName);
            
        }


    }

    /**
     * @name ifCondition
     * @description Evaluate an if condition
     * @param {Node} node If condidion node
     * @returns {*} 
     */
    private ifCondition(node: Node): void {

        this.debug(node, 'ifCondition call');

        if (this.checkNextNode.type !== 'arguments') throw new Error('if requires arguments');

        let args = (this.next() as Node).children!;
        
        if (!args.find((arg: Node) => arg.type == 'objectCall') && args.length !== 1) throw new Error('if requires one argument');
        if (args.find((arg: Node) => arg.type == 'objectCall') && args.length !== 2) throw new Error('if requires one argument');

        if (args.find((arg: Node) => arg.type == 'objectCall')) args = [this.objectCall(args[1])];

        const condition = this.checkBoolean(args[0]);

        if (this.tree[this.index + 1].type !== 'braces') throw new Error('if requires braces');
        const braces = (this.next() as Node).children!;
 
        if (condition.value) { // true condition

            const ifOutput = new Evaluator(braces).output;
            this.addOutput = `If condition "${condition.value}" is true. Executing braces:\n${ifOutput}`;

        } else { // false condition

            if (this.checkNextNode.value === 'else') { // else condition
                
                this.next() // skip else

                if (this.tree[this.index + 1].type !== 'braces') throw new Error('else requires braces');
                const elseBraces = (this.next() as Node).children!;

                const elseOutput = new Evaluator(elseBraces).output;
                this.addOutput = `If condition "${condition.value}" is false. Executing else braces:\n${elseOutput}`;

            } 

        } // end of if, notink was true

    }

    /**
     * @name checkBolean
     * @description Check the node value boolean
     * @param {Node} condition Node to check boolean of it
     * @returns {Node} The node with boolean value
     */
    private checkBoolean(condition: Node): Node { return BooleanStructure.evalBoolean(condition); }

    /**
     * @name itsImport
     * @description Import another file
     * @param {Node} node
     */
    private itsImport(node: Node): void {

        this.debug(node, 'itsImport call');

        if (this.checkNextNode.type !== 'string') throw new Error('import requires string path');

        const path = ((this.next() as Node).value).replace(/\s+/gmi, '');

        const code = load(path);
        const lexer = new Lexer(code);
        const parser = new Parser(lexer.tokens);
        const evaluator = new Evaluator(parser.tree);

    }

    /**
     * @name itsString
     * @description Evaluate a string
     * @param {Node} node The string node
     * @returns {Node}
     */
    private itsString(node: Node): Node {
        
        this.debug(node, `itsString call`);

        if (this.checkStringConstants(node)) return StringStructure.replaceVariables(node.value);
        return node;

    }

    /**
     * @name isMath
     * @description Evaluate math
     * @param {Node} node The math node 
     * @return {Node}
     */
    private itsMath(node: Node): Node {

        this.debug(node, `itsMath call`);

        let value = '';

        node.children?.forEach((child: Node) => {
            if (VariableStructure.hasVariable(child.value)) value += VariableStructure.getVariable(child.value).value;
            else value += child.value;
        });

        const output = eval(value);

        this.addOutput = `Math expression "${value}" evaluated to: ${output}`;
        if (typeof output === 'boolean') return { type: 'boolean', value: `${output}`, children: [] };
        else return { type: 'number', value: `${output}`, children: [] };

    }

    /**
     * @name checkStringConstants
     * @description Check if the string has constants
     * @param {Node} node The node to check
     * @returns {boolean} If the string has constants
     */
    private checkStringConstants(node: Node): boolean { return StringStructure.checkStringVariables(node.value); }

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
            
            if (!this.checkNextNode || !this.tree[this.index + 2]) { return false; };

            if (this.checkNextNode.type == 'arguments' && this.tree[this.index + 2].type == 'braces') { return true; };

            if (node.children?.some((child: Node) => child.type == 'arguments') && this.checkNextNode.type == 'braces') { return true; };
        }

        return false;

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

        this.debug(node, `itsFunction call`);

        if (this.checkFunctionDeclaration(node)) { // Check if the function is declared, if not declare it and skip function execution

            const args = this.parseArguments(this.getFunctionArguments(node) as Node[]); // Parsing the arguments

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

        const output = FunctionStructure.callFunction(functionName, args); // Call the function

        this.addOutput = `Function "${functionName}" called with arguments: ${JSON.stringify(args)}`;
        this.addOutput = `${functionName} output: ${JSON.stringify(output)}\n`;
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

        const variable = VariableStructure.getVariable(node.value); // Get the variable
        this.addOutput = `Variable "${node.value}" called. Value: ${variable}\n`;
        return variable;

    }

    /**
     * @name getFunctionArguments
     * @description Get the function arguments
     * @param {Node} node The node to get arguments 
     * @returns {Node[]} The function arguments
     * @throws {Error} If the function does not have arguments
     */
    private getFunctionArguments(node: Node): Node[] | void {

        let args: Node[] = [];

        if ((node.children && node.children.length >= 1) || this.checkNextNode.type == 'arguments') { // Check if the function has arguments

            if (node.children![1] && node.children![1].type == 'arguments') {
                args = node.children![1].children!; // Getting the arguments from node children
            }
            else if (this.checkNextNode.type == 'arguments') {

                args = (this.next() as Node).children!; // Getting the arguments from next node
                return args;

            }
            else throw new Error(`Function ${node.value} requires arguments.`); // Throw an error if the function does not have arguments
        }
        else if (args.some((arg: Node) => arg.type == 'identifier' || arg.type == 'arguments')) { // Check if the arguments are functions with arguments

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

    }

    /**
     * @name assign
     * @description Assign a variable
     * @returns {void}
     * @throws {Error} If the function does not have arguments
     */
    private assign(name: string, value: Node): Node { // @TODO Fix this method, sometimes skipping nodes and not assigning variables

        if (FUNCTIONS.isFunction(value.value)) { // Check if the value is a function

            const nextNode = this.next() as Node;
            if (nextNode.type == 'arguments') { // Check if the function has arguments

                value = this.callFunction(value.value, nextNode.children!) // Call the function

            } else throw new Error(`Function ${value.value} requires arguments.`); // Throw an error if the function does not have arguments

        }

        value = this.identifier(value) as Node; // Identifying the value

        this.debug({ name, value }, `assign call`);

        STORAGE.setVariable = { name, value };
        this.addOutput = `Variable "${name}" set to ${JSON.stringify(value)}\n`;
        return value;
    }

    /**
     * @name checkNextNode
     * @description The checkNextNode method is responsible for checking the next Node.
     * @returns {Node} The next Node.
     * @getter
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
     * @name getSplitedNodes
     * @description Get the splited nodes
     * @returns {Node[]} The splited nodes
     * @getter
     */
    private get getSplitedNodes(): Node[] { return this.tree.slice(this.index + 1); };

    /**
     * @name fixIndex
     * @description Fix the index
     * @param {Number} num The number to fix the index 
     * @setter
     */
    private set fixIndex(num: number) { this.index += num; }

    /**
     * @name skipNode
     * @description Skip a node
     * @returns 
     */
    private skipNode(): void {

        this.debug(this.current, `skipNode call`);

        if (this.current && this.current.type == 'identifier') {
            if (this.checkNextNode.type == 'assign' && this.checkNextNode.children![0].value == this.current.value) this.current = this.next() as Node;
        }

        if (this.current && !this.current.type) this.next();

    }

}