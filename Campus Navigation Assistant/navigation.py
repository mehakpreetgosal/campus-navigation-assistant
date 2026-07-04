import heapq

def shortest_path(graph, start, end):

    queue = [(0, start, [])]
    visited = set()

    while queue:

        cost, node, path = heapq.heappop(queue)

        if node in visited:
            continue

        visited.add(node)

        path = path + [node]

        if node == end:
            return cost, path

        for neighbour, distance in graph[node].items():
            heapq.heappush(
                queue,
                (cost + distance, neighbour, path)
            )

    return None