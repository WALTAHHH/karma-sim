/**
 * @fileoverview Simple Browser-Based Test Framework
 * No npm/node required - just open runner.html in a browser.
 * Supports describe(), it(), expect(), beforeEach(), afterEach(), and async tests.
 */

// ============ TEST STATE ============

const testState = {
    suites: [],
    currentSuite: null,
    results: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        suiteResults: []
    },
    startTime: null,
    isRunning: false
};

// ============ ASSERTION LIBRARY ============

/**
 * Create an expectation for a value
 * @param {*} actual - The value to test
 * @returns {Object} Matcher object
 */
function expect(actual) {
    return {
        /**
         * Check if actual equals expected
         * @param {*} expected - Expected value
         */
        toBe(expected) {
            if (actual !== expected) {
                throw new ExpectationError(`Expected ${format(actual)} to be ${format(expected)}`);
            }
        },

        /**
         * Deep equality check
         * @param {*} expected - Expected value
         */
        toEqual(expected) {
            if (!deepEqual(actual, expected)) {
                throw new ExpectationError(`Expected ${format(actual)} to equal ${format(expected)}`);
            }
        },

        /**
         * Check if actual is truthy
         */
        toBeTruthy() {
            if (!actual) {
                throw new ExpectationError(`Expected ${format(actual)} to be truthy`);
            }
        },

        /**
         * Check if actual is falsy
         */
        toBeFalsy() {
            if (actual) {
                throw new ExpectationError(`Expected ${format(actual)} to be falsy`);
            }
        },

        /**
         * Check if actual is null
         */
        toBeNull() {
            if (actual !== null) {
                throw new ExpectationError(`Expected ${format(actual)} to be null`);
            }
        },

        /**
         * Check if actual is undefined
         */
        toBeUndefined() {
            if (actual !== undefined) {
                throw new ExpectationError(`Expected ${format(actual)} to be undefined`);
            }
        },

        /**
         * Check if actual is defined (not undefined)
         */
        toBeDefined() {
            if (actual === undefined) {
                throw new ExpectationError(`Expected value to be defined`);
            }
        },

        /**
         * Check if actual is an instance of a class
         * @param {Function} constructor - Constructor function
         */
        toBeInstanceOf(constructor) {
            if (!(actual instanceof constructor)) {
                throw new ExpectationError(`Expected ${format(actual)} to be instance of ${constructor.name}`);
            }
        },

        /**
         * Check if actual contains expected substring or array element
         * @param {*} expected - Value to find
         */
        toContain(expected) {
            if (Array.isArray(actual)) {
                if (!actual.includes(expected)) {
                    throw new ExpectationError(`Expected array to contain ${format(expected)}`);
                }
            } else if (typeof actual === 'string') {
                if (!actual.includes(expected)) {
                    throw new ExpectationError(`Expected string to contain "${expected}"`);
                }
            } else {
                throw new ExpectationError(`toContain only works with arrays and strings`);
            }
        },

        /**
         * Check if actual is greater than expected
         * @param {number} expected - Value to compare
         */
        toBeGreaterThan(expected) {
            if (actual <= expected) {
                throw new ExpectationError(`Expected ${actual} to be greater than ${expected}`);
            }
        },

        /**
         * Check if actual is less than expected
         * @param {number} expected - Value to compare
         */
        toBeLessThan(expected) {
            if (actual >= expected) {
                throw new ExpectationError(`Expected ${actual} to be less than ${expected}`);
            }
        },

        /**
         * Check if actual is greater than or equal to expected
         * @param {number} expected - Value to compare
         */
        toBeGreaterThanOrEqual(expected) {
            if (actual < expected) {
                throw new ExpectationError(`Expected ${actual} to be >= ${expected}`);
            }
        },

        /**
         * Check if actual is less than or equal to expected
         * @param {number} expected - Value to compare
         */
        toBeLessThanOrEqual(expected) {
            if (actual > expected) {
                throw new ExpectationError(`Expected ${actual} to be <= ${expected}`);
            }
        },

        /**
         * Check if actual matches a regex
         * @param {RegExp} regex - Regular expression
         */
        toMatch(regex) {
            if (!regex.test(actual)) {
                throw new ExpectationError(`Expected "${actual}" to match ${regex}`);
            }
        },

        /**
         * Check array/object has property
         * @param {string} property - Property name
         */
        toHaveProperty(property) {
            if (actual === null || actual === undefined || !(property in actual)) {
                throw new ExpectationError(`Expected object to have property "${property}"`);
            }
        },

        /**
         * Check array/string length
         * @param {number} length - Expected length
         */
        toHaveLength(length) {
            if (actual?.length !== length) {
                throw new ExpectationError(`Expected length ${actual?.length} to be ${length}`);
            }
        },

        /**
         * Check if function throws
         * @param {Function|RegExp|string} [expected] - Expected error
         */
        toThrow(expected) {
            if (typeof actual !== 'function') {
                throw new ExpectationError(`Expected a function but got ${typeof actual}`);
            }
            let threw = false;
            let error = null;
            try {
                actual();
            } catch (e) {
                threw = true;
                error = e;
            }
            if (!threw) {
                throw new ExpectationError(`Expected function to throw`);
            }
            if (expected !== undefined) {
                if (expected instanceof RegExp) {
                    if (!expected.test(error.message)) {
                        throw new ExpectationError(`Expected error message to match ${expected}`);
                    }
                } else if (typeof expected === 'string') {
                    if (!error.message.includes(expected)) {
                        throw new ExpectationError(`Expected error message to contain "${expected}"`);
                    }
                }
            }
        },

        /**
         * Negate the next assertion
         */
        get not() {
            return {
                toBe: (expected) => {
                    if (actual === expected) {
                        throw new ExpectationError(`Expected ${format(actual)} not to be ${format(expected)}`);
                    }
                },
                toEqual: (expected) => {
                    if (deepEqual(actual, expected)) {
                        throw new ExpectationError(`Expected ${format(actual)} not to equal ${format(expected)}`);
                    }
                },
                toBeTruthy: () => {
                    if (actual) {
                        throw new ExpectationError(`Expected ${format(actual)} not to be truthy`);
                    }
                },
                toBeFalsy: () => {
                    if (!actual) {
                        throw new ExpectationError(`Expected ${format(actual)} not to be falsy`);
                    }
                },
                toBeNull: () => {
                    if (actual === null) {
                        throw new ExpectationError(`Expected value not to be null`);
                    }
                },
                toBeUndefined: () => {
                    if (actual === undefined) {
                        throw new ExpectationError(`Expected value not to be undefined`);
                    }
                },
                toContain: (expected) => {
                    if (Array.isArray(actual) && actual.includes(expected)) {
                        throw new ExpectationError(`Expected array not to contain ${format(expected)}`);
                    } else if (typeof actual === 'string' && actual.includes(expected)) {
                        throw new ExpectationError(`Expected string not to contain "${expected}"`);
                    }
                },
                toThrow: () => {
                    if (typeof actual !== 'function') {
                        throw new ExpectationError(`Expected a function`);
                    }
                    let threw = false;
                    try {
                        actual();
                    } catch (e) {
                        threw = true;
                    }
                    if (threw) {
                        throw new ExpectationError(`Expected function not to throw`);
                    }
                }
            };
        }
    };
}

// Custom error for test failures
class ExpectationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExpectationError';
    }
}

// ============ TEST STRUCTURE ============

/**
 * Create a test suite
 * @param {string} description - Suite description
 * @param {Function} fn - Suite body
 */
function describe(description, fn) {
    const suite = {
        description,
        tests: [],
        beforeEach: [],
        afterEach: [],
        beforeAll: [],
        afterAll: []
    };
    
    testState.suites.push(suite);
    const prevSuite = testState.currentSuite;
    testState.currentSuite = suite;
    
    try {
        fn();
    } finally {
        testState.currentSuite = prevSuite;
    }
}

/**
 * Create a test case
 * @param {string} description - Test description
 * @param {Function} fn - Test body (can be async)
 */
function it(description, fn) {
    if (!testState.currentSuite) {
        throw new Error('it() must be called inside describe()');
    }
    testState.currentSuite.tests.push({
        description,
        fn,
        skip: false
    });
}

/**
 * Skip a test
 */
it.skip = function(description, fn) {
    if (!testState.currentSuite) {
        throw new Error('it.skip() must be called inside describe()');
    }
    testState.currentSuite.tests.push({
        description,
        fn,
        skip: true
    });
};

/**
 * Focus on a test (only runs this test)
 */
it.only = function(description, fn) {
    if (!testState.currentSuite) {
        throw new Error('it.only() must be called inside describe()');
    }
    testState.currentSuite.tests.push({
        description,
        fn,
        skip: false,
        only: true
    });
};

