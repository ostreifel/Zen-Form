import { IPageForm, IFieldDefinitions } from "./pageContracts";

export interface IEditFormContext {
    form: IPageForm;
    definitions: IFieldDefinitions;
}

export interface IEditFormCallbacks {
    getForm: () => IPageForm;
}
