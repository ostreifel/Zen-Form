import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinition,
    IFieldDefintions
} from "./pageContracts";

export interface IColumnProperties {
    column: IPageColumn;
    columnIndex: number;
}

export interface IGroupProperties extends IColumnProperties {
    group: IPageGroup;
    groupIndex: number;
}

export interface IControlProperties extends IGroupProperties {
    control: IPageGroup;
    controlIndex: number;
}