import { FieldType } from "TFS/WorkItemTracking/Contracts";

export interface IPageForm {
    /** Form is persisted so it may need to be uppgraded from time to time */
    version: number;
    id: string;
    description?: string;
    __etag: -1;
    columns: IPageColumn[];
}
export interface IPageColumn {
    groups: IPageGroup[];
}
export interface IPageGroup {
    label?: string;
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
export interface IFieldDefinitions {
    [referenceName: string]: IFieldDefinition;
}
export interface IFieldDefinition {
    readonly: boolean;
    type: FieldType;
    helpText: string;
    name: string;
    referenceName: string;
    allowedValues: string[];
    isIdentity: boolean;
}