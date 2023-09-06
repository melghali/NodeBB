
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
import * as plugins from '../plugins';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
import * as db from '../database';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
import * as utils from '../utils';

interface Reward {
    id: number;
    rewards: Record<string, string[]>;
    condition: string;
    // Add other properties as needed
}

interface Rewards {
    save: (data: Reward[]) => Promise<Reward[]>;
    delete: (data: Reward) => Promise<void>;
    get: () => Promise<{
        id: number;
        active: Reward[];
        conditions: string[]; // Update with the actual type of conditions
        conditionals: string[]; // Update with the actual type of conditionals
        rewards: string[]; // Update with the actual type of rewards
    }>;
}

interface Main {
    id: number;
    disabled: boolean;
    rewards: Record<string, string[]>;
    // Add other properties as needed
}

async function getActiveRewards() {
    async function load(id: number) : Promise<Main | Rewards> {
        // The next line calls a function in a module that has not been updated to TS yet
        // Issue arises because db.getObject type is not translated into TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const [main, rewards] = await Promise.all([
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
            // eslint-disable-next-line@typescript-eslint/no-unsafe-member-access
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            main.rewards = rewards;
        }

        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return main;
    }

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const rewardsList: number[] = await db.getSetMembers('rewards:list');
    const rewardData = await Promise.all(rewardsList.map(id => load(id)));
    return rewardData.filter(Boolean);
}

async function saveConditions(data: Reward[]) {
    const rewardsPerCondition: Record<string, number[]> = {};
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await db.delete('conditions:active');
    const conditions: string[] = [];

    data.forEach((reward) => {
        conditions.push(reward.condition);
        rewardsPerCondition[reward.condition] = rewardsPerCondition[reward.condition] || [];
        rewardsPerCondition[reward.condition].push(reward.id);
    });

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await db.setAdd('conditions:active', conditions);

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await Promise.all(Object.keys(rewardsPerCondition).map(c => db.setAdd(`condition:${c}:rewards`, rewardsPerCondition[c])));
}

const rewards: Rewards = {
    save: async function (data: Reward[]) {
        async function save(data: Reward) {
            if (!Object.keys(data.rewards).length) {
                return;
            }
            const rewardsData = data.rewards;
            delete data.rewards;
            if (!parseInt(data.id.toString(), 10)) {
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
                data.id = await db.incrObjectField('global', 'rewards:id') as number;
            }
            await rewards.delete(data);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.setAdd('rewards:list', data.id);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.setObject(`rewards:id:${data.id}`, data);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.setObject(`rewards:id:${data.id}:rewards`, rewardsData);
        }

        await Promise.all(data.map(reward => save(reward)));
        await saveConditions(data);
        return data;
    },

    delete: async function (data: Reward) {
        await Promise.all([
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
    },


    get: async function () {
        return await utils.promiseParallel({
            active: getActiveRewards(),
            conditions: plugins.hooks.fire('filter:rewards.conditions', []),
            conditionals: plugins.hooks.fire('filter:rewards.conditionals', []),
            rewards: plugins.hooks.fire('filter:rewards.rewards', []),
        });
    },
};




// require('../promisify')(rewards);
