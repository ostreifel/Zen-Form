import { IPageForm } from "./pageContracts";

export interface IEditFormContext {
    form: IPageForm;
}

export interface IEditFormCallbacks {
    getForm: () => IPageForm;
}
