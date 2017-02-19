/// <reference types="../node_modules/vss-web-extension-sdk" />

import {
    IWorkItemNotificationListener,
    IWorkItemLoadedArgs,
    IWorkItemFieldChangedArgs,
    IWorkItemChangedArgs,
} from "TFS/WorkItemTracking/ExtensionContracts";
import {
    WorkItemFormService,
    IWorkItemFormService,
} from "TFS/WorkItemTracking/Services";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemType, WorkItemField } from "TFS/WorkItemTracking/Contracts";
import { IPageForm } from "./pageContracts";
import { renderPage } from "./renderPage";

export class Page implements IWorkItemNotificationListener {
    public static create(container: JQuery): IPromise<Page> {
        const page = new Page(container);
        return WorkItemFormService.getService().then(service => {
            return service.getFieldValue("System.WorkItemType").then((typeName: string) => {
                const projName = VSS.getWebContext().project.name;
                return getClient().getWorkItemType(projName, typeName).then(type => {
                    page.service = service;
                    page.wit = type;
                    return page;
                });
            });
        });
    }

    private service: IWorkItemFormService;
    private fields: WorkItemField;
    private wit: WorkItemType;
    private constructor(readonly container: JQuery) { }
    public onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): void {
        this.service.getFields().then(fields => {});
        const mockForm: IPageForm = { version: "0.1.0", fields: ["System.Title", "System.State"]};
        renderPage(mockForm, {}, {});
    }
    public onFieldChanged(fieldChangedArgs: IWorkItemFieldChangedArgs): void { }
    public onSaved(savedEventArgs: IWorkItemChangedArgs): void { }
    public onRefreshed(refreshEventArgs: IWorkItemChangedArgs): void { }
    public onReset(undoEventArgs: IWorkItemChangedArgs): void { }
    public onUnloaded(unloadedEventArgs: IWorkItemChangedArgs): void { }

}
