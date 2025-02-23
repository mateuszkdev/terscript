export type Token = {
    type: string;
    value: string;
    line: number;
    index: number;
}

export type Node = {
    type: string;
    value: string;
    children: Node[];
}