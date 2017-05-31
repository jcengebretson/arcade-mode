
'use strict';

export const OUTPUT_CHANGED = 'OUTPUT_CHANGED'; // test
export const TESTS_STARTED = 'TESTS_STARTED'; // playerstatus, test
export const TESTS_FINISHED = 'TESTS_FINISHED'; // test
export const TESTS_FAILED = 'TESTS_FAILED'; // test
export const TESTS_PASSED = 'TESTS_PASSED'; // test

/* Given a list of test results, returns pass/fail status.*/
const getTestStatus = testResults => {
  let pass = true;
  testResults.forEach(item => {
    pass = pass && item.pass;
  });
  return pass;
};


export function onOutputChange(newOutput) {
  return {
    type: OUTPUT_CHANGED,
    userOutput: newOutput
  };
}

/* Thunk action which runs the test cases against user code. */
export function runTests(userCode, currChallenge) {
  return dispatch => {
    dispatch(actionTestsStarted());

    // Eval user code inside worker
    // http://stackoverflow.com/questions/9020116/is-it-possible-to-restrict-the-scope-of-a-javascript-function/36255766#36255766

    function createWorker () {
      return new Promise(resolve => {
        const wk = new Worker('public/js/ww.bundle.js');
        wk.postMessage([userCode, currChallenge.toJS()]); // postMessage mangles the Immutable object, so it needs to be transformed into regular JS before sending over to worker.
        wk.onmessage = e => {
          // console.log(`worker onmessage result: ${e.data}`);
          resolve(e.data);
        };
      });
    }

    return createWorker()
      .then(workerData => {
        dispatch(onOutputChange(workerData[0]));
        if (workerData.length > 1) {
          const testResults = workerData.slice(1);
          const allTestsPassed = getTestStatus(testResults);

          if (allTestsPassed) {
            dispatch(actionTestsPassed());
          }
          else {
            dispatch(actionTestsFailed());
          }

          // Would it make sense to include this with passed/failed actions?
          dispatch(actionTestsFinished(testResults));
        }
      })
      .catch(err => { console.log(`Promise rejected: ${err}.`); });
  };
}

/* Dispatched when a user starts running the tests.*/
export function actionTestsStarted () {
  return {
    type: TESTS_STARTED
  };
}

/* Dispatched when tests fail.*/
export function actionTestsPassed () {
  return {
    type: TESTS_PASSED
  };
}

/* Dispatched when tests fail.*/
export function actionTestsFailed () {
  return {
    type: TESTS_FAILED
  };
}

/* Dispatched when the tests finish. */
export function actionTestsFinished (testResults) {
  return {
    type: TESTS_FINISHED,
    testResults
  };
}