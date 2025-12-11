from controller import Supervisor, Keyboard
import gymnasium as gym
import numpy as np
import matplotlib.pyplot as plt

##### Gym environment interface for Webots #####

# Helper Functions
getPosition = lambda node: np.array(node.getField('translation').getSFVec3f()[:2])
setPosition = lambda node, pos: node.getField('translation').setSFVec3f([pos[0], pos[1], 0.0])
getRotation = lambda node: extractHeadingAngle(node.getField('rotation').getSFRotation())
setRotation = lambda node, heading: node.getField('rotation').setSFRotation([0.0, 0.0, 1.0, heading])
getRelativeHeading = lambda pos, target, heading: np.arctan2(target[1]-pos[1], target[0]-pos[0]) - heading

def extractHeadingAngle(sfRotation):
    ax, ay, az, angle = sfRotation
    heading = angle * az
    heading = (heading + np.pi) % (2 * np.pi) - np.pi
    return heading

def rangeToCoords(readings, angles):
    readings = np.asarray(readings)
    mask = ~np.isinf(readings)
    readings = readings[mask]
    angles = angles[mask]
    coords = []
    for reading, angle in zip(readings, angles):
        coords.append((reading * np.sin(angle), reading * np.cos(angle)))
    return np.array(coords)

def rangeToMinCoord(readings, angles, default_dist):
    # TODO get minimum distance index in readings
    
    # END TODO
    return np.array([])


# Gym Environment
class WebotsGymEnvironment(Supervisor, gym.Env):
    def __init__(self, max_episode_steps, live_lidar=True, logging=False):
        # ---------- Settings ----------
        self.logging = logging
        self.live_lidar = live_lidar

        # ---------- Initialize controller ----------
        super().__init__()
        self.__timestep = int(self.getBasicTimeStep())
        print(f"Time step: {self.__timestep} ms")

        self.keyboard = self.getKeyboard()
        self.keyboard.enable(self.__timestep)

        self.obs = None
        self.step_lapsed = 0
        self.bounds = 3.0
        self.collision_dist = 0.15

        # ---------- Initialize nodes ----------

        # TODO: get from DEF
        
        # END TODO


        ############ Robot Setup ############
        # This section is copied from basic_controller.py
        
        # ---------- Initialize motors ----------
        # Get wheel motors and set to velocity control mode
        self.left_motor = self.getDevice('left wheel motor')
        self.right_motor = self.getDevice('right wheel motor')
        self.left_motor.setPosition(float('inf'))
        self.right_motor.setPosition(float('inf'))

        # Get motor parameters
        self.max_motor_speed = self.left_motor.getMaxVelocity()

        # Settings for Turtlebot3 burger
        self.wheel_radius = 0.033
        self.wheel_base = 0.16
        print(f"Wheel radius: {self.wheel_radius}, Wheel base: {self.wheel_base}, Max motor speed: {self.max_motor_speed}")

        self.v_max = self.max_motor_speed * self.wheel_radius
        self.w_max = (2 * self.max_motor_speed * self.wheel_radius) / self.wheel_base


        # ---------- Initialize lidar ----------
        # Get and enable lidar
        self.lidar_sensor = self.getDevice("LDS-01")
        self.lidar_sensor.enable(self.__timestep)

        # Get lidar parameters
        self.resolution = self.lidar_sensor.getHorizontalResolution()
        self.fov = self.lidar_sensor.getFov()
        self.max_range = self.lidar_sensor.getMaxRange()
        print(f"Lidar resolution: {self.resolution}, FOV: {self.fov}, Max range: {self.max_range}")

        self.lidar_angles = np.linspace(-self.fov/2, self.fov/2, self.resolution)

        ############ End Robot Setup ############

        # ---------- Initialize gym spaces ----------
        # TODO configure action and observation spaces
        
        # END TODO

        self._internal_init()

    def _internal_init(self):
        # step history
        self._prog_hist = []
        self.dist_to_goal  = np.inf

        # collision detection
        self._collision_steps = 0
        self._collision_patience = 1

        # Live LiDAR plot
        self._grid_size = 64
        self._half_grid = self._grid_size // 2
        self._cell_size = self.bounds / self._half_grid

        self._live_refresh_rate = 2

        if self.live_lidar:
            plt.ion()
            self._fig, self._ax = plt.subplots()
            self._ax.set_aspect("equal")
            self._ax.set_title("LiDAR Occupancy (live)")        

    def _update_live_lidar(self, coords):
        grid = np.zeros((self._grid_size, self._grid_size), dtype=int)
        for x, y in coords:
            xg = int(self._half_grid + x / self._cell_size)
            yg = int(self._half_grid + y / self._cell_size)
            if 0 <= xg < self._grid_size and 0 <= yg < self._grid_size:
                grid[yg, xg] = 1
    
        self._ax.clear()
        self._ax.imshow(grid, cmap="Greys", origin="lower")
        self._ax.set_xlim(0, self._grid_size-1)
        self._ax.set_ylim(0, self._grid_size-1)
        self._ax.set_aspect("equal")
        self._ax.set_title("LiDAR Occupancy (live)")
        plt.pause(0.001)

    # Device methods
    def get_wheel_speeds(self, v, w):
        v_left_wheel = (2*v - w*self.wheel_base) / (2*self.wheel_radius)
        v_right_wheel = (2*v + w*self.wheel_base) / (2*self.wheel_radius)
        return v_left_wheel, v_right_wheel

    def get_v_w(self, v_left, v_right):
        v = self.wheel_radius * (v_left + v_right) / 2
        w = self.wheel_radius * (v_right - v_left) / self.wheel_base
        return v, w

    def manual_control(self, saveCallback, runs):
        # TODO implement manual control
        
        # END TODO
        return

    # Gym interface methods
    def seed(self, seed=None):
        np.random.seed(seed)
        
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.simulationResetPhysics()
        super().step(self.__timestep)
        self.step_lapsed = 0

        self._collision_steps = 0
        self._prog_hist = []

        # TODO implement reset logic

        # END TODO

        self.dist_to_goal  = np.linalg.norm(init_position - self.target)

        return self.obs, {}

    def step(self, action):
        # TODO apply action to motors
        
        # END TODO

        super().step(self.__timestep)
        self.step_lapsed += 1

        return self.getObservations()

    def getObservations(self):
        # TODO compute observation
        
        # END TODO
        
        # ---------- Termination States ----------
        if self.live_lidar and self.step_lapsed % self._live_refresh_rate == 0:
            lidar_coords = rangeToCoords(lidar_ranges, self.lidar_angles)
            self._update_live_lidar(lidar_coords)

        # Lidar collision check
        min_obstacle_dist = np.linalg.norm(min_obstacle_coord)
        
        if min_obstacle_dist < self.collision_dist:
            self._collision_steps += 1
        else:
            self._collision_steps = 0
        collision = (self._collision_steps >= self._collision_patience)

        # Progress towards goal
        new_dist_to_goal = np.linalg.norm(xy - self.target)
        progress = self.dist_to_goal  - new_dist_to_goal
        self.dist_to_goal = new_dist_to_goal

        goal_reached = self.dist_to_goal < self.collision_dist
        out_of_bounds = (abs(x) > self.bounds or abs(y) > self.bounds)
        time_limit = (self.step_lapsed >= self.spec.max_episode_steps)
        
        terminated = bool(goal_reached or out_of_bounds or collision)
        truncated = bool(time_limit)

        term_reason = next(
            (r for cond, r in [
                (collision      , 'collision'),
                (out_of_bounds  , 'out_of_bounds'),
                (goal_reached   , 'goal_reached'),
                (time_limit     , 'time_limit')
            ] if cond),
            'none'
        )

        # ---------- Reward Calculation ----------

        # TODO compute reward
        
        # END TODO

        # Logging (concise, with coach info)
        self._verbose(
            f"Reward:{reward:>7.2f} | dist:{self.dist_to_goal:>5.2f} head:{r_heading_diff:>+5.2f} "
            f"lidar_min:{min_obstacle_dist:>4.2f}"
        )

        # ---------- Info Dictionary ----------
        info = {
            "terminated": bool(terminated),
            "truncated": bool(truncated),
            "termination_reason": term_reason,
            "time_limit": bool(time_limit),
            "goal_reached": bool(goal_reached),
            "out_of_bounds": bool(out_of_bounds),
            "collision": bool(collision),
            "collision_steps": int(self._collision_steps),
        }
        
        return self.obs, reward, terminated, truncated, info
    
    # Supervisor methods
    def waitForKeyboard(self):
        while self.keyboard.getKey() == -1:
            super().step(self.__timestep)

    def _verbose(self, message):
        if self.logging:
            print(message)

    def quit(self):
        self.simulationSetMode(Supervisor.SIMULATION_MODE_PAUSE)
