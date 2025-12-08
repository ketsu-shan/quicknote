import Foundation

// Task zone type
enum TaskZone: String, Codable {
    case urgent
    case important
}

// Task model matching the Electron app
struct Task: Codable, Identifiable {
    let id: String
    let text: String
    let completed: Bool
    let createdAt: Double
    let zone: TaskZone
}

// Archived day model
struct ArchivedDay: Codable {
    let date: String
    let tasks: [Task]
    let completedCount: Int
    let totalCount: Int
}

// Widget data structure matching the Electron app
struct WidgetData: Codable {
    let tasks: [Task]
    let archives: [ArchivedDay]
    let theme: String
    let lastUpdated: Double
}

// Data loader for reading from shared file
class TaskDataLoader {
    static let shared = TaskDataLoader()

    private var dataFilePath: URL {
        let home = FileManager.default.homeDirectoryForCurrentUser
        return home
            .appendingPathComponent("Library")
            .appendingPathComponent("Application Support")
            .appendingPathComponent("QuickNote")
            .appendingPathComponent("data.json")
    }

    func loadData() -> WidgetData? {
        guard FileManager.default.fileExists(atPath: dataFilePath.path) else {
            return nil
        }

        do {
            let data = try Data(contentsOf: dataFilePath)
            let decoder = JSONDecoder()
            return try decoder.decode(WidgetData.self, from: data)
        } catch {
            print("Failed to load widget data: \(error)")
            return nil
        }
    }

    // Get incomplete tasks count
    func getIncompleteTasks() -> [Task] {
        guard let data = loadData() else { return [] }
        return data.tasks.filter { !$0.completed }
    }

    // Get urgent incomplete tasks
    func getUrgentTasks() -> [Task] {
        return getIncompleteTasks().filter { $0.zone == .urgent }
    }

    // Get important incomplete tasks
    func getImportantTasks() -> [Task] {
        return getIncompleteTasks().filter { $0.zone == .important }
    }

    // Get progress percentage
    func getProgress() -> Double {
        guard let data = loadData() else { return 0 }
        let total = data.tasks.count
        guard total > 0 else { return 0 }
        let completed = data.tasks.filter { $0.completed }.count
        return Double(completed) / Double(total) * 100
    }

    // Get theme
    func getTheme() -> String {
        return loadData()?.theme ?? "dark"
    }
}
