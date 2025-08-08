// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerColorProvider(
			{ language: 'minimeters-ini' },
			new IniColorProvider()
		)
	);

	context.subscriptions.push(
		vscode.languages.registerColorProvider(
			{ language: 'minimeters-map' },
			new MapColorProvider()
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }

class IniColorProvider implements vscode.DocumentColorProvider {
	provideDocumentColors(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.ColorInformation[]> {
		const colors: vscode.ColorInformation[] = [];
		const regex = /(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d{1,3}))?/g;

		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i);
			let match: RegExpExecArray | null;

			while ((match = regex.exec(line.text)) !== null) {
				const r = parseInt(match[1]) / 255;
				const g = parseInt(match[2]) / 255;
				const b = parseInt(match[3]) / 255;
				const a = match[4] ? parseInt(match[4]) / 255 : 1;

				const start = match.index;
				const end = match.index + match[0].length;

				const range = new vscode.Range(i, start, i, end);
				const color = new vscode.Color(r, g, b, a);

				colors.push(new vscode.ColorInformation(range, color));
			}
		}

		return colors;
	}

	provideColorPresentations(
		color: vscode.Color,
		context: { document: vscode.TextDocument; range: vscode.Range },
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.ColorPresentation[]> {
		const r = Math.round(color.red * 255);
		const g = Math.round(color.green * 255);
		const b = Math.round(color.blue * 255);
		const a = color.alpha;

		let label = a < 1 ? `${r}, ${g}, ${b}, ${Math.round(a * 255)}` : `${r}, ${g}, ${b}`;

		return [new vscode.ColorPresentation(label)];
	}
}

class MapColorProvider implements vscode.DocumentColorProvider {
	provideDocumentColors(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.ColorInformation[]> {
		const colors: vscode.ColorInformation[] = [];
		const rgbRegex = /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;
		const rgbaRegex = /rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;

		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i);
			let match: RegExpExecArray | null;

			while ((match = rgbRegex.exec(line.text)) !== null) {
				const r = parseInt(match[1]) / 255;
				const g = parseInt(match[2]) / 255;
				const b = parseInt(match[3]) / 255;
				const a = 1;

				const range = new vscode.Range(i, match.index, i, match.index + match[0].length);
				const color = new vscode.Color(r, g, b, a);
				colors.push(new vscode.ColorInformation(range, color));
			}

			while ((match = rgbaRegex.exec(line.text)) !== null) {
				const r = parseInt(match[1]) / 255;
				const g = parseInt(match[2]) / 255;
				const b = parseInt(match[3]) / 255;
				const a = parseInt(match[4]) / 255;  // Note: 0–255 → 0–1

				const range = new vscode.Range(i, match.index, i, match.index + match[0].length);
				const color = new vscode.Color(r, g, b, a);
				colors.push(new vscode.ColorInformation(range, color));
			}
		}

		return colors;
	}

	provideColorPresentations(
		color: vscode.Color,
		context: { document: vscode.TextDocument; range: vscode.Range },
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.ColorPresentation[]> {
		const r = Math.round(color.red * 255);
		const g = Math.round(color.green * 255);
		const b = Math.round(color.blue * 255);
		const a = color.alpha;

		let label = a < 1
		? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 255)})`
		: `rgba(${r}, ${g}, ${b}, 255)`;

		return [new vscode.ColorPresentation(label)];
	}
}
