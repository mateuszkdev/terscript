export type Token = {
    type: string;
    value: string;
}

export type Node = {
    type: string;
    value: string;
    children: Node[];
}