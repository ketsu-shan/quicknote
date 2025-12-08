import SwiftUI

@main
struct QuickNoteWidgetApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 300, height: 200)
    }
}

struct ContentView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(.green)

            Text("QuickNote Widget")
                .font(.title2)
                .fontWeight(.semibold)

            Text("This app provides a widget for your Mac.\nAdd it from the widget gallery.")
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("How to add the widget:")
                    .font(.headline)

                Text("1. Right-click on your desktop")
                Text("2. Select 'Edit Widgets...'")
                Text("3. Search for 'QuickNote'")
                Text("4. Drag the widget to your desktop")
            }
            .font(.caption)
            .foregroundColor(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
        }
        .padding(24)
        .frame(minWidth: 300, minHeight: 280)
    }
}

#Preview {
    ContentView()
}
