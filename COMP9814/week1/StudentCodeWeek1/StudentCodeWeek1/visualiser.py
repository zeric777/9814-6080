import matplotlib.pyplot as plt
import networkx as nx
from PyQt5.QtWidgets import (
    QMainWindow,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QTextEdit,
    QWidget,
    QSlider,
    QSplitter,
    QComboBox,
    QCheckBox,
)
from PyQt5.QtCore import Qt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from algorithms import BFS, DFS, UCS, best_first_search, a_star_search, heuristic


class DraggableNode:
    def __init__(self, node, pos):
        self.node = node
        self.pos = pos
        self.pressed = False


class Visualiser(QMainWindow):
    def __init__(
        self, graph, edges, heuristic_values, fixed_start=None, fixed_end=None
    ):
        super().__init__()
        self.is_closed = False
        self.graph = graph
        self.edges = edges
        self.heuristic_values = heuristic_values
        self.steps = None
        self.pos = None
        self.algorithm_name = None
        self.fixed_start = fixed_start
        self.fixed_end = fixed_end
        self.scale = 1.0
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Search Algorithm Visualisation")
        self.figure, self.ax = plt.subplots()
        self.canvas = FigureCanvas(self.figure)
        self.canvas.mpl_connect("button_press_event", self.on_press)
        self.canvas.mpl_connect("motion_notify_event", self.on_motion)
        self.canvas.mpl_connect("button_release_event", self.on_release)

        self.algorithm_dropdown = QComboBox(self)
        self.algorithm_dropdown.addItems(
            ["BFS", "DFS", "UCS", "Best-First Search", "A* Search"]
        )
        self.algorithm_dropdown.currentIndexChanged.connect(self.on_algorithm_change)
        self.alphabetic_checkbox = QCheckBox("Alphabetic Order", self)
        self.run_button = QPushButton("Run", self)
        self.run_button.clicked.connect(self.run_algorithm)

        self.start_node_dropdown = QComboBox(self)
        self.start_node_dropdown.addItems(self.graph.nodes)
        self.end_node_dropdown = QComboBox(self)
        self.end_node_dropdown.addItems(self.graph.nodes)

        self.next_button = QPushButton("Next", self)
        self.next_button.clicked.connect(self.next_step)
        self.prev_button = QPushButton("Previous", self)
        self.prev_button.clicked.connect(self.prev_step)

        self.text_display = QTextEdit(self)
        self.text_display.setReadOnly(True)

        self.output_zoom_slider = QSlider(Qt.Horizontal)
        self.output_zoom_slider.setMinimum(10)
        self.output_zoom_slider.setMaximum(40)
        self.output_zoom_slider.setValue(12)
        self.output_zoom_slider.valueChanged.connect(self.update_output_zoom)

        dropdown_layout = QHBoxLayout()
        dropdown_layout.addWidget(self.algorithm_dropdown)
        dropdown_layout.addWidget(self.alphabetic_checkbox)
        dropdown_layout.addWidget(self.start_node_dropdown)
        dropdown_layout.addWidget(self.end_node_dropdown)
        dropdown_layout.addWidget(self.run_button)

        button_layout = QHBoxLayout()
        button_layout.addWidget(self.prev_button)
        button_layout.addWidget(self.next_button)

        graph_layout = QVBoxLayout()
        graph_layout.addWidget(self.canvas)
        graph_layout.addLayout(dropdown_layout)
        graph_layout.addLayout(button_layout)

        graph_container = QWidget()
        graph_container.setLayout(graph_layout)

        output_layout = QVBoxLayout()
        output_layout.addWidget(self.text_display)
        output_layout.addWidget(self.output_zoom_slider)

        output_container = QWidget()
        output_container.setLayout(output_layout)

        splitter = QSplitter(Qt.Vertical)
        splitter.addWidget(graph_container)
        splitter.addWidget(output_container)

        main_layout = QVBoxLayout()
        main_layout.addWidget(splitter)

        container = QWidget()
        container.setLayout(main_layout)
        self.setCentralWidget(container)

        self.draggable_nodes = {}

    def run_algorithm(self):
        self.algorithm_name = self.algorithm_dropdown.currentText()
        alphabetic = self.alphabetic_checkbox.isChecked()

        if self.algorithm_name in ["Best-First Search", "A* Search"]:
            self.start_node_dropdown.setDisabled(True)
            self.end_node_dropdown.setDisabled(True)
            start_node = self.fixed_start
            end_node = self.fixed_end
        else:
            self.start_node_dropdown.setDisabled(False)
            self.end_node_dropdown.setDisabled(False)
            start_node = self.start_node_dropdown.currentText()
            end_node = self.end_node_dropdown.currentText()

        if not start_node or not end_node:
            self.text_display.setText("Please select both start and end nodes.")
            return

        if self.algorithm_name == "BFS":
            self.steps, self.pos, _ = BFS(
                self.graph, start_node, end_node, alphabetic=alphabetic
            )
            self.steps["cost"] = 0
        elif self.algorithm_name == "DFS":
            self.steps, self.pos, _ = DFS(
                self.graph, start_node, end_node, alphabetic=alphabetic
            )
            self.steps["cost"] = 0
        elif self.algorithm_name == "UCS":
            self.steps, self.pos, _ = UCS(
                self.graph, start_node, end_node, alphabetic=alphabetic
            )
        elif self.algorithm_name == "Best-First Search":
            self.steps, self.pos, _ = best_first_search(
                self.graph, start_node, end_node, self.heuristic_values
            )
        elif self.algorithm_name == "A* Search":
            self.steps, self.pos, _ = a_star_search(
                self.graph, start_node, end_node, self.heuristic_values
            )

        self.step_num = 0
        self.draggable_nodes = {
            node: DraggableNode(node, self.pos[node]) for node in self.pos
        }
        self.update_plot()

    def next_step(self):
        if self.steps is None or self.step_num >= len(self.steps) - 1:
            return
        self.step_num += 1
        self.update_plot()

    def prev_step(self):
        if self.steps is None or self.step_num <= 0:
            return
        self.step_num -= 1
        self.update_plot()

    def on_algorithm_change(self, index):
        if not self.is_closed:
            self.run_algorithm()

    def on_press(self, event):
        if event.inaxes != self.ax:
            return

        for node, draggable_node in self.draggable_nodes.items():
            if (
                draggable_node.pos[0] - 0.05
                <= event.xdata
                <= draggable_node.pos[0] + 0.05
                and draggable_node.pos[1] - 0.05
                <= event.ydata
                <= draggable_node.pos[1] + 0.05
            ):
                draggable_node.pressed = True
                break

    def on_motion(self, event):
        if event.inaxes != self.ax:
            return

        for node, draggable_node in self.draggable_nodes.items():
            if draggable_node.pressed:
                draggable_node.pos = (event.xdata, event.ydata)
                self.pos[node] = draggable_node.pos
                self.update_plot()
                break

    def on_release(self, event):
        for node, draggable_node in self.draggable_nodes.items():
            draggable_node.pressed = False

    def update_output_zoom(self):
        font_size = self.output_zoom_slider.value()
        self.text_display.setStyleSheet(f"font-size: {font_size}pt;")

    def closeEvent(self, event):
        self.is_closed = True
        event.accept()

    def update_plot(self):
        if self.is_closed or self.steps is None:
            return

        if self.step_num >= len(self.steps):
            return

        step = self.steps.iloc[self.step_num]
        self.ax.clear()

        scaled_pos = {
            node: (x * self.scale, y * self.scale) for node, (x, y) in self.pos.items()
        }

        nx.draw(
            self.graph,
            scaled_pos,
            with_labels=True,
            node_color="lightblue",
            node_size=500,
            font_size=10,
            font_weight="bold",
            edge_color="black",
            ax=self.ax,
        )

        if self.algorithm_name == "BFS":
            self.plot_bfs(step, scaled_pos)
        elif self.algorithm_name == "DFS":
            self.plot_dfs(step, scaled_pos)
        elif self.algorithm_name == "UCS":
            self.plot_ucs(step, scaled_pos)
        elif self.algorithm_name == "Best-First Search":
            self.plot_best_first_search(step, scaled_pos)
        elif self.algorithm_name == "A* Search":
            self.plot_a_star_search(step, scaled_pos)
        else:
            self.text_display.setText("No steps available.")

    def plot_bfs(self, step, scaled_pos):
        node_name, _, _ = step["current_node"]
        visited_nodes = step["visited"]
        frontier_nodes = [node for node, _ in step["frontier"]]

        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=visited_nodes,
            node_color="yellow",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=frontier_nodes,
            node_color="green",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=[node_name],
            node_color="orange",
            ax=self.ax,
        )

        if step["path"]:
            path_edges = [
                (step["path"][i], step["path"][i + 1])
                for i in range(len(step["path"]) - 1)
            ]

            filtered_edges = [
                edge
                for edge in path_edges
                if edge[0] in scaled_pos and edge[1] in scaled_pos
            ]
            nx.draw_networkx_edges(
                self.graph,
                scaled_pos,
                edgelist=filtered_edges,
                edge_color="red",
                width=3,
                ax=self.ax,
                arrowstyle="-|>",
                arrows=True,
            )

        if "goal_reached" in step and step["goal_reached"]:
            nx.draw_networkx_nodes(
                self.graph,
                scaled_pos,
                nodelist=step["path"],
                node_color="blue",
                node_shape="o",
                ax=self.ax,
            )
            nx.draw_networkx_labels(
                self.graph,
                scaled_pos,
                labels={node: node for node in step["path"]},
                font_color="white",
                font_size=10,
                font_weight="bold",
                ax=self.ax,
            )

        self.ax.set_title(f"BFS Iteration {step['iteration']}")
        self.canvas.draw()

        visited = [f"{node}" for node in step["visited"]]
        frontier = [f"{node}" for node, _ in step["frontier"]]
        path = [f"{node}" for node in step["path"]]
        display_text = (
            f"Iteration: {step['iteration']}\n"
            f"Current Node: {node_name}\n"
            f"Visited: {visited}\n"
            f"Frontier: {frontier}\n"
            f"Path: {path}"
        )
        self.text_display.setText(display_text)

    def plot_dfs(self, step, scaled_pos):
        node_name, _, _ = step["current_node"]
        visited_nodes = step["visited"]
        frontier_nodes = [node for node, _ in step["frontier"]]

        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=visited_nodes,
            node_color="yellow",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=frontier_nodes,
            node_color="green",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=[node_name],
            node_color="orange",
            ax=self.ax,
        )

        if step["path"]:
            path_edges = [
                (step["path"][i], step["path"][i + 1])
                for i in range(len(step["path"]) - 1)
            ]
            filtered_edges = [
                edge
                for edge in path_edges
                if edge[0] in scaled_pos and edge[1] in scaled_pos
            ]
            nx.draw_networkx_edges(
                self.graph,
                scaled_pos,
                edgelist=filtered_edges,
                edge_color="red",
                width=3,
                ax=self.ax,
                arrowstyle="-|>",
                arrows=True,
            )

        if "goal_reached" in step and step["goal_reached"]:
            nx.draw_networkx_nodes(
                self.graph,
                scaled_pos,
                nodelist=step["path"],
                node_color="blue",
                node_shape="o",
                ax=self.ax,
            )
            nx.draw_networkx_labels(
                self.graph,
                scaled_pos,
                labels={node: node for node in step["path"]},
                font_color="white",
                font_size=10,
                font_weight="bold",
                ax=self.ax,
            )

        self.ax.set_title(f"DFS Iteration {step['iteration']}")
        self.canvas.draw()

        visited = [f"{node}" for node in step["visited"]]
        frontier = [f"{node}" for node, _ in step["frontier"]]
        path = [f"{node}" for node in step["path"]]
        display_text = (
            f"Iteration: {step['iteration']}\n"
            f"Current Node: {node_name}\n"
            f"Visited: {visited}\n"
            f"Frontier: {frontier}\n"
            f"Path: {path}"
        )
        self.text_display.setText(display_text)

    def plot_ucs(self, step, scaled_pos):
        node_name, g_cost, _ = step["current_node"]
        visited_nodes = step["visited"]
        frontier_nodes = step["frontier"]

        visited_nodes_list = [
            f"({node}, {cost})" for node, cost in visited_nodes.items()
        ]
        frontier_nodes_list = [f"({node}, {cost})" for node, cost in frontier_nodes]
        path_list = [f"({node}, {visited_nodes[node]})" for node in step["path"]]

        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=visited_nodes.keys(),
            node_color="yellow",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=[node for node, _ in frontier_nodes],
            node_color="green",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=[node_name],
            node_color="orange",
            ax=self.ax,
        )

        path_edges = [
            (step["path"][i], step["path"][i + 1]) for i in range(len(step["path"]) - 1)
        ]
        filtered_edges = [
            edge
            for edge in path_edges
            if edge[0] in scaled_pos and edge[1] in scaled_pos
        ]
        if filtered_edges:
            nx.draw_networkx_edges(
                self.graph,
                scaled_pos,
                edgelist=filtered_edges,
                edge_color="red",
                width=3,
                ax=self.ax,
                arrowstyle="-|>",
                arrows=True,
            )

        if "goal_reached" in step and step["goal_reached"]:
            nx.draw_networkx_nodes(
                self.graph,
                scaled_pos,
                nodelist=[node for node in step["path"]],
                node_color="blue",
                node_shape="o",
                ax=self.ax,
            )
            nx.draw_networkx_labels(
                self.graph,
                scaled_pos,
                labels={node: node for node in step["path"]},
                font_color="white",
                font_size=10,
                font_weight="bold",
                ax=self.ax,
            )

        edge_labels = nx.get_edge_attributes(self.graph, "weight")
        nx.draw_networkx_edge_labels(
            self.graph, scaled_pos, edge_labels=edge_labels, ax=self.ax
        )

        self.ax.set_title(f"UCS Iteration {step['iteration']}")
        self.canvas.draw()

        cost_with_cost = step["cost"]
        display_text = (
            f"Iteration: {step['iteration']}\n"
            f"Current Node: ({node_name}, {g_cost})\n"
            f"Visited: {visited_nodes_list}\n"
            f"Frontier: {frontier_nodes_list}\n"
            f"Path: {path_list}\n"
            f"Cost: {cost_with_cost}\n"
        )
        self.text_display.setText(display_text)

    def plot_best_first_search(self, step, scaled_pos):
        node_name, _, h_value = step["current_node"]
        visited_nodes = step["visited"]
        frontier_nodes = step["frontier"]

        visited_node_names = [node for node, _ in visited_nodes]
        frontier_node_names = [node for node, _ in frontier_nodes]
        path_node_names = [node for node, _ in step["path"]]

        visited_nodes_list = [
            f"({node}, {heuristic})" for node, heuristic in visited_nodes
        ]
        frontier_nodes_list = [
            f"({node}, {heuristic})" for node, heuristic in frontier_nodes
        ]
        path_list = [
            f"({node}, {self.heuristic_values.get(node, '_')})"
            for node, heuristic in step["path"]
        ]

        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=visited_node_names,
            node_color="yellow",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=frontier_node_names,
            node_color="green",
            ax=self.ax,
        )
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=[node_name],
            node_color="orange",
            ax=self.ax,
        )

        path_edges = [
            (step["path"][i][0], step["path"][i + 1][0])
            for i in range(len(step["path"]) - 1)
        ]
        filtered_edges = [
            edge
            for edge in path_edges
            if edge[0] in scaled_pos and edge[1] in scaled_pos
        ]
        print(f"path_edges: {path_edges}")
        print(f"filtered_edges: {filtered_edges}")
        if filtered_edges:
            nx.draw_networkx_edges(
                self.graph,
                scaled_pos,
                edgelist=filtered_edges,
                edge_color="red",
                width=3,
                ax=self.ax,
                arrowstyle="-|>",
                arrows=True,
            )

        if "goal_reached" in step and step["goal_reached"]:
            nx.draw_networkx_nodes(
                self.graph,
                scaled_pos,
                nodelist=path_node_names,
                node_color="blue",
                node_shape="o",
                ax=self.ax,
            )
            nx.draw_networkx_labels(
                self.graph,
                scaled_pos,
                labels={node: node for node in path_node_names},
                font_color="white",
                font_size=10,
                font_weight="bold",
                ax=self.ax,
            )

        heuristic_labels = {
            node: f"{self.heuristic_values.get(node, '_')}" for node in self.graph.nodes
        }
        nx.draw_networkx_labels(
            self.graph,
            pos={node: (x, y - 0.15) for node, (x, y) in scaled_pos.items()},
            labels=heuristic_labels,
            font_color="blue",
            font_size=8,
            ax=self.ax,
        )

        self.ax.set_title(f"BEST-FIRST SEARCH Iteration {step['iteration']}")
        self.canvas.draw()

        formatted_path = [f"({node}, {heuristic})" for node, heuristic in step["path"]]

        display_text = (
            f"Iteration: {step['iteration']}\n"
            f"Current Node: ({node_name}, {h_value})\n"
            f"Visited: {visited_nodes_list}\n"
            f"Frontier: {frontier_nodes_list}\n"
            f"Path: {formatted_path}\n"
            f"Heuristic Values: {h_value}"
        )
        self.text_display.setText(display_text)

    def plot_a_star_search(self, step, scaled_pos):
        node_name, g_cost, h_value = step["current_node"]
        visited_nodes = step["visited"]
        frontier_nodes = step["frontier"]
        path_node_names = [node for node, _, _ in step["path"]]

        visited_node_names = list(visited_nodes.keys())
        frontier_node_names = [node for node, _, _ in frontier_nodes]

        visited_nodes_list = [
            f"({node}, {cost + heuristic(node, self.heuristic_values)})"
            for node, cost in visited_nodes.items()
        ]
        frontier_nodes_list = [
            f"({node}, {cost + heuristic(node, self.heuristic_values)})"
            for node, cost, _ in frontier_nodes
        ]
        path_list = [
            f"({node}, {g_cost + h_value})" for node, g_cost, h_value in step["path"]
        ]

        # Draw visited nodes
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=visited_node_names,
            node_color="yellow",
            ax=self.ax,
        )

        # Draw frontier nodes
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=frontier_node_names,
            node_color="green",
            ax=self.ax,
        )

        # Draw current node
        nx.draw_networkx_nodes(
            self.graph,
            scaled_pos,
            nodelist=[node_name],
            node_color="orange",
            ax=self.ax,
        )

        # Draw all edges with their labels
        nx.draw_networkx_edges(
            self.graph,
            scaled_pos,
            edgelist=self.graph.edges,
            edge_color="black",
            ax=self.ax,
            arrowstyle="-|>",
            arrows=True,
        )
        edge_labels = {(u, v): self.graph[u][v]["weight"] for u, v in self.graph.edges}
        nx.draw_networkx_edge_labels(
            self.graph,
            scaled_pos,
            edge_labels=edge_labels,
            font_color="black",
            label_pos=0.3,
            ax=self.ax,
        )

        path_edges = [
            (step["path"][i][0], step["path"][i + 1][0])
            for i in range(len(step["path"]) - 1)
        ]
        filtered_edges = [
            edge
            for edge in path_edges
            if edge[0] in scaled_pos and edge[1] in scaled_pos
        ]
        print(f"this is path_edges: {path_edges}")
        print(f"this is filtered_edges: {filtered_edges}")
        print(f"this is the step: {step['path']}")

        if filtered_edges:
            for edge in filtered_edges:
                del edge_labels[edge]

            nx.draw_networkx_edges(
                self.graph,
                scaled_pos,
                edgelist=filtered_edges,
                edge_color="red",
                width=3,
                ax=self.ax,
                arrowstyle="-|>",
                arrows=True,
            )

            path_edge_labels = {
                (u, v): self.graph[u][v]["weight"] for u, v in filtered_edges
            }
            nx.draw_networkx_edge_labels(
                self.graph,
                scaled_pos,
                edge_labels=path_edge_labels,
                font_color="red",
                label_pos=0.3,
                ax=self.ax,
            )

        if "goal_reached" in step and step["goal_reached"]:
            nx.draw_networkx_nodes(
                self.graph,
                scaled_pos,
                nodelist=path_node_names,
                node_color="blue",
                node_shape="o",
                ax=self.ax,
            )
            nx.draw_networkx_labels(
                self.graph,
                scaled_pos,
                labels={node: node for node in path_node_names},
                font_color="white",
                font_size=10,
                font_weight="bold",
                ax=self.ax,
            )

        heuristic_labels = {
            node: f"{self.heuristic_values.get(node, '_')}" for node in self.graph.nodes
        }
        nx.draw_networkx_labels(
            self.graph,
            pos={node: (x, y - 0.15) for node, (x, y) in scaled_pos.items()},
            labels=heuristic_labels,
            font_color="blue",
            font_size=8,
            ax=self.ax,
        )

        self.ax.set_title(f"A* SEARCH Iteration {step['iteration']}")
        self.canvas.draw()

        display_text = (
            f"Iteration: {step['iteration']}\n"
            f"Current Node: ({node_name}, {g_cost + h_value})\n"
            # f"Visited: {visited_nodes_list}\n"
            f"Frontier: {frontier_nodes_list}\n"
            f"Path: {path_list}\n"
            # f"Cost: {g_cost}\n"
        )
        self.text_display.setText(display_text)