/**
 * Register a beforeEach hook
 * @param {Function} fn - Hook function
 */
function beforeEach(fn) {
    if (!testState.currentSuite) {
        throw new Error('beforeEach() must be called inside describe()');
    }
    testState.currentSuite.beforeEach.push(fn);
}

/**
 * Register an afterEach hook
 * @param {Function} fn - Hook function
 */
function afterEach(fn) {
    if (!testState.currentSuite) {
        throw new Error('afterEach() must be called inside describe()');
    }
    testState.currentSuite.afterEach.push(fn);
}

/**
 * Register a beforeAll hook
 * @param {Function} fn - Hook function
 */
function beforeAll(fn) {
    if (!testState.currentSuite) {
        throw new Error('beforeAll() must be called inside describe()');
    }
    testState.currentSuite.beforeAll.push(fn);
}

/**
 * Register an afterAll hook
 * @param {Function} fn - Hook function
 */
function afterAll(fn) {
    if (!testState.currentSuite) {
        throw new Error('afterAll() must be called inside describe()');
    }
    testState.currentSuite.afterAll.push(fn);
}

// ============ TEST RUNNER ============

/**
 * Run all registered test suites
 * @returns {Promise<Object>} Test results
 */
async function runTests() {
    testState.isRunning = true;
    testState.startTime = Date.now();
    testState.results = {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        suiteResults: []
    };

    // Check for .only tests
    const hasOnly = testState.suites.some(s => s.tests.some(t => t.only));

    for (const suite of testState.suites) {
        const suiteResult = {
            description: suite.description,
            tests: [],
            passed: 0,
            failed: 0,
            skipped: 0
        };

        // Run beforeAll hooks
        for (const hook of suite.beforeAll) {
            try {
                await hook();
            } catch (e) {
                console.error(`beforeAll failed in "${suite.description}":`, e);
            }
        }

        for (const test of suite.tests) {
            testState.results.total++;

            // Skip if .only is used elsewhere
            if (hasOnly && !test.only) {
                test.skip = true;
            }

            if (test.skip) {
                suiteResult.tests.push({
                    description: test.description,
                    status: 'skipped',
                    duration: 0
                });
                suiteResult.skipped++;
                testState.results.skipped++;
                renderTestResult(suite.description, test.description, 'skipped', 0);
                continue;
            }

            const testStart = Date.now();
            let error = null;

            try {
                // Run beforeEach hooks
                for (const hook of suite.beforeEach) {
                    await hook();
                }

                // Run the test
                await test.fn();

                // Run afterEach hooks
                for (const hook of suite.afterEach) {
                    await hook();
                }

                suiteResult.passed++;
                testState.results.passed++;
            } catch (e) {
                error = e;
                suiteResult.failed++;
                testState.results.failed++;

                // Still run afterEach on failure
                for (const hook of suite.afterEach) {
                    try {
                        await hook();
                    } catch (hookError) {
                        console.error('afterEach failed:', hookError);
                    }
                }
            }

            const duration = Date.now() - testStart;
            const status = error ? 'failed' : 'passed';
            
            suiteResult.tests.push({
                description: test.description,
                status,
                duration,
                error: error ? {
                    message: error.message,
                    stack: error.stack
                } : null
            });

            renderTestResult(suite.description, test.description, status, duration, error);
        }

        // Run afterAll hooks
        for (const hook of suite.afterAll) {
            try {
                await hook();
            } catch (e) {
                console.error(`afterAll failed in "${suite.description}":`, e);
            }
        }

        testState.results.suiteResults.push(suiteResult);
    }

    testState.isRunning = false;
    renderSummary();

    return testState.results;
}

/**
 * Reset all test state
 */
function reset() {
    testState.suites = [];
    testState.currentSuite = null;
    testState.results = {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        suiteResults: []
    };
}

// ============ UTILITIES ============

/**
 * Deep equality check
 */
function deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((val, i) => deepEqual(val, b[i]));
    }
    
    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => deepEqual(a[key], b[key]));
    }
    
    return false;
}

/**
 * Format a value for display
 */
function format(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

// ============ RENDERING ============

/**
 * Render a single test result
 */
function renderTestResult(suite, test, status, duration, error = null) {
    const container = document.getElementById('test-results');
    if (!container) return;

    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
    const color = status === 'passed' ? '#4ade80' : status === 'failed' ? '#f87171' : '#888';
    
    const el = document.createElement('div');
    el.className = `test-result ${status}`;
    el.innerHTML = `
        <span class="test-icon">${icon}</span>
        <span class="test-suite" style="color: #888">${suite} ›</span>
        <span class="test-name" style="color: ${color}">${test}</span>
        <span class="test-duration">${duration}ms</span>
        ${error ? `<div class="test-error">${escapeHtml(error.message)}</div>` : ''}
    `;
    
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
}

/**
 * Render the final summary
 */
function renderSummary() {
    const container = document.getElementById('test-summary');
    if (!container) return;

    const { passed, failed, skipped, total } = testState.results;
    const duration = Date.now() - testState.startTime;
    const allPassed = failed === 0;

    container.innerHTML = `
        <div class="summary ${allPassed ? 'pass' : 'fail'}">
            <div class="summary-icon">${allPassed ? '🎉' : '💥'}</div>
            <div class="summary-text">
                <div class="summary-title">${allPassed ? 'All Tests Passed!' : 'Some Tests Failed'}</div>
                <div class="summary-stats">
                    <span class="stat passed">${passed} passed</span>
                    ${failed > 0 ? `<span class="stat failed">${failed} failed</span>` : ''}
                    ${skipped > 0 ? `<span class="stat skipped">${skipped} skipped</span>` : ''}
                    <span class="stat total">${total} total</span>
                    <span class="stat duration">in ${duration}ms</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Escape HTML entities
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============ MOCK UTILITIES ============

/**
 * Create a mock function
 * @returns {Function} Mock function with tracking
 */
function mock() {
    const calls = [];
    const fn = function(...args) {
        calls.push(args);
        return fn._returnValue;
    };
    fn.calls = calls;
    fn.mockReturnValue = (value) => {
        fn._returnValue = value;
        return fn;
    };
    fn.mockClear = () => {
        calls.length = 0;
        return fn;
    };
    return fn;
}

/**
 * Create a spy on an object method
 * @param {Object} obj - Object to spy on
 * @param {string} method - Method name
 * @returns {Function} Spy function
 */
function spy(obj, method) {
    const original = obj[method];
    const calls = [];
    
    obj[method] = function(...args) {
        calls.push(args);
        return original.apply(this, args);
    };
    
    obj[method].calls = calls;
    obj[method].restore = () => {
        obj[method] = original;
    };
    
    return obj[method];
}

// ============ STORAGE MOCK ============

/**
 * Create a mock localStorage for testing
 * @returns {Object} Mock storage object
 */
function createMockStorage() {
    let store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i) => Object.keys(store)[i] ?? null,
        _store: store
    };
}

// ============ EXPORTS ============

// Make available globally for browser use
window.TestFramework = {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll,
    runTests,
    reset,
    mock,
    spy,
    createMockStorage
};

// Also export individually for convenience
window.describe = describe;
window.it = it;
window.expect = expect;
window.beforeEach = beforeEach;
window.afterEach = afterEach;
window.beforeAll = beforeAll;
window.afterAll = afterAll;
