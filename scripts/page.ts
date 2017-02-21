/// <reference types="../node_modules/vss-web-extension-sdk" />

import {
    IWorkItemNotificationListener,
    IWorkItemLoadedArgs,
    IWorkItemFieldChangedArgs,
    IWorkItemChangedArgs
} from "TFS/WorkItemTracking/ExtensionContracts";
import {
    WorkItemFormService,
    IWorkItemFormService
} from "TFS/WorkItemTracking/Services";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemType, WorkItemField } from "TFS/WorkItemTracking/Contracts";
import { IPageForm, IFieldValues, IFieldDefinitions } from "./pageContracts";
import { renderPage } from "./renderPage";
import { openEditFormDialog } from "./openEditFormDialog";

export class Page implements IWorkItemNotificationListener {
    public static create(container: JQuery): IPromise<Page> {
        return WorkItemFormService.getService().then(service => {
            return service.getFieldValue("System.WorkItemType").then((typeName: string) => {
                const projName = VSS.getWebContext().project.name;
                return getClient().getWorkItemType(projName, typeName).then(wit => {
                    return service.getFields().then(fields => {
                        return new Page(container, service, fields, wit);
                    });
                });
            });
        });
    }


    private readonly fieldDefinitions: IFieldDefinitions = {};
    private constructor(readonly container: JQuery,
                        readonly service: IWorkItemFormService,
                        readonly witFields: WorkItemField[],
                        readonly wit: WorkItemType) {
        const fieldTypesDictionary: {[refName: string]: WorkItemField} = {};
        for (let field of this.witFields) {
            fieldTypesDictionary[field.referenceName] = field;
        }
        for (let field of this.wit.fieldInstances) {
            this.fieldDefinitions[field.referenceName] = {
                helpText: field.helpText,
                readonly: fieldTypesDictionary[field.referenceName].readOnly,
                type: fieldTypesDictionary[field.referenceName].type,
                name: fieldTypesDictionary[field.referenceName].name,
                referenceName: fieldTypesDictionary[field.referenceName].referenceName
            };
        }
    }
    private onFormChanged(form: IPageForm) {
        console.log("TODO: update page with new form here", form);
        this.renderPage(form);
    }
    public onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): void {
        this.service.getFields().then(fields => {});
        const mockForm: IPageForm = { version: 1, columns: [{
            groups: [{
                label: "Group1",
                controls: [{
                    label: "Title Field",
                    referenceName: "System.Title"
                }]
            }, {
                label: "Group2",
                controls: [{
                    label: "Title Field2",
                    referenceName: "System.Title"
                }]
            }]
        }, {
            groups: [{
                label: "Group3",
                controls: [{
                    label: "Title Field3",
                    referenceName: "System.Title"
                }]
            }]
        }]};
        this.renderPage(mockForm);
    }
    public onFieldChanged(fieldChangedArgs: IWorkItemFieldChangedArgs): void { }
    public onSaved(savedEventArgs: IWorkItemChangedArgs): void { }
    public onRefreshed(refreshEventArgs: IWorkItemChangedArgs): void { }
    public onReset(undoEventArgs: IWorkItemChangedArgs): void { }
    public onUnloaded(unloadedEventArgs: IWorkItemChangedArgs): void { }

    private openDialog(form: IPageForm) {
        openEditFormDialog(form, this.fieldDefinitions, (form) => this.onFormChanged(form));
    }
    private getWitFieldValues(): IPromise<IFieldValues> {
        return this.service.getFieldValues(Object.keys(this.fieldDefinitions));
    }
    private renderPage(form: IPageForm) {
        this.getWitFieldValues().then(values => {
            renderPage(form, this.fieldDefinitions, values, () => this.openDialog(form));
        });
    }


}
