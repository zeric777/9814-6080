import os
import time

import numpy as np
import matplotlib.pyplot as plt

from stable_baselines3.common.buffers import ReplayBuffer

from stable_baselines3 import TD3
from stable_baselines3.common.env_checker import check_env
from stable_baselines3.common.noise import NormalActionNoise

from WebotsGymEnvironment import WebotsGymEnvironment

##### Controller for training #####

# ---------- Create Environment ----------
SEED = 42
env = WebotsGymEnvironment(
    max_episode_steps=2000,
    live_lidar=False,
    logging=True
)

# comment the following 2 lines to test the environment
# check_env(env)
# env.quit()

# ---------- Custom Replay Buffer with biased sampling ----------
class BiasedReplayBuffer(ReplayBuffer):
    def __init__(self, *args, n_bias=2000, bias_factor=100, **kwargs):
        super().__init__(*args, **kwargs)
        self.custom_probs = np.ones(len(self.observations))
        self.custom_probs[:n_bias] *= bias_factor  # e.g. bias_factor = 5
        self.custom_probs /= self.custom_probs.sum()

    def sample(self, batch_size, env=None):
        idxs = np.random.choice(
            len(self.observations),
            size=batch_size,
            p=self.custom_probs,  # predefined weights
        )
        return super()._get_samples(idxs, env)

#---------- Directory Settings ----------
MODEL_PATH = 'models/'
if not os.path.exists(MODEL_PATH):
    os.makedirs(MODEL_PATH)
getModelPath = lambda filename: MODEL_PATH + filename


# ---------- Train Model ----------
def train():
    #TODO train the model
    
    #END TODO
    
    plot_results()


#---------- Plotting methods ----------
episode_rewards = []
episode_steps = []
def callback(_locals, _globals):
    # Check if an episode finished
    infos = _locals.get('infos', [])
    dones = _locals.get('dones', [])
    if any(dones):
        for info in infos:
            if 'episode' in info:
                episode_rewards.append(info['episode']['r'])
                episode_steps.append(info['episode']['l'])
    return True

def plot_results():
    # Plot Reward & Steps vs Episode
    fig, ax1 = plt.subplots()
    ax1.set_xlabel('Episode')
    ax1.set_ylabel('Reward', color='tab:blue')
    ax1.plot(episode_rewards, color='tab:blue', label='Episode Reward')
    ax1.tick_params(axis='y', labelcolor='tab:blue')

    ax2 = ax1.twinx()
    ax2.set_ylabel('Steps', color='tab:red')
    ax2.plot(episode_steps, color='tab:red', linestyle='--', label='Episode Steps')
    ax2.tick_params(axis='y', labelcolor='tab:red')

    plt.title('Reward & Steps vs Episode')
    fig.legend(loc='upper right')
    plt.savefig(f'training_{MODEL_NAME}.png')
    plt.show()


# ---------- Load and test Trained Model ----------
def run():
    model = TD3.load(getModelPath(MODEL_NAME), env=env)
    obs, _ = env.reset()
    for _ in range(2000):
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(action)
        if terminated or truncated:
            obs, _ = env.reset()


if __name__ == "__main__":
    MODEL_NAME = 'webots_td3_model'

    train()
    # run()

    env.quit()

