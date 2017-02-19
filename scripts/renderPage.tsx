import * as React from "react";
import * as ReactDom from "react-dom";
import { IPageForm, IFieldDefintions, IFieldValues } from "./pageContracts";
import { Dropdown } from "OfficeFabric/components/Dropdown/Dropdown";


export function renderPage(workItemForm: IPageForm, definitions: IFieldDefintions, values: IFieldValues) {
    console.log("Dropdown import: ", Dropdown);
    /**
     * Types to Support
     * - String
     * - Combo String
     * - identity
     * - html
     * - discussion (sort of html)
     * - number
     * - boolean
     */
}