//
// 'use strict';
//
// import {
//   CHALLENGE_START,
//   CHALLENGE_NEXT,
//   CHALLENGE_SOLVE,
//   CODE_CHANGED
// } from '../actions/challenge';
//
// import Challenges from '../../../json/challenges.json';
// import Challenge from '../model/Challenge';
//
// // import Immutable from 'immutable';
//
// const initialState = {
//   title: '',
//   description: [],
//   code: `
//     The code to work with will show up here.
//     When you are ready, enter a time at the top and press start to begin!
//   `,
//   challengeNumber: 0,
//   currChallenge: new Challenge(Challenges.challenges[0]),
//   currChallengeStartedAt: 0,
//   nextChallenge: ''
// };
//
// export default function challenge(state = initialState, action) {
//   const nextState = Object.assign({}, state);
//
//   switch (action.type) {
//     case CHALLENGE_START: // lift to session start
//       nextState.title = state.currChallenge.getTitle();
//       nextState.description = state.currChallenge.getDescription();
//       nextState.code = state.currChallenge.getSeed().join('\n');
//       nextState.challengeNumber++;
//       nextState.nextChallenge = new Challenge(Challenges.challenges[state.challengeNumber + 1]);
//       nextState.currChallengeStartedAt = action.startTime;
//       nextState.timerMaxValueLoaded = state.timerMaxValue;
//       break;
//     case CHALLENGE_NEXT:
//       nextState.currChallenge = state.nextChallenge;
//       nextState.currChallengeStartedAt = action.startTime;
//       nextState.title = state.nextChallenge.getTitle();
//       nextState.description = state.nextChallenge.getDescription();
//       nextState.code = state.nextChallenge.getSeed().join('\n');
//       nextState.challengeNumber++;
//       nextState.userOutput = '';
//       nextState.nextChallenge = new Challenge(Challenges.challenges[state.challengeNumber + 1]);
//       break;
//     case CHALLENGE_SOLVE:
//       const solution = state.currChallenge.getSolution();
//       if (solution !== null) {
//         nextState.code = solution;
//       }
//       else nextState.code = `// No solutions found\n${state.code}`;
//       break;
//     case CODE_CHANGED:
//       nextState.code = action.code;
//       break;
//     default:
//       return state;
//   }
//
//   return nextState;
// }

/* Unit tests for file client/scripts/arcademode/reducers/challenge.js. */
import chai, { expect, assert } from 'chai';
import Immutable from 'immutable';

import chaiImmutable from 'chai-immutable';

import reducer from '../../../../..//client/scripts/arcademode/reducers/challenge';
import {
  startChallenge,
  nextChallenge,
  actionSolveChallenge,
  onCodeChange
} from '../../../../../client/scripts/arcademode/actions/challenge';

import Challenges from '../../../../../client/json/challenges.json';

chai.use(chaiImmutable);

const dummyAction = { type: 'DUMMY' };

describe('challenge reducer', () => {
  it('should have clean initial state', () => {
    const state = reducer(undefined, dummyAction);
    assert.isOk(state, 'Initial state OK');
    assert(state.challengeNumber === 0, 'Challenge number 0 OK');
  });

  it('should set correct challenge start time', () => {
    const action = startChallenge(1000);
    const initialState = reducer(undefined, dummyAction);
    const nextState = reducer(initialState, action);
    assert(nextState.currChallengeStartedAt === 1000, 'Challenge started at 1000');
  });

  it('should move to next challenge with an action', () => {
    const initialState = reducer(undefined, dummyAction);
    const nextState = reducer(initialState, startChallenge(1200));
    const nextState2 = reducer(nextState, nextChallenge(1600));
    assert.deepEqual(nextState2.currChallenge, nextState.nextChallenge, 'Next challenge chosen correctly.');
  });

  it('should insert a solution when requested', () => {
    const initialState = reducer(undefined, dummyAction);
    const nextState = reducer(initialState, actionSolveChallenge());
    assert.notEqual(initialState.code, nextState.code);
  });

  it('yields no solution if challenge does not have it', () => {
    // let challenge = { solutions: [] };
    const initialState = reducer(undefined, dummyAction);
    const nextState = reducer(initialState, actionSolveChallenge());
      // TODO
    assert.Equal(initialState.code, nextState.code);
  });
  // nextChallenge()
  // actionSolveChallenge()
  it('should start first challenge on CHALLENGE_START', () => {
    const state = Immutable.Map({
      challengeNumber: 0,
      title: '',
      description: Immutable.List(),
      code: 'The code to work with will show up here.',
      nextChallenge: Immutable.Map(),
      currChallenge: Immutable.Map(Immutable.fromJS(Challenges.challenges[0])),
      currChallengeStartedAt: 0
      // timerMaxValueLoaded
    });
    const nextState = reducer(state, startChallenge());
    expect(nextState).to.equal(Immutable.Map({
      challengeNumber: 1,
      title: Challenges.challenges[0].title,
      description: Immutable.List(Immutable.fromJS(Challenges.challenges[0].description)),
      code: Challenges.challenges[0].challengeSeed,
      nextChallenge: Immutable.Map(Immutable.fromJS(Challenges.challenges[1])),
      currChallengeStartedAt: 0
    }));
  });

  it('should change code on CODE_CHANGED', () => {
    const state = Immutable.Map({
      code: 'The code to work with will show up here.'
    });
    const newCode = 'let x = 3;';
    const nextState = reducer(state, onCodeChange(newCode));
    expect(nextState).to.equal(Immutable.Map({
      code: 'let x = 3;'
    }));
  });

});
