#!/bin/bash

# QuickNote Widget Setup Script
# This script helps you set up the Xcode project for the widget

echo "QuickNote Widget Setup"
echo "======================"
echo ""

# Check if xcodegen is installed
if command -v xcodegen &> /dev/null; then
    echo "Found xcodegen, generating Xcode project..."
    xcodegen generate
    echo ""
    echo "Xcode project generated successfully!"
    echo "Open QuickNoteWidget.xcodeproj to build the widget."
else
    echo "xcodegen is not installed."
    echo ""
    echo "Option 1: Install xcodegen and run this script again"
    echo "  brew install xcodegen"
    echo ""
    echo "Option 2: Create the project manually in Xcode"
    echo "  1. Open Xcode"
    echo "  2. File > New > Project"
    echo "  3. Choose 'App' template for macOS"
    echo "  4. Name: QuickNoteWidget"
    echo "  5. File > New > Target"
    echo "  6. Choose 'Widget Extension' for macOS"
    echo "  7. Name: QuickNoteWidgetExtension"
    echo "  8. Copy the Swift files from this directory to the project"
    echo ""
fi

echo ""
echo "After building:"
echo "1. The widget app will be in your Applications or Build folder"
echo "2. Run the app once to register the widget"
echo "3. Right-click desktop > Edit Widgets > Search 'QuickNote'"
echo ""
