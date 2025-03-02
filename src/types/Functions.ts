import { Node } from 'types/Parser';

export type Method = {
    name: string;
    description: string;
    usage?: string;
    run: (e?: any) => Node;
}

export type Fun = {
    name: string;
    description: string;
    usage?: string;
    methods: Method[];
}

export type FunctionDeclaration = { 
    name: string;
    args: Node[]; 
    run: Node[];
}