import { IPageForm, IFieldDefinitions } from "./pageContracts";
import { WorkItemType } from "TFS/WorkItemTracking/Contracts";

export interface IEditFormContext {
    form: IPageForm;
    wit: WorkItemType;
    definitions: IFieldDefinitions;
}

export interface IEditFormCallbacks {
    getForm: () => IPageForm;
}
