import * as vscode from 'vscode'

import { Extension } from '../main'

export class quickInsert {
    extension: Extension

    constructor(extension: Extension) {
        this.extension = extension
    }

    public cleanFormating() {
        if (!vscode.window.activeTextEditor) {
            return
        }
        const editor = vscode.window.activeTextEditor
        editor.edit(editBuilder => {
            for (const selection of editor.selections) {
                const selectedContent = editor.document.getText(selection)
                editBuilder.replace(new vscode.Range(selection.start, selection.end),
                    selectedContent.replaceAll(/(\\.*?\{)/g, "").replaceAll(/(\})/g, ""))
            }
        })

    }
}