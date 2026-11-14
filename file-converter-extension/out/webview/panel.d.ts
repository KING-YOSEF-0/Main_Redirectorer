import * as vscode from 'vscode';
export declare class ConverterPanel implements vscode.Disposable {
    private panel;
    private readonly extensionContext;
    constructor(context: vscode.ExtensionContext);
    show(): void;
    dispose(): void;
    private getHtmlContent;
}
//# sourceMappingURL=panel.d.ts.map