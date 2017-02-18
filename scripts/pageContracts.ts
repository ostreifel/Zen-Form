import { WorkItemField, FieldType } from "TFS/WorkItemTracking/Contracts";

export interface IPageForm {
    /** Form is persisted so it may need to be uppgraded from time to time */
    version: string;
    fields: string[];
}
export interface IFieldValues {
    [referenceName: string]: Object;
}
export interface IFieldDefintions {
    [referenceName: string]: IFieldDefinion;
}
export interface IFieldDefinion {
    readonly: boolean;
    type: FieldType;
    helpText: string;
}