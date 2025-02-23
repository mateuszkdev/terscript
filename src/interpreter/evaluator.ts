import { Token, Node } from '../types/Parser';
import { STORAGE } from '../index';

export default class Evaluator {

    /* VARIABLES */
    private tree: Node[] = [];
    private current: Node = { type: 'undefined', value: '', children: [] };
    private index: number = -1;

    public output: string = '';

    constructor(tree: Node[]) {

        this.tree = tree;

    }

    private next(): Node | boolean {
        
        if (this.index + 1 >= this.tree.length) return false;
        return this.tree[++this.index];

    }

    private evaluate(): void {

        this.current = this.next() as Node;

        // @TODO Implement the evaluation logic

    }

}