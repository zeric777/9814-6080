from controller import Robot, Keyboard
import numpy as np
import matplotlib.pyplot as plt

##### Basic robot controller #####

# ---------- Initialize controller ----------
robot = Robot()
timestep = int(robot.getBasicTimeStep())

keyboard = Keyboard()
keyboard.enable(timestep)

############ Robot Setup ############

# ---------- Initialize motors ----------
# Get wheel motors and set to velocity control mode
left_motor = robot.getDevice('left wheel motor')
right_motor = robot.getDevice('right wheel motor')
left_motor.setPosition(float('inf'))
right_motor.setPosition(float('inf'))

# Get motor parameters
max_motor_speed = left_motor.getMaxVelocity()

# Settings for Turtlebot3 burger
wheel_radius = 0.033
wheel_base = 0.16
print(f"Wheel radius: {wheel_radius}, Wheel base: {wheel_base}, Max motor speed: {max_motor_speed}")

# Function to set wheel speeds based on linear and angular velocity
def set_wheel_speeds(v, w):
    v_left_wheel = (2*v - w*wheel_base) / (2*wheel_radius)
    v_right_wheel = (2*v + w*wheel_base) / (2*wheel_radius)
    left_motor.setVelocity(v_left_wheel)
    right_motor.setVelocity(v_right_wheel)

v_max = max_motor_speed * wheel_radius
w_max = (2 * max_motor_speed * wheel_radius) / wheel_base

# ---------- Initialize lidar ----------

# Get and enable lidar
lidar_sensor = robot.getDevice("LDS-01")
lidar_sensor.enable(timestep)

# Get lidar parameters
resolution = lidar_sensor.getHorizontalResolution()
fov = lidar_sensor.getFov()
max_range = lidar_sensor.getMaxRange()
print(f"Lidar resolution: {resolution}, FOV: {fov}, Max range: {max_range}")

############ End Robot Setup ############

# process lidar readings to (x,y) coordinates
lidar_angles = np.linspace(-fov/2, fov/2, resolution)
def rangeToCoords(readings, angles):
    readings = np.asarray(readings)
    mask = ~np.isinf(readings)

    # only keep valid points
    readings = readings[mask]
    angles = angles[mask]

    coords = []
    for reading, angle in zip(readings, angles):
        coords.append((reading * np.sin(angle), reading * np.cos(angle)))

    return np.array(coords)

# ---------- Visualization setup ----------
cell_size = 0.1
half_grid = max_range // cell_size
grid_size = int(half_grid * 2)

plt.ion()

def show_grid(coords):
    grid = np.zeros((grid_size, grid_size), dtype=int)
    for x,y in coords:
        x_grid = int(half_grid + x / cell_size)
        y_grid = int(half_grid + y / cell_size)
        if 0 <= x_grid < grid_size and 0 <= y_grid < grid_size:
            grid[y_grid][x_grid] = 1
    plt.imshow(grid, cmap="Greys", origin="lower")
    plt.pause(0.01)
    plt.clf()



# ---------- Main control loop ----------

while robot.step(timestep) != -1:
    #motor control
    key = keyboard.getKey()
    if key == ord('A'):
        v = 0
        w = w_max
    elif key == ord('D'):
        v = 0
        w = -w_max
    elif key == ord('W'):
        v = v_max
        w = 0
    elif key == ord('S'):
        v = -v_max
        w = 0
    else:
        v = 0
        w = 0

    set_wheel_speeds(v, w)

    #lidar display
    lidar_readings = lidar_sensor.getRangeImage()
    coords = rangeToCoords(lidar_readings, lidar_angles)
    show_grid(coords)


    
