import { WorkItemField, FieldType } from "TFS/WorkItemTracking/Contracts";

export interface IPageForm {
    /** Form is persisted so it may need to be uppgraded from time to time */
    version: string;
    columns: IPageColumn[];
}
export interface IPageColumn {
    groups: IPageGroup[];
}
export interface IPageGroup {
    label: string;
    controls: IPageControl[];
}
export interface IPageControl {
    label: string;
    referenceName: string;
}
export interface IFieldValues {
    [referenceName: string]: IFieldValue;
}
export type IFieldValue = Object;
export interface IFieldDefintions {
    [referenceName: string]: IFieldDefinion;
}
export interface IFieldDefinion {
    readonly: boolean;
    type: FieldType;
    helpText: string;
}