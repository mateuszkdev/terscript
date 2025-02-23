import { Token, Node } from 'types/Parser';

export type StorageVariableCell = {
    name: string;
    value: Token | Node;
}

export type StorageType = Map<string, StorageVariableCell>;