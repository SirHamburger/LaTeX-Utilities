import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as fse from 'fs-extra'
import { spawn } from 'child_process'
import * as csv from 'csv-parser'
import { Readable } from 'stream'

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
    public replaceImport() {
        //let rootFile = this.extension.workshop.manager.rootFile()
        
        if (vscode.window.activeTextEditor == null)
            return;
        let activeDocumentText = vscode.window.activeTextEditor.document.getText()
        let texRootPos= activeDocumentText.indexOf("% !TeX root =")
        let rootMatch = activeDocumentText.match(/% !TeX root =.*/)
        if (rootMatch == null )
            return
        let activeFilepath = vscode.window.activeTextEditor?.document.uri.fsPath.substr(0, vscode.window.activeTextEditor?.document.uri.fsPath.lastIndexOf('\\'))
        let rootFile = rootMatch[0].replace("% !TeX root = ","")
        rootFile= path.resolve(activeFilepath,rootFile)

        let fileName = rootFile.split('\\')[rootFile.split('\\').length - 1]

        let rootFilePath = rootFile.substr(0, rootFile.lastIndexOf('\\'))
        let activeFilename = vscode.window.activeTextEditor.document.fileName.split('\\')[vscode.window.activeTextEditor.document.fileName.split('\\').length - 1]
        let relativePath = path.relative(rootFilePath, activeFilepath)
        relativePath = relativePath.replaceAll(/(\\)/g, "/")
        rootFile = rootFile.replaceAll(/(\\)/g, "/")
        //activeFilepath = activeFilepath.replaceAll(/(\\)/g,"/")
        if (fileName != "buildOnly.tex")
            return;
        let currentTextDocument = vscode.window.activeTextEditor.document.fileName
        var setting: vscode.Uri = vscode.Uri.parse("file:///" + rootFile);
        let replaceLine = -1;
        let replaceLineEnd = -1
        let latexPath = activeFilepath.replaceAll(/(\\)/g, "/")
        vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
            vscode.window.showTextDocument(a, 1, false).then(e => {
                for (let i = 0; i < e.document.lineCount; i++) {
                    if (e.document.lineAt(i).text.trim() == "%=>") {
                        replaceLine = i + 1
                    }
                    if (e.document.lineAt(i).text.trim() == "%<=") {
                        replaceLineEnd = i - 1
                    }
                }
                if (replaceLine == -1 || replaceLineEnd == -1)
                    return;

                e.edit(edit => {
                    edit.replace(new vscode.Range(new vscode.Position(replaceLine, 0), new vscode.Position(replaceLineEnd, e.document.lineAt(replaceLineEnd).text.length)), "\\subimport{" + relativePath + "/}{" + activeFilename + "}")
                });
                e.document.save()
                vscode.workspace.openTextDocument(currentTextDocument).then((a: vscode.TextDocument) => {
                    vscode.window.showTextDocument(a, 1, false).then(e => { });
                });
            });
        }, (error: any) => {
            console.error(error);
            debugger;
        });
    }
}