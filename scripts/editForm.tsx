import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinition,
    IFieldDefintions
} from "./pageContracts";
import { IColumnProperties, IControlProperties, IGroupProperties } from "./renderEditFormContracts";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { PrimaryButton } from "OfficeFabric/components/Button/PrimaryButton/PrimaryButton";
import { Button } from "OfficeFabric/components/Button/Button";
import { ButtonType } from "OfficeFabric/components/Button";
import { IconButton  } from "OfficeFabric/components/Button";

const configuration: IEditFormContext = VSS.getConfiguration();
const form = configuration.form;

class PageColumn extends React.Component<{options: IColumnProperties }, void> {
    render() {
        return (
            <div className="column">
                {`Column ${this.props.options.columnIndex}`}
                <Button
                    buttonType={ButtonType.hero}
                    icon="Remove"
                >Remove Column</Button>
            </div>
        );
    }
}

class PageForm extends React.Component<{form: IPageForm}, void> {
    render() {
        const columns: JSX.Element[] = this.props.form.columns.map((column, columnIndex) =>
            <PageColumn options={{column, columnIndex}} />
        );
        columns.push(
            <div className="column">
                <Button
                    buttonType={ButtonType.hero}
                    icon="Add"
                    >Add Column
                </Button>
            </div>);
        return <div className="edit-page-form">{columns}</div>;
    }
}

function renderEditPage() {
    ReactDOM.render(<PageForm form={form}/>, document.getElementById("edit-form-wrapper"));
}

const getForm = () => form;
const callbacks: IEditFormCallbacks = {
    getForm
};
renderEditPage();

VSS.register("edit-form", callbacks);
