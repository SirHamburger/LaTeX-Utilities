import * as vscode from 'vscode'

import { Extension } from '../main'

export class quickInsert {
    extension: Extension

    constructor(extension: Extension) {
        this.extension = extension
    }
    public bold() {
        if (!vscode.window.activeTextEditor) {
            return
        }
        const editor = vscode.window.activeTextEditor
        editor.edit(editBuilder => {
            for (const selection of editor.selections) 
            {

                
                let textOfNewSelection = editor.document.getText(selection)
                if (editor.document.getText(selection).match(/\\textbf/)) {
                    editBuilder.replace(new vscode.Range(selection.start, selection.end),
                        textOfNewSelection.replace("\\textbf{", "")
                            .replace(/(})(?!.*})/gs, "")
                    )
                }
                else
                {
                    const selectedContent = editor.document.getText(selection)
                    const selectedCommand = '\\textbf{' + selectedContent + "}"
                    editBuilder.replace(new vscode.Range(selection.start, selection.end),
                        selectedCommand.replace(/(.*)(\${\d.*?})/, `$1${selectedContent}`)
                            .replace(/\${\d:?(.*?)}/g, '$1')
                            .replace('\\\\', '\\')
                            .replace(/\$\d/, ''))
                }

                
            }
        })

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