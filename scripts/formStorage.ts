import { IPageForm, IFieldValues, IFieldDefinitions } from "./pageContracts";
import { WorkItemType } from "TFS/WorkItemTracking/Contracts";
import * as Q from "q";

const formCollection = "formCollection";

function getFormId(wit: WorkItemType) {
    const webContext = VSS.getWebContext();
    const projId = webContext.project.id;
    const teamId = webContext.team.id;
    const witId = wit.name;

    return `[${projId}][${teamId}][${witId}]`;
}

// TODO accept params to specify scope
export function getForm(wit: WorkItemType): IPromise<IPageForm> {
    const formId = getFormId(wit);
    return VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
        return dataService.getDocument(formCollection, formId).then(doc => doc, (error: TfsError) => {
            console.log("error getting page form", error);
            // If collection has not been created yet;
            if (Number(error.status) === 404) {
                return fromOobForm(wit.xmlForm);
            }
        });
    });
}

function fromOobForm(xmlFormStr: string): IPageForm {
    console.log("xml form", xmlFormStr);
    const mockForm: IPageForm = { version: 1, id: "mock-form", columns: [{
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
    return mockForm;
}

export function saveForm(form: IPageForm, wit: WorkItemType): IPromise<IPageForm> {
    return Q(form);
    // Don't push test forms to storage just yet
    // return VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
    //     return dataService.createDocument(formCollection, form)
    // });
}