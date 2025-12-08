import WidgetKit
import SwiftUI

// Timeline Entry
struct TaskEntry: TimelineEntry {
    let date: Date
    let urgentTasks: [Task]
    let importantTasks: [Task]
    let progress: Double
    let theme: String
}

// Timeline Provider
struct TaskProvider: TimelineProvider {
    func placeholder(in context: Context) -> TaskEntry {
        TaskEntry(
            date: Date(),
            urgentTasks: [
                Task(id: "1", text: "Sample urgent task", completed: false, createdAt: 0, zone: .urgent)
            ],
            importantTasks: [
                Task(id: "2", text: "Sample important task", completed: false, createdAt: 0, zone: .important)
            ],
            progress: 50,
            theme: "dark"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TaskEntry) -> Void) {
        let entry = createEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TaskEntry>) -> Void) {
        let entry = createEntry()
        // Refresh every 5 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func createEntry() -> TaskEntry {
        let loader = TaskDataLoader.shared
        return TaskEntry(
            date: Date(),
            urgentTasks: Array(loader.getUrgentTasks().prefix(3)),
            importantTasks: Array(loader.getImportantTasks().prefix(3)),
            progress: loader.getProgress(),
            theme: loader.getTheme()
        )
    }
}

// Progress bar color based on percentage
func getProgressColor(_ progress: Double) -> Color {
    if progress >= 100 { return Color(red: 52/255, green: 211/255, blue: 153/255) } // emerald
    if progress >= 70 { return Color(red: 74/255, green: 222/255, blue: 128/255) } // green
    if progress >= 50 { return Color(red: 250/255, green: 204/255, blue: 21/255) } // yellow
    if progress >= 30 { return Color(red: 251/255, green: 146/255, blue: 60/255) } // orange
    return Color(red: 248/255, green: 113/255, blue: 113/255) } // red

// Small Widget View
struct SmallWidgetView: View {
    let entry: TaskEntry

    var isDark: Bool { entry.theme == "dark" }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Text("QuickNote")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(isDark ? .white.opacity(0.9) : .black.opacity(0.9))
                Spacer()
                Text("\(Int(entry.progress))%")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(isDark ? .white.opacity(0.5) : .black.opacity(0.5))
            }

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(isDark ? Color.white.opacity(0.1) : Color.black.opacity(0.1))
                        .frame(height: 4)
                    RoundedRectangle(cornerRadius: 2)
                        .fill(getProgressColor(entry.progress))
                        .frame(width: geo.size.width * entry.progress / 100, height: 4)
                }
            }
            .frame(height: 4)

            Spacer(minLength: 4)

            // Task count
            let totalUrgent = entry.urgentTasks.count
            let totalImportant = entry.importantTasks.count

            if totalUrgent > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 9))
                        .foregroundColor(.red.opacity(0.8))
                    Text("\(totalUrgent) urgent")
                        .font(.system(size: 10))
                        .foregroundColor(isDark ? .white.opacity(0.7) : .black.opacity(0.7))
                }
            }

            if totalImportant > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 9))
                        .foregroundColor(.orange.opacity(0.8))
                    Text("\(totalImportant) important")
                        .font(.system(size: 10))
                        .foregroundColor(isDark ? .white.opacity(0.7) : .black.opacity(0.7))
                }
            }

            if totalUrgent == 0 && totalImportant == 0 {
                Text("All done!")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(red: 52/255, green: 211/255, blue: 153/255))
            }

            Spacer()
        }
        .padding(12)
        .background(
            isDark
                ? Color(red: 30/255, green: 41/255, blue: 59/255).opacity(0.95)
                : Color.white.opacity(0.95)
        )
    }
}

// Medium Widget View
struct MediumWidgetView: View {
    let entry: TaskEntry

    var isDark: Bool { entry.theme == "dark" }

    var body: some View {
        HStack(spacing: 12) {
            // Urgent section
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.red.opacity(0.8))
                    Text("Urgent")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(isDark ? .white.opacity(0.8) : .black.opacity(0.8))
                }

                if entry.urgentTasks.isEmpty {
                    Text("No urgent tasks")
                        .font(.system(size: 10))
                        .foregroundColor(isDark ? .white.opacity(0.4) : .black.opacity(0.4))
                        .italic()
                } else {
                    ForEach(entry.urgentTasks.prefix(3)) { task in
                        HStack(spacing: 4) {
                            Circle()
                                .stroke(Color.red.opacity(0.5), lineWidth: 1)
                                .frame(width: 8, height: 8)
                            Text(task.text)
                                .font(.system(size: 10))
                                .foregroundColor(isDark ? .white.opacity(0.7) : .black.opacity(0.7))
                                .lineLimit(1)
                        }
                    }
                }

                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Divider
            Rectangle()
                .fill(isDark ? Color.white.opacity(0.1) : Color.black.opacity(0.1))
                .frame(width: 1)

            // Important section
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.orange.opacity(0.8))
                    Text("Important")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(isDark ? .white.opacity(0.8) : .black.opacity(0.8))
                }

                if entry.importantTasks.isEmpty {
                    Text("No important tasks")
                        .font(.system(size: 10))
                        .foregroundColor(isDark ? .white.opacity(0.4) : .black.opacity(0.4))
                        .italic()
                } else {
                    ForEach(entry.importantTasks.prefix(3)) { task in
                        HStack(spacing: 4) {
                            Circle()
                                .stroke(Color.orange.opacity(0.5), lineWidth: 1)
                                .frame(width: 8, height: 8)
                            Text(task.text)
                                .font(.system(size: 10))
                                .foregroundColor(isDark ? .white.opacity(0.7) : .black.opacity(0.7))
                                .lineLimit(1)
                        }
                    }
                }

                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(12)
        .background(
            isDark
                ? Color(red: 30/255, green: 41/255, blue: 59/255).opacity(0.95)
                : Color.white.opacity(0.95)
        )
    }
}

// Widget Entry View
struct QuickNoteWidgetEntryView: View {
    var entry: TaskProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// Widget Configuration
@main
struct QuickNoteWidget: Widget {
    let kind: String = "QuickNoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TaskProvider()) { entry in
            QuickNoteWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("QuickNote")
        .description("View your urgent and important tasks")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// Preview
struct QuickNoteWidget_Previews: PreviewProvider {
    static var previews: some View {
        QuickNoteWidgetEntryView(
            entry: TaskEntry(
                date: Date(),
                urgentTasks: [
                    Task(id: "1", text: "Complete project report", completed: false, createdAt: 0, zone: .urgent),
                    Task(id: "2", text: "Call client", completed: false, createdAt: 0, zone: .urgent)
                ],
                importantTasks: [
                    Task(id: "3", text: "Review design docs", completed: false, createdAt: 0, zone: .important)
                ],
                progress: 65,
                theme: "dark"
            )
        )
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
