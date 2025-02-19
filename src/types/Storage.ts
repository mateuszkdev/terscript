import { Token } from 'types/Parser';

export type StorageVariableCell = {
    name: string;
    value: Token;
}

export type StorageType = Map<string, StorageVariableCell>;