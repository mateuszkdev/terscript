import { FlagsTypes } from 'types/Flags'

/**
 * @name Flags
 * @description Parse flags from command line
 */
class Flags {

    flags: FlagsTypes = {};

    constructor() {

        process.argv
            .slice(2)
            .join(' ')
            .split('--')
            .filter(e => /\s+/.test(e))
            .map(e => e.split(' '))
            .forEach(e => this.flags[e[0]] = e[1]);

    }

}

export default new Flags().flags;