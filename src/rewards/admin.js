"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const plugins = __importStar(require("../plugins"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const db = __importStar(require("../database"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const utils = __importStar(require("../utils"));
function getActiveRewards() {
    return __awaiter(this, void 0, void 0, function* () {
        function load(id) {
            return __awaiter(this, void 0, void 0, function* () {
                // The next line calls a function in a module that has not been updated to TS yet
                // Issue arises because db.getObject type is not translated into TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                const [main, rewards] = yield Promise.all([
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    db.getObject(`rewards:id:${id}`),
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    db.getObject(`rewards:id:${id}:rewards`),
                ]);
                if (main) {
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    main.disabled = main.disabled === 'true';
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line max-len
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                    main.rewards = rewards;
                }
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return main;
            });
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const rewardsList = yield db.getSetMembers('rewards:list');
        const rewardData = yield Promise.all(rewardsList.map(id => load(id)));
        return rewardData.filter(Boolean);
    });
}
function saveConditions(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const rewardsPerCondition = {};
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield db.delete('conditions:active');
        const conditions = [];
        data.forEach((reward) => {
            conditions.push(reward.condition);
            rewardsPerCondition[reward.condition] = rewardsPerCondition[reward.condition] || [];
            rewardsPerCondition[reward.condition].push(reward.id);
        });
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield db.setAdd('conditions:active', conditions);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        yield Promise.all(Object.keys(rewardsPerCondition).map(c => db.setAdd(`condition:${c}:rewards`, rewardsPerCondition[c])));
    });
}
const rewards = {
    save: function (data) {
        return __awaiter(this, void 0, void 0, function* () {
            function save(data) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!Object.keys(data.rewards).length) {
                        return;
                    }
                    const rewardsData = data.rewards;
                    delete data.rewards;
                    if (!parseInt(data.id.toString(), 10)) {
                        // The next line calls a function in a module that has not been updated to TS yet
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
                        data.id = (yield db.incrObjectField('global', 'rewards:id'));
                    }
                    yield rewards.delete(data);
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    yield db.setAdd('rewards:list', data.id);
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    yield db.setObject(`rewards:id:${data.id}`, data);
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    yield db.setObject(`rewards:id:${data.id}:rewards`, rewardsData);
                });
            }
            yield Promise.all(data.map(reward => save(reward)));
            yield saveConditions(data);
            return data;
        });
    },
    delete: function (data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                db.setRemove('rewards:list', data.id),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                db.delete(`rewards:id:${data.id}`),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                db.delete(`rewards:id:${data.id}:rewards`),
            ]);
        });
    },
    get: function () {
        return __awaiter(this, void 0, void 0, function* () {
            return yield utils.promiseParallel({
                active: getActiveRewards(),
                conditions: plugins.hooks.fire('filter:rewards.conditions', []),
                conditionals: plugins.hooks.fire('filter:rewards.conditionals', []),
                rewards: plugins.hooks.fire('filter:rewards.rewards', []),
            });
        });
    },
};
// require('../promisify')(rewards);
