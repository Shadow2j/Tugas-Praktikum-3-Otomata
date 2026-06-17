/**
 * PDA Simulator - Application Controller
 * Handles UI interactions, state management, and PDA execution
 */

(function () {
    'use strict';

    // ============================================
    // DOM References
    // ============================================
    const dom = {
        // Inputs
        inputStates: document.getElementById('input-states'),
        inputAlphabet: document.getElementById('input-alphabet'),
        inputStackAlphabet: document.getElementById('input-stack-alphabet'),
        inputStartState: document.getElementById('input-start-state'),
        inputStartStack: document.getElementById('input-start-stack'),
        acceptStatesGroup: document.getElementById('accept-states-group'),
        inputTestString: document.getElementById('input-test-string'),
        inputBatch: document.getElementById('input-batch'),
        chkEpsilonInput: document.getElementById('chk-epsilon-input'),
        chkStepMode: document.getElementById('chk-step-mode'),

        // Buttons
        btnAddTransition: document.getElementById('btn-add-transition'),
        btnRunTest: document.getElementById('btn-run-test'),
        btnRunBatch: document.getElementById('btn-run-batch'),
        btnHelp: document.getElementById('btn-help'),
        btnResetAll: document.getElementById('btn-reset-all'),
        btnLoadExample: document.getElementById('btn-load-example'),
        btnCloseHelp: document.getElementById('btn-close-help'),
        btnCloseExample: document.getElementById('btn-close-example'),
        btnTracePrev: document.getElementById('btn-trace-prev'),
        btnTraceNext: document.getElementById('btn-trace-next'),
        btnTracePlay: document.getElementById('btn-trace-play'),

        // Display sections
        transitionsList: document.getElementById('transitions-list'),
        transitionEmpty: document.getElementById('transition-empty'),
        resultSection: document.getElementById('result-section'),
        resultCard: document.getElementById('result-card'),
        resultIcon: document.getElementById('result-icon'),
        resultLabel: document.getElementById('result-label'),
        resultString: document.getElementById('result-string'),
        traceSection: document.getElementById('trace-section'),
        traceTableBody: document.getElementById('trace-table-body'),
        traceCounter: document.getElementById('trace-counter'),
        configState: document.getElementById('config-state'),
        configRemaining: document.getElementById('config-remaining'),
        configStack: document.getElementById('config-stack'),
        stackVisual: document.getElementById('stack-visual'),
        batchResults: document.getElementById('batch-results'),
        batchTableBody: document.getElementById('batch-table-body'),
        formalDefSection: document.getElementById('formal-definition-section'),
        formalDefBox: document.getElementById('formal-def-box'),

        // Modals
        modalHelp: document.getElementById('modal-help'),
        modalExample: document.getElementById('modal-example'),
        exampleGrid: document.getElementById('example-grid'),
    };

    // ============================================
    // State
    // ============================================
    let transitionCount = 0;
    let currentTrace = [];
    let currentTraceStep = 0;
    let autoPlayInterval = null;
    const pda = new PDAEngine();

    // ============================================
    // Example PDA Definitions
    // ============================================
    const EXAMPLES = [
        {
            name: 'L = { aⁿbⁿ | n ≥ 1 }',
            description: 'Bahasa dengan jumlah a dan b yang sama, a di depan b',
            language: 'Contoh: aabb, aaabbb',
            config: {
                states: 'q0, q1, q2',
                inputAlphabet: 'a, b',
                stackAlphabet: 'A, Z',
                startState: 'q0',
                startStack: 'Z',
                acceptStates: ['q2'],
                acceptMode: 'final-state',
                transitions: [
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'Z', nextState: 'q0', pushSymbols: 'AZ' },
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'A', nextState: 'q0', pushSymbols: 'AA' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'b', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q2', pushSymbols: 'ε' },
                ]
            }
        },
        {
            name: 'L = { ww^R | w ∈ {a,b}* }',
            description: 'Bahasa palindrom genap atas alfabet {a, b}',
            language: 'Contoh: abba, aabbaa, baab',
            config: {
                states: 'q0, q1, q2',
                inputAlphabet: 'a, b',
                stackAlphabet: 'A, B, Z',
                startState: 'q0',
                startStack: 'Z',
                acceptStates: ['q2'],
                acceptMode: 'final-state',
                transitions: [
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'Z', nextState: 'q0', pushSymbols: 'AZ' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'Z', nextState: 'q0', pushSymbols: 'BZ' },
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'A', nextState: 'q0', pushSymbols: 'AA' },
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'B', nextState: 'q0', pushSymbols: 'AB' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'A', nextState: 'q0', pushSymbols: 'BA' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'B', nextState: 'q0', pushSymbols: 'BB' },
                    { currentState: 'q0', inputSymbol: 'ε', stackTop: 'A', nextState: 'q1', pushSymbols: 'A' },
                    { currentState: 'q0', inputSymbol: 'ε', stackTop: 'B', nextState: 'q1', pushSymbols: 'B' },
                    { currentState: 'q0', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q1', pushSymbols: 'Z' },
                    { currentState: 'q1', inputSymbol: 'a', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'b', stackTop: 'B', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q2', pushSymbols: 'ε' },
                ]
            }
        },
        {
            name: 'L = { aⁿb²ⁿ | n ≥ 1 }',
            description: 'Jumlah b dua kali jumlah a',
            language: 'Contoh: abb, aabbbb, aaabbbbbb',
            config: {
                states: 'q0, q1, q2',
                inputAlphabet: 'a, b',
                stackAlphabet: 'A, Z',
                startState: 'q0',
                startStack: 'Z',
                acceptStates: ['q2'],
                acceptMode: 'final-state',
                transitions: [
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'Z', nextState: 'q0', pushSymbols: 'AAZ' },
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'A', nextState: 'q0', pushSymbols: 'AAA' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'b', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q2', pushSymbols: 'ε' },
                ]
            }
        },
        {
            name: 'Balanced Parentheses',
            description: 'Bahasa tanda kurung seimbang',
            language: 'Contoh: (), (()), (()())',
            config: {
                states: 'q0, q1',
                inputAlphabet: '(, )',
                stackAlphabet: 'X, Z',
                startState: 'q0',
                startStack: 'Z',
                acceptStates: ['q1'],
                acceptMode: 'final-state',
                transitions: [
                    { currentState: 'q0', inputSymbol: '(', stackTop: 'Z', nextState: 'q0', pushSymbols: 'XZ' },
                    { currentState: 'q0', inputSymbol: '(', stackTop: 'X', nextState: 'q0', pushSymbols: 'XX' },
                    { currentState: 'q0', inputSymbol: ')', stackTop: 'X', nextState: 'q0', pushSymbols: 'ε' },
                    { currentState: 'q0', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q1', pushSymbols: 'ε' },
                ]
            }
        },
        {
            name: 'L = { aⁱbʲcᵏ | i=j or j=k }',
            description: 'Jumlah a sama dengan b, ATAU jumlah b sama dengan c',
            language: 'Contoh: abc, aabbc, abbcc',
            config: {
                states: 'q0, q1, q2, q3, q4, q5, q6',
                inputAlphabet: 'a, b, c',
                stackAlphabet: 'A, B, Z',
                startState: 'q0',
                startStack: 'Z',
                acceptStates: ['q3', 'q6'],
                acceptMode: 'final-state',
                transitions: [
                    // Branch 1: i = j (nondeterministic choice)
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'Z', nextState: 'q0', pushSymbols: 'AZ' },
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'A', nextState: 'q0', pushSymbols: 'AA' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'b', stackTop: 'A', nextState: 'q1', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'c', stackTop: 'Z', nextState: 'q2', pushSymbols: 'Z' },
                    { currentState: 'q2', inputSymbol: 'c', stackTop: 'Z', nextState: 'q2', pushSymbols: 'Z' },
                    { currentState: 'q2', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q3', pushSymbols: 'ε' },
                    { currentState: 'q1', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q3', pushSymbols: 'ε' },
                    // Branch 2: j = k (nondeterministic choice)
                    { currentState: 'q0', inputSymbol: 'a', stackTop: 'Z', nextState: 'q4', pushSymbols: 'Z' },
                    { currentState: 'q4', inputSymbol: 'a', stackTop: 'Z', nextState: 'q4', pushSymbols: 'Z' },
                    { currentState: 'q0', inputSymbol: 'b', stackTop: 'Z', nextState: 'q5', pushSymbols: 'BZ' },
                    { currentState: 'q4', inputSymbol: 'b', stackTop: 'Z', nextState: 'q5', pushSymbols: 'BZ' },
                    { currentState: 'q5', inputSymbol: 'b', stackTop: 'B', nextState: 'q5', pushSymbols: 'BB' },
                    { currentState: 'q5', inputSymbol: 'c', stackTop: 'B', nextState: 'q6', pushSymbols: 'ε' },
                    { currentState: 'q6', inputSymbol: 'c', stackTop: 'B', nextState: 'q6', pushSymbols: 'ε' },
                    { currentState: 'q5', inputSymbol: 'ε', stackTop: 'Z', nextState: 'q6', pushSymbols: 'ε' },
                ]
            }
        }
    ];

    // ============================================
    // Utility Functions
    // ============================================

    /**
     * Parse comma-separated input into array of trimmed strings
     */
    function parseCSV(str) {
        return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    /**
     * Show a toast notification
     */
    function showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }

    /**
     * Escape HTML special characters
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Dynamic Select / Checkbox Updates
    // ============================================

    /**
     * Update dropdowns and checkboxes based on current states
     */
    function updateStatesDependents() {
        const states = parseCSV(dom.inputStates.value);

        // Update start state select
        const currentStartState = dom.inputStartState.value;
        dom.inputStartState.innerHTML = '<option value="">-- Pilih --</option>';
        states.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            if (s === currentStartState) opt.selected = true;
            dom.inputStartState.appendChild(opt);
        });

        // Update accept states checkboxes
        const currentAcceptStates = getSelectedAcceptStates();
        dom.acceptStatesGroup.innerHTML = '';

        if (states.length === 0) {
            dom.acceptStatesGroup.innerHTML = '<p class="placeholder-text">Definisikan states terlebih dahulu</p>';
        } else {
            states.forEach(s => {
                const label = document.createElement('label');
                label.className = 'checkbox-option';
                label.innerHTML = `
                    <input type="checkbox" value="${escapeHtml(s)}" ${currentAcceptStates.includes(s) ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    <span>${escapeHtml(s)}</span>
                `;
                dom.acceptStatesGroup.appendChild(label);
            });
        }

        // Update transition row dropdowns
        updateTransitionDropdowns();
    }

    /**
     * Update stack alphabet dropdown
     */
    function updateStackDependents() {
        const stackAlpha = parseCSV(dom.inputStackAlphabet.value);

        const currentStartStack = dom.inputStartStack.value;
        dom.inputStartStack.innerHTML = '<option value="">-- Pilih --</option>';
        stackAlpha.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            if (s === currentStartStack) opt.selected = true;
            dom.inputStartStack.appendChild(opt);
        });

        updateTransitionDropdowns();
    }

    /**
     * Get selected accept states
     */
    function getSelectedAcceptStates() {
        const checkboxes = dom.acceptStatesGroup.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Update dropdowns in transition rows
     */
    function updateTransitionDropdowns() {
        const states = parseCSV(dom.inputStates.value);
        const inputAlpha = parseCSV(dom.inputAlphabet.value);
        const stackAlpha = parseCSV(dom.inputStackAlphabet.value);

        const rows = dom.transitionsList.querySelectorAll('.transition-row');
        rows.forEach(row => {
            const selects = row.querySelectorAll('select');

            // State select (currentState)
            updateSelectOptions(selects[0], states);
            // Input select
            updateSelectOptions(selects[1], ['ε', ...inputAlpha]);
            // Stack top select
            updateSelectOptions(selects[2], stackAlpha);
            // Next state select
            updateSelectOptions(selects[3], states);
        });
    }

    /**
     * Update options in a select element while preserving value
     */
    function updateSelectOptions(select, options) {
        const currentVal = select.value;
        select.innerHTML = '';

        options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o;
            opt.textContent = o;
            if (o === currentVal) opt.selected = true;
            select.appendChild(opt);
        });

        // If previous value still exists, keep it
        if (options.includes(currentVal)) {
            select.value = currentVal;
        }
    }

    // ============================================
    // Transition Management
    // ============================================

    function addTransitionRow(preset = null) {
        transitionCount++;
        const states = parseCSV(dom.inputStates.value);
        const inputAlpha = parseCSV(dom.inputAlphabet.value);
        const stackAlpha = parseCSV(dom.inputStackAlphabet.value);

        const row = document.createElement('div');
        row.className = 'transition-row';
        row.dataset.id = transitionCount;

        const createSelect = (options, selected = '') => {
            let html = '';
            options.forEach(o => {
                html += `<option value="${escapeHtml(o)}" ${o === selected ? 'selected' : ''}>${escapeHtml(o)}</option>`;
            });
            return `<select>${html}</select>`;
        };

        const inputOptions = ['ε', ...inputAlpha];

        row.innerHTML = `
            ${createSelect(states, preset ? preset.currentState : '')}
            ${createSelect(inputOptions, preset ? preset.inputSymbol : 'ε')}
            ${createSelect(stackAlpha, preset ? preset.stackTop : '')}
            <span class="arrow">→</span>
            ${createSelect(states, preset ? preset.nextState : '')}
            <input type="text" value="${preset ? escapeHtml(preset.pushSymbols) : ''}" placeholder="ε" title="Simbol push (contoh: AZ atau ε untuk pop)">
            <button class="btn-remove-transition" title="Hapus transisi">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;

        // Remove button handler
        row.querySelector('.btn-remove-transition').addEventListener('click', () => {
            row.style.animation = 'slideIn 0.2s ease reverse';
            setTimeout(() => {
                row.remove();
                updateTransitionVisibility();
                updateFormalDefinition();
            }, 180);
        });

        dom.transitionsList.appendChild(row);
        updateTransitionVisibility();
        updateFormalDefinition();
    }

    function updateTransitionVisibility() {
        const hasTransitions = dom.transitionsList.children.length > 0;
        dom.transitionEmpty.style.display = hasTransitions ? 'none' : 'block';
    }

    function clearTransitions() {
        dom.transitionsList.innerHTML = '';
        transitionCount = 0;
        updateTransitionVisibility();
    }

    // ============================================
    // PDA Configuration Collection
    // ============================================

    function collectPDAConfig() {
        const states = parseCSV(dom.inputStates.value);
        const inputAlphabet = parseCSV(dom.inputAlphabet.value);
        const stackAlphabet = parseCSV(dom.inputStackAlphabet.value);
        const startState = dom.inputStartState.value;
        const startStackSymbol = dom.inputStartStack.value;
        const acceptStates = getSelectedAcceptStates();
        const acceptMode = document.querySelector('input[name="accept-mode"]:checked').value;

        // Collect transitions from rows
        const transitions = [];
        const rows = dom.transitionsList.querySelectorAll('.transition-row');
        rows.forEach(row => {
            const selects = row.querySelectorAll('select');
            const pushInput = row.querySelector('input[type="text"]');
            transitions.push({
                currentState: selects[0].value,
                inputSymbol: selects[1].value,
                stackTop: selects[2].value,
                nextState: selects[3].value,
                pushSymbols: pushInput.value.trim() || 'ε'
            });
        });

        return {
            states,
            inputAlphabet,
            stackAlphabet,
            startState,
            startStackSymbol,
            acceptStates,
            acceptMode,
            transitions
        };
    }

    // ============================================
    // Formal Definition Display
    // ============================================

    function updateFormalDefinition() {
        const config = collectPDAConfig();

        if (config.states.length === 0) {
            dom.formalDefSection.style.display = 'none';
            return;
        }

        pda.configure(config);
        const def = pda.getFormalDefinition();

        dom.formalDefSection.style.display = 'block';
        dom.formalDefBox.innerHTML = `
            <div class="def-line"><span class="def-symbol">M</span> = (Q, Σ, Γ, δ, q₀, Z₀, F)</div>
            <div class="def-line"><span class="def-symbol">Q</span> = <span class="def-value">${escapeHtml(def.Q)}</span></div>
            <div class="def-line"><span class="def-symbol">Σ</span> = <span class="def-value">${escapeHtml(def.sigma)}</span></div>
            <div class="def-line"><span class="def-symbol">Γ</span> = <span class="def-value">${escapeHtml(def.gamma)}</span></div>
            <div class="def-line"><span class="def-symbol">q₀</span> = <span class="def-value">${escapeHtml(def.q0 || '-')}</span></div>
            <div class="def-line"><span class="def-symbol">Z₀</span> = <span class="def-value">${escapeHtml(def.Z0 || '-')}</span></div>
            <div class="def-line"><span class="def-symbol">F</span> = <span class="def-value">${escapeHtml(def.F)}</span></div>
            ${def.transitions.length > 0 ? '<div class="def-line" style="margin-top:8px;"><span class="def-symbol">δ:</span></div>' : ''}
            ${def.transitions.map(t => `<div class="def-line" style="padding-left:16px;"><span class="def-value">${escapeHtml(t)}</span></div>`).join('')}
        `;
    }

    // ============================================
    // Test Execution
    // ============================================

    function runTest(inputString) {
        const config = collectPDAConfig();
        pda.configure(config);

        // Validate
        const validation = pda.validate();
        if (!validation.valid) {
            showToast(validation.errors[0], 'error');
            return null;
        }

        return pda.run(inputString);
    }

    function displayResult(result, inputString) {
        dom.resultSection.style.display = 'block';

        if (result.accepted) {
            dom.resultCard.className = 'result-card accepted';
            dom.resultIcon.innerHTML = '✓';
            dom.resultLabel.textContent = 'ACCEPTED';
        } else {
            dom.resultCard.className = 'result-card rejected';
            dom.resultIcon.innerHTML = '✗';
            dom.resultLabel.textContent = 'REJECTED';
        }

        dom.resultString.textContent = `"${inputString || 'ε'}" — ${result.reason}`;
    }

    function displayTrace(trace) {
        if (!dom.chkStepMode.checked) {
            dom.traceSection.style.display = 'none';
            return;
        }

        currentTrace = trace;
        currentTraceStep = 0;

        dom.traceSection.style.display = 'flex';

        // Build trace table
        dom.traceTableBody.innerHTML = '';
        trace.forEach((step, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.step = idx;

            const stackStr = step.stack.length > 0 ? [...step.stack].reverse().join('') : 'ε';

            tr.innerHTML = `
                <td>${step.step}</td>
                <td>${escapeHtml(step.state)}</td>
                <td>${escapeHtml(step.inputRead)}</td>
                <td>${escapeHtml(step.remaining)}</td>
                <td>${escapeHtml(step.stackTop || '-')}</td>
                <td>${escapeHtml(step.pushSymbols || '-')}</td>
                <td>${escapeHtml(stackStr)}</td>
            `;

            if (idx === trace.length - 1) {
                // Check if the final step is accepted or rejected based on the result
            }

            dom.traceTableBody.appendChild(tr);
        });

        // Update navigation
        updateTraceNavigation();
        showTraceStep(0);
    }

    function showTraceStep(stepIdx) {
        if (stepIdx < 0 || stepIdx >= currentTrace.length) return;

        currentTraceStep = stepIdx;
        const step = currentTrace[stepIdx];

        // Update config display
        dom.configState.textContent = step.state;
        dom.configRemaining.textContent = step.remaining;
        dom.configStack.textContent = step.stack.length > 0 ? [...step.stack].reverse().join('') : 'ε';

        // Update stack visualization
        dom.stackVisual.innerHTML = '';
        if (step.stack.length === 0) {
            dom.stackVisual.innerHTML = '<div class="stack-empty-msg">Stack kosong</div>';
        } else {
            const topLabel = document.createElement('div');
            topLabel.className = 'stack-top-label';
            topLabel.textContent = '▼ TOP';
            dom.stackVisual.appendChild(topLabel);

            // Display stack from top to bottom
            for (let i = step.stack.length - 1; i >= 0; i--) {
                const item = document.createElement('div');
                item.className = 'stack-item';
                item.textContent = step.stack[i];
                dom.stackVisual.appendChild(item);
            }
        }

        // Highlight active row in table
        const rows = dom.traceTableBody.querySelectorAll('tr');
        rows.forEach((tr, idx) => {
            tr.classList.toggle('active-step', idx === stepIdx);
        });

        // Scroll to active row
        const activeRow = dom.traceTableBody.querySelector('.active-step');
        if (activeRow) {
            activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        updateTraceNavigation();
    }

    function updateTraceNavigation() {
        dom.traceCounter.textContent = `${currentTraceStep + 1} / ${currentTrace.length}`;
        dom.btnTracePrev.disabled = currentTraceStep <= 0;
        dom.btnTraceNext.disabled = currentTraceStep >= currentTrace.length - 1;
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            dom.btnTracePlay.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }
    }

    // ============================================
    // Batch Testing
    // ============================================

    function runBatchTest() {
        const lines = dom.inputBatch.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length === 0) {
            showToast('Masukkan minimal satu string untuk diuji', 'error');
            return;
        }

        const config = collectPDAConfig();
        pda.configure(config);

        const validation = pda.validate();
        if (!validation.valid) {
            showToast(validation.errors[0], 'error');
            return;
        }

        dom.batchResults.style.display = 'block';
        dom.batchTableBody.innerHTML = '';

        lines.forEach((line, idx) => {
            const result = pda.run(line);
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${escapeHtml(line)}</td>
                <td><span class="badge ${result.accepted ? 'badge-accepted' : 'badge-rejected'}">${result.accepted ? 'Accepted' : 'Rejected'}</span></td>
                <td>${result.steps}</td>
            `;

            dom.batchTableBody.appendChild(tr);
        });

        showToast(`${lines.length} string telah diuji`, 'success');
    }

    // ============================================
    // Load Example
    // ============================================

    function loadExample(example) {
        const cfg = example.config;

        dom.inputStates.value = cfg.states;
        dom.inputAlphabet.value = cfg.inputAlphabet;
        dom.inputStackAlphabet.value = cfg.stackAlphabet;

        // Trigger updates
        updateStatesDependents();
        updateStackDependents();

        // Set start state and stack
        dom.inputStartState.value = cfg.startState;
        dom.inputStartStack.value = cfg.startStack;

        // Set accept states
        const checkboxes = dom.acceptStatesGroup.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = cfg.acceptStates.includes(cb.value);
        });

        // Set accept mode
        const modeRadio = document.querySelector(`input[name="accept-mode"][value="${cfg.acceptMode}"]`);
        if (modeRadio) modeRadio.checked = true;

        // Clear and add transitions
        clearTransitions();
        cfg.transitions.forEach(t => addTransitionRow(t));

        updateFormalDefinition();
        showToast(`Contoh "${example.name}" berhasil dimuat`, 'success');

        // Close modal
        dom.modalExample.style.display = 'none';
    }

    function populateExamples() {
        dom.exampleGrid.innerHTML = '';

        EXAMPLES.forEach((ex, idx) => {
            const card = document.createElement('div');
            card.className = 'example-card';
            card.innerHTML = `
                <h4>${escapeHtml(ex.name)}</h4>
                <p>${escapeHtml(ex.description)}</p>
                <span class="example-lang">${escapeHtml(ex.language)}</span>
            `;
            card.addEventListener('click', () => loadExample(ex));
            dom.exampleGrid.appendChild(card);
        });
    }

    // ============================================
    // Reset
    // ============================================

    function resetAll() {
        dom.inputStates.value = '';
        dom.inputAlphabet.value = '';
        dom.inputStackAlphabet.value = '';
        dom.inputStartState.innerHTML = '<option value="">-- Pilih --</option>';
        dom.inputStartStack.innerHTML = '<option value="">-- Pilih --</option>';
        dom.acceptStatesGroup.innerHTML = '<p class="placeholder-text">Definisikan states terlebih dahulu</p>';
        dom.inputTestString.value = '';
        dom.inputBatch.value = '';
        dom.chkEpsilonInput.checked = false;

        clearTransitions();

        dom.resultSection.style.display = 'none';
        dom.traceSection.style.display = 'none';
        dom.batchResults.style.display = 'none';
        dom.formalDefSection.style.display = 'none';

        stopAutoPlay();
        currentTrace = [];
        currentTraceStep = 0;

        showToast('Semua data telah direset', 'info');
    }

    // ============================================
    // Event Listeners
    // ============================================

    // State changes
    dom.inputStates.addEventListener('input', () => {
        updateStatesDependents();
        updateFormalDefinition();
    });

    dom.inputAlphabet.addEventListener('input', () => {
        updateTransitionDropdowns();
        updateFormalDefinition();
    });

    dom.inputStackAlphabet.addEventListener('input', () => {
        updateStackDependents();
        updateTransitionDropdowns();
        updateFormalDefinition();
    });

    dom.inputStartState.addEventListener('change', updateFormalDefinition);
    dom.inputStartStack.addEventListener('change', updateFormalDefinition);

    // Accept states and mode
    dom.acceptStatesGroup.addEventListener('change', updateFormalDefinition);
    document.querySelectorAll('input[name="accept-mode"]').forEach(r => {
        r.addEventListener('change', updateFormalDefinition);
    });

    // Add transition
    dom.btnAddTransition.addEventListener('click', () => {
        const states = parseCSV(dom.inputStates.value);
        const inputAlpha = parseCSV(dom.inputAlphabet.value);
        const stackAlpha = parseCSV(dom.inputStackAlphabet.value);

        if (states.length === 0 || inputAlpha.length === 0 || stackAlpha.length === 0) {
            showToast('Definisikan states, input alphabet, dan stack alphabet terlebih dahulu', 'error');
            return;
        }

        addTransitionRow();
    });

    // Run test
    dom.btnRunTest.addEventListener('click', () => {
        stopAutoPlay();
        let inputString = dom.inputTestString.value;

        if (dom.chkEpsilonInput.checked) {
            inputString = '';
        }

        const result = runTest(inputString);
        if (result) {
            displayResult(result, inputString);
            displayTrace(result.trace);
        }
    });

    // Enter key on test input
    dom.inputTestString.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            dom.btnRunTest.click();
        }
    });

    // Epsilon checkbox
    dom.chkEpsilonInput.addEventListener('change', () => {
        dom.inputTestString.disabled = dom.chkEpsilonInput.checked;
        if (dom.chkEpsilonInput.checked) {
            dom.inputTestString.value = '';
            dom.inputTestString.placeholder = 'String kosong (ε)';
        } else {
            dom.inputTestString.placeholder = 'Masukkan string untuk diuji...';
        }
    });

    // Trace navigation
    dom.btnTracePrev.addEventListener('click', () => {
        stopAutoPlay();
        showTraceStep(currentTraceStep - 1);
    });

    dom.btnTraceNext.addEventListener('click', () => {
        stopAutoPlay();
        showTraceStep(currentTraceStep + 1);
    });

    dom.btnTracePlay.addEventListener('click', () => {
        if (autoPlayInterval) {
            stopAutoPlay();
        } else {
            if (currentTraceStep >= currentTrace.length - 1) {
                showTraceStep(0);
            }
            dom.btnTracePlay.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            autoPlayInterval = setInterval(() => {
                if (currentTraceStep >= currentTrace.length - 1) {
                    stopAutoPlay();
                    return;
                }
                showTraceStep(currentTraceStep + 1);
            }, 800);
        }
    });

    // Batch test
    dom.btnRunBatch.addEventListener('click', runBatchTest);

    // Help modal
    dom.btnHelp.addEventListener('click', () => {
        dom.modalHelp.style.display = 'flex';
    });

    dom.btnCloseHelp.addEventListener('click', () => {
        dom.modalHelp.style.display = 'none';
    });

    dom.modalHelp.addEventListener('click', (e) => {
        if (e.target === dom.modalHelp) dom.modalHelp.style.display = 'none';
    });

    // Example modal
    dom.btnLoadExample.addEventListener('click', () => {
        dom.modalExample.style.display = 'flex';
    });

    dom.btnCloseExample.addEventListener('click', () => {
        dom.modalExample.style.display = 'none';
    });

    dom.modalExample.addEventListener('click', (e) => {
        if (e.target === dom.modalExample) dom.modalExample.style.display = 'none';
    });

    // Reset
    dom.btnResetAll.addEventListener('click', () => {
        if (confirm('Reset semua data PDA?')) {
            resetAll();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dom.modalHelp.style.display = 'none';
            dom.modalExample.style.display = 'none';
        }
    });

    // ============================================
    // Initialization
    // ============================================

    populateExamples();
    updateTransitionVisibility();

    console.log('PDA Simulator initialized successfully');
})();
