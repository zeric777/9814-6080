import heapq
from queue import PriorityQueue
import networkx as nx
import pandas as pd


def create_step_dict(
    iteration, graph, pos, visited, frontier, current_node, path, title
):
    return {
        "iteration": iteration,
        "graph": graph,
        "pos": pos,
        "visited": list(visited),
        "frontier": frontier,
        "current_node": current_node,
        "path": path,
        "title": title,
    }


def DFS(graph, start, goal, alphabetic=False):
    stack = [(start, [])]
    visited = {}
    iteration = 0
    pos = nx.spring_layout(graph)
    steps = []

    while stack:
        node, path = stack.pop()
        if node in visited:
            continue
        visited[node] = len(path)
        path = path + [node]

        neighbors = (
            sorted(graph.neighbors(node)) if alphabetic else list(graph.neighbors(node))
        )

        if alphabetic:
            for neighbor in reversed(neighbors):
                if neighbor not in visited:
                    stack.append((neighbor, path))
        else:
            for neighbor in neighbors:
                if neighbor not in visited:
                    stack.append((neighbor, path))

        frontier = [(n, "_") for n, _ in stack]

        step = {
            "iteration": iteration,
            "graph": graph,
            "pos": pos,
            "visited": visited.copy(),
            "frontier": frontier,
            "current_node": (node, "_", "_"),
            "path": path,
            "cost": "_",
            "title": f"DFS Iteration {iteration}",
        }
        steps.append(step)
        iteration += 1

        if node == goal:
            step["goal_reached"] = True
            steps.append(step)
            return pd.DataFrame(steps), pos, "DFS"

    return pd.DataFrame(steps), pos, "DFS"


def BFS(graph, start, goal, alphabetic=False):
    queue = [(start, [])]
    visited = {}
    iteration = 0
    pos = nx.spring_layout(graph)
    # print(pos)
    steps = []

    while queue:
        node, path = queue.pop(0)
        if node in visited:
            continue
        visited[node] = len(path)
        path = path + [node]

        neighbors = (
            sorted(graph.neighbors(node)) if alphabetic else list(graph.neighbors(node))
        )
        for neighbor in neighbors:
            if neighbor not in visited:
                queue.append((neighbor, path))

        frontier = [(n, "_") for n, _ in queue]

        step = {
            "iteration": iteration,
            "graph": graph,
            "pos": pos,
            "visited": visited.copy(),
            "frontier": frontier,
            "current_node": (node, "_", "_"),
            "path": path,
            "cost": "_",
            "title": f"BFS Iteration {iteration}",
        }
        steps.append(step)
        iteration += 1

        if node == goal:
            step["goal_reached"] = True
            steps.append(step)
            return pd.DataFrame(steps), pos, "BFS"

    return pd.DataFrame(steps), pos, "BFS"


def UCS(graph, start, goal, alphabetic=False):
    pq = PriorityQueue()
    pq.put((0, start, []))
    visited = {}
    iteration = 0
    pos = nx.spring_layout(graph)
    steps = []

    while not pq.empty():
        cost, node, path = pq.get()
        if node in visited:
            continue
        visited[node] = cost
        path = path + [node]

        neighbors = (
            sorted(graph.neighbors(node)) if alphabetic else list(graph.neighbors(node))
        )
        for neighbor in neighbors:
            if neighbor not in visited:
                total_cost = cost + graph[node][neighbor]["weight"]
                pq.put((total_cost, neighbor, path))

        frontier = [(n, c) for c, n, _ in pq.queue]

        step = {
            "iteration": iteration,
            "graph": graph,
            "pos": pos,
            "visited": visited.copy(),
            "frontier": frontier,
            "current_node": (node, cost, "_"),
            "path": path,
            "cost": cost,
            "title": f"UCS Iteration {iteration}",
        }
        steps.append(step)
        iteration += 1

        if node == goal:
            step["goal_reached"] = True
            steps.append(step)
            return pd.DataFrame(steps), pos, "UCS"

    return pd.DataFrame(steps), pos, "UCS"


def heuristic(node, heuristic_values):
    return heuristic_values.get(node, float("inf"))


