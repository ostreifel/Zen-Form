import { IPageForm, IFieldValues, IFieldDefinitions } from "./pageContracts";
import { WorkItemType } from "TFS/WorkItemTracking/Contracts";
import * as Q from "q";

const formCollection = "custom-form-collection2";

function getFormId(wit: WorkItemType) {
    const webContext = VSS.getWebContext();
    const projId = webContext.project.id;
    const userId = webContext.user.id;
    const witId = wit.name;

    return `[${userId}][${projId}][${witId}]`;
}

// TODO accept params to specify scope
export function getForm(wit: WorkItemType): IPromise<IPageForm> {
    const formId = getFormId(wit);
    return VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
        return dataService.getDocument(formCollection, formId).then(doc => {
            sanitizeForm(wit, doc);
            return doc;
        }, (error: TfsError) => {
            console.log("error getting page form", error);
            // If collection has not been created yet;
            if (Number(error.status) === 404) {
                return fromOobForm(wit);
            }
        });
    });
}

function sanitizeForm(wit: WorkItemType, form: IPageForm): void {
    const validFields = {};
    for (let field of wit.fieldInstances) {
        validFields[field.referenceName] = void 0;
    }
    // filter out controls that are not on validFields
    for (let column of form.columns) {
        for (let group of column.groups) {
            for (let i = 0; i < group.controls.length; i++) {
                while (i < group.controls.length && !(group.controls[i].referenceName in validFields)) {
                    group.controls.splice(i, 1);
                }
            }
        }
    }
    // Filter out groups with no controls
    for (let column of form.columns) {
        for (let i = 0; i < column.groups.length; i++) {
            while (i < column.groups.length && column.groups[i].controls.length === 0) {
                column.groups.splice(i, 1);
            }
        }
    }
    // Filter out columns with no groups
    for (let i = 0; i < form.columns.length; i++) {
        while (i < form.columns.length && form.columns[i].groups.length === 0) {
            form.columns.splice(i, 1);
        }
    }
}

export function fromOobForm(wit: WorkItemType): IPageForm {
    const xmlForm = $($.parseXML(wit.xmlForm));
    const firstPage = xmlForm.find("Tab").first();
    const columns = firstPage.find("Column[PercentWidth!=100]").filter((i, c) => $(c).find("Column[PercentWidth!=100]").length === 0 );
    const form: IPageForm = {
        version: 1,
        id: getFormId(wit),
        __etag: -1,
        columns: $.map(columns, column => {
            return {
                groups: $.map($(column).find("Group[Label]"), (group: Node) => {
                    return {
                        label: group.attributes["Label"].value as string,
                        controls: $.map($(group).find("Control"), (control: Node) => {
                            return {
                                label: control.attributes["Label"].value as string,
                                referenceName: control.attributes["FieldName"].value as string
                            };
                        })
                    };
                })
            };
        })
    };
    sanitizeForm(wit, form);
    console.log("using converted form", form);
    return form;
}

export function saveForm(form: IPageForm, wit: WorkItemType): IPromise<IPageForm> {
    form.__etag = -1;
    return VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
        return dataService.setDocument(formCollection, form);
    });
}