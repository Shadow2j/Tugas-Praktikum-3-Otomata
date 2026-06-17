/**
 * PDA Engine - Core Pushdown Automaton Logic
 * Handles PDA definition, validation, and string processing
 */

class PDAEngine {
    constructor() {
        this.states = [];
        this.inputAlphabet = [];
        this.stackAlphabet = [];
        this.transitions = [];
        this.startState = '';
        this.startStackSymbol = '';
        this.acceptStates = [];
        this.acceptMode = 'final-state'; // 'final-state', 'empty-stack', 'both'
    }

    /**
     * Configure the PDA with given parameters
     */
    configure(config) {
        this.states = config.states || [];
        this.inputAlphabet = config.inputAlphabet || [];
        this.stackAlphabet = config.stackAlphabet || [];
        this.transitions = config.transitions || [];
        this.startState = config.startState || '';
        this.startStackSymbol = config.startStackSymbol || '';
        this.acceptStates = config.acceptStates || [];
        this.acceptMode = config.acceptMode || 'final-state';
    }

    /**
     * Validate the PDA definition
     * Returns { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (this.states.length === 0) {
            errors.push('States (Q) tidak boleh kosong');
        }

        if (this.inputAlphabet.length === 0) {
            errors.push('Input Alphabet (Σ) tidak boleh kosong');
        }

        if (this.stackAlphabet.length === 0) {
            errors.push('Stack Alphabet (Γ) tidak boleh kosong');
        }

        if (!this.startState) {
            errors.push('Start State (q₀) harus ditentukan');
        } else if (!this.states.includes(this.startState)) {
            errors.push(`Start State "${this.startState}" tidak ada dalam himpunan states`);
        }

        if (!this.startStackSymbol) {
            errors.push('Start Stack Symbol (Z₀) harus ditentukan');
        } else if (!this.stackAlphabet.includes(this.startStackSymbol)) {
            errors.push(`Start Stack Symbol "${this.startStackSymbol}" tidak ada dalam stack alphabet`);
        }

        if (this.acceptMode === 'final-state' || this.acceptMode === 'both') {
            if (this.acceptStates.length === 0) {
                errors.push('Accept States (F) harus ditentukan untuk mode Final State');
            }
        }

        for (const state of this.acceptStates) {
            if (!this.states.includes(state)) {
                errors.push(`Accept state "${state}" tidak ada dalam himpunan states`);
            }
        }

        if (this.transitions.length === 0) {
            errors.push('Minimal harus ada satu fungsi transisi');
        }

        // Validate each transition
        for (let i = 0; i < this.transitions.length; i++) {
            const t = this.transitions[i];
            const prefix = `Transisi #${i + 1}`;

            if (!t.currentState || !this.states.includes(t.currentState)) {
                errors.push(`${prefix}: State "${t.currentState}" tidak valid`);
            }

            if (t.inputSymbol !== 'ε' && t.inputSymbol !== '' && !this.inputAlphabet.includes(t.inputSymbol)) {
                errors.push(`${prefix}: Input symbol "${t.inputSymbol}" tidak ada dalam alfabet input`);
            }

            if (!t.stackTop || !this.stackAlphabet.includes(t.stackTop)) {
                errors.push(`${prefix}: Stack top "${t.stackTop}" tidak ada dalam stack alphabet`);
            }

            if (!t.nextState || !this.states.includes(t.nextState)) {
                errors.push(`${prefix}: Next state "${t.nextState}" tidak valid`);
            }

            // Validate push symbols
            if (t.pushSymbols !== 'ε' && t.pushSymbols !== '') {
                const symbols = t.pushSymbols.split('');
                // For multi-character stack symbols, we need a different approach
                // Let's validate the push string
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Parse push symbols string into array
     * e.g., "AZ" -> ["A", "Z"], "ε" -> []
     */
    parsePushSymbols(pushStr) {
        if (!pushStr || pushStr === 'ε' || pushStr === '') {
            return [];
        }

        // Try to match against known stack alphabet symbols (longest first)
        const symbols = [];
        const sortedAlphabet = [...this.stackAlphabet].sort((a, b) => b.length - a.length);
        let remaining = pushStr;

        while (remaining.length > 0) {
            let matched = false;
            for (const sym of sortedAlphabet) {
                if (remaining.startsWith(sym)) {
                    symbols.push(sym);
                    remaining = remaining.substring(sym.length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // Single character fallback
                symbols.push(remaining[0]);
                remaining = remaining.substring(1);
            }
        }

        return symbols;
    }

    /**
     * Run the PDA on an input string
     * Returns { accepted: boolean, trace: TraceStep[], reason: string }
     * Uses BFS/DFS to handle nondeterminism
     */
    run(inputString) {
        const input = inputString.split('');
        const maxSteps = 1000; // Prevent infinite loops

        // Configuration: (state, remaining input index, stack)
        // Use BFS to explore all possible paths
        const initialConfig = {
            state: this.startState,
            inputIdx: 0,
            stack: [this.startStackSymbol],
            trace: [{
                step: 0,
                state: this.startState,
                inputRead: '-',
                remaining: inputString || 'ε',
                stackTop: this.startStackSymbol,
                pushSymbols: '-',
                stack: [this.startStackSymbol],
                description: 'Konfigurasi awal'
            }]
        };

        const queue = [initialConfig];
        let totalSteps = 0;
        let bestRejectedTrace = initialConfig.trace;

        while (queue.length > 0 && totalSteps < maxSteps) {
            const config = queue.shift();
            totalSteps++;

            const { state, inputIdx, stack, trace } = config;
            const inputFinished = inputIdx >= input.length;

            // Check acceptance
            if (inputFinished) {
                const inAcceptState = this.acceptStates.includes(state);
                const stackEmpty = stack.length === 0;

                let accepted = false;
                if (this.acceptMode === 'final-state' && inAcceptState) accepted = true;
                if (this.acceptMode === 'empty-stack' && stackEmpty) accepted = true;
                if (this.acceptMode === 'both' && (inAcceptState || stackEmpty)) accepted = true;

                if (accepted) {
                    return {
                        accepted: true,
                        trace: trace,
                        reason: inAcceptState && stackEmpty
                            ? `Diterima (Final State: ${state}, Stack kosong)`
                            : inAcceptState
                                ? `Diterima (Final State: ${state})`
                                : `Diterima (Stack kosong)`,
                        steps: trace.length - 1
                    };
                }

                // Keep the longest rejected trace
                if (trace.length > bestRejectedTrace.length) {
                    bestRejectedTrace = trace;
                }
            }

            if (stack.length === 0) {
                // Can't proceed without stack (unless we already checked acceptance)
                continue;
            }

            const stackTop = stack[stack.length - 1];

            // Find applicable transitions
            const applicableTransitions = this.transitions.filter(t => {
                if (t.currentState !== state) return false;
                if (t.stackTop !== stackTop) return false;

                const inputSym = t.inputSymbol === 'ε' || t.inputSymbol === '' ? null : t.inputSymbol;

                if (inputSym) {
                    // Needs to read an input symbol
                    if (inputFinished) return false;
                    if (input[inputIdx] !== inputSym) return false;
                }

                return true;
            });

            for (const t of applicableTransitions) {
                const isEpsilon = t.inputSymbol === 'ε' || t.inputSymbol === '';
                const newInputIdx = isEpsilon ? inputIdx : inputIdx + 1;

                // New stack: pop top, then push new symbols
                const newStack = [...stack];
                newStack.pop(); // Pop the top

                const pushSymbols = this.parsePushSymbols(t.pushSymbols);

                // Push in reverse order so first symbol ends up on top
                for (let i = pushSymbols.length - 1; i >= 0; i--) {
                    newStack.push(pushSymbols[i]);
                }

                const remainingInput = input.slice(newInputIdx).join('') || 'ε';
                const readSymbol = isEpsilon ? 'ε' : input[inputIdx];

                const newTrace = [...trace, {
                    step: trace.length,
                    state: t.nextState,
                    inputRead: readSymbol,
                    remaining: remainingInput,
                    stackTop: t.stackTop,
                    pushSymbols: t.pushSymbols || 'ε',
                    stack: [...newStack],
                    description: `δ(${t.currentState}, ${readSymbol}, ${t.stackTop}) = (${t.nextState}, ${t.pushSymbols || 'ε'})`
                }];

                queue.push({
                    state: t.nextState,
                    inputIdx: newInputIdx,
                    stack: newStack,
                    trace: newTrace
                });
            }
        }

        // No accepting path found
        let reason = 'Ditolak: ';
        if (totalSteps >= maxSteps) {
            reason += 'Batas langkah maksimum tercapai (kemungkinan loop)';
        } else {
            reason += 'Tidak ada jalur yang menghasilkan penerimaan string';
        }

        return {
            accepted: false,
            trace: bestRejectedTrace,
            reason: reason,
            steps: bestRejectedTrace.length - 1
        };
    }

    /**
     * Get formal definition string
     */
    getFormalDefinition() {
        return {
            Q: `{ ${this.states.join(', ')} }`,
            sigma: `{ ${this.inputAlphabet.join(', ')} }`,
            gamma: `{ ${this.stackAlphabet.join(', ')} }`,
            q0: this.startState,
            Z0: this.startStackSymbol,
            F: `{ ${this.acceptStates.join(', ')} }`,
            transitions: this.transitions.map(t =>
                `δ(${t.currentState}, ${t.inputSymbol || 'ε'}, ${t.stackTop}) = (${t.nextState}, ${t.pushSymbols || 'ε'})`
            )
        };
    }
}

// Export for use in app.js
window.PDAEngine = PDAEngine;