def best_first_search(graph, start, goal, heuristic_values):
    from queue import PriorityQueue

    steps = []
    pos = nx.spring_layout(graph)
    frontier = PriorityQueue()
    frontier.put((heuristic_values[start], start))
    came_from = {start: None}
    visited_nodes = []
    iteration = 0

    while not frontier.empty():
        current_cost, current = frontier.get()
        visited_nodes.append((current, heuristic_values.get(current, "_")))

        if current == goal:
            step = {
                "iteration": iteration,
                "visited": visited_nodes.copy(),
                "frontier": [
                    (n, heuristic_values.get(n, "_")) for _, n in frontier.queue
                ],
                "current_node": (current, "_", heuristic_values.get(current, "_")),
                "path": reconstruct_path(came_from, start, current, heuristic_values),
                "goal_reached": True,
            }
            steps.append(step)
            return pd.DataFrame(steps), pos, "Best-First Search"

        for neighbor in graph.neighbors(current):
            if neighbor not in came_from:
                priority = heuristic_values.get(neighbor, float("inf"))
                frontier.put((priority, neighbor))
                came_from[neighbor] = current

        step = {
            "iteration": iteration,
            "visited": visited_nodes.copy(),
            "frontier": [(n, heuristic_values.get(n, "_")) for _, n in frontier.queue],
            "current_node": (current, "_", heuristic_values.get(current, "_")),
            "path": reconstruct_path(came_from, start, current, heuristic_values),
        }
        steps.append(step)
        iteration += 1

    return pd.DataFrame(steps), pos, "Best-First Search"


def reconstruct_path(came_from, start, current, heuristic_values):
    path = []
    while current is not None:
        path.append((current, heuristic_values[current]))
        current = came_from[current]
    path.reverse()
    return path


def a_star_search(graph, start, goal, heuristic_values):
    pos = nx.spring_layout(graph)  # Node positions for visualisation
    frontier = []
    heapq.heappush(frontier, (0, start))
    came_from = {start: None}
    cost_so_far = {start: 0}
    iteration = 0
    steps = []
    goal_reached = False

    while frontier:
        _, current = heapq.heappop(frontier)

        if current == goal:
            goal_reached = True

        neighbors = list(graph.neighbors(current))
        for next_node in neighbors:
            new_cost = cost_so_far[current] + graph[current][next_node]["weight"]
            if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                cost_so_far[next_node] = new_cost
                priority = new_cost + heuristic(next_node, heuristic_values)
                heapq.heappush(frontier, (priority, next_node))
                came_from[next_node] = current

        # Track frontier nodes as tuples of (node, cost, heuristic value)
        frontier_nodes = [
            (node, cost_so_far[node], heuristic(node, heuristic_values))
            for _, node in frontier
        ]
        visited_nodes = {node: cost for node, cost in cost_so_far.items()}

        # Reconstruct path up to the current node
        path = []
        current_path_node = current
        while current_path_node is not None:
            path.append(
                (
                    current_path_node,
                    cost_so_far[current_path_node],
                    heuristic(current_path_node, heuristic_values),
                )
            )
            current_path_node = came_from[current_path_node]
        path.reverse()

        step = {
            "iteration": iteration,
            "visited": visited_nodes.copy(),
            "frontier": frontier_nodes,
            "current_node": (
                current,
                cost_so_far[current],
                heuristic(current, heuristic_values),
            ),
            "path": path,
            "cost": cost_so_far[current],
            "goal_reached": goal_reached,
        }
        steps.append(step)
        iteration += 1

        if goal_reached:
            break

    return pd.DataFrame(steps), pos, "A* Search"


def IDDFS(graph, start, goal, alphabetic=False):
    def dls(node, goal, depth, path, visited, steps, iteration):
        if depth == 0 and node == goal:
            return path + [node]
        if depth > 0:
            visited.add(node)
            neighbors = (
                sorted(graph.neighbors(node)) if alphabetic else graph.neighbors(node)
            )
            for neighbor in neighbors:
                if neighbor not in visited:
                    result = dls(
                        neighbor,
                        goal,
                        depth - 1,
                        path + [node],
                        visited,
                        steps,
                        iteration + 1,
                    )
                    if result:
                        return result
            visited.remove(node)

        step = create_step_dict(
            iteration,
            graph,
            pos,
            visited,
            list(visited),
            node,
            path,
            f"IDDFS Depth {depth} Iteration {iteration}",
        )
        step["current_node"] = (node, len(path), "_")
        steps.append(step)
        return None

    pos = nx.spring_layout(graph)
    steps = []
    for depth in range(len(graph.nodes)):
        visited = set()
        result = dls(start, goal, depth, [], visited, steps, 0)
        if result:
            return pd.DataFrame(steps), pos

    return pd.DataFrame(steps), pos
