import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinition,
    IFieldDefintions
} from "./pageContracts";
import * as React from "react";
import * as ReactDOM from "react-dom";

const configuration: IEditFormContext = VSS.getConfiguration();
const form = configuration.form;


class PageForm extends React.Component<{}, {a: number}> {
    render() {
        return <div>{"Hello from react"}</div>;
    }
}

function renderEditPage() {
    ReactDOM.render(<PageForm/>, document.getElementById("edit-form-wrapper"));
}

const getForm = () => form;
const callbacks: IEditFormCallbacks = {
    getForm
};
renderEditPage();

VSS.register("edit-form", callbacks);
