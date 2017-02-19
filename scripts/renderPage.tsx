import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefintions,
    IFieldValues,
} from "./pageContracts";
import { WorkItemField, FieldType } from "TFS/WorkItemTracking/Contracts";
import { TextField } from "OfficeFabric/components/TextField/TextField";
import { Label } from "OfficeFabric/components/Label/Label";

class PageControl extends React.Component<{
    control: IPageControl,
    definitions: IFieldDefintions,
    values: IFieldValues
}, void> {
    /** Counter to ensure each id is unique */
    private static counter: number = 0;
    render() {
        const id = `control_${PageControl.counter++}`;

        const control = this.renderControlValue(id);


        return (
            <div className="page-control">
                <Label htmlFor={id} title={this.props.definitions[this.props.control.referenceName].helpText} >{this.props.control.label}</Label>
                {control}
            </div>
        );
    }
    renderControlValue(id: string) {
        const referenceName = this.props.control.referenceName;
        const fieldType = this.props.definitions[referenceName].type;
        switch(fieldType) {
            case FieldType.String:
            return <TextField className="control-value" id={id} value={this.props.values[referenceName] as string} />;
            default:
            return <div className="control-value" id={id}>{`Unable to render field type ${FieldType[fieldType]}`}</div>;
        }
    }
}

class PageGroup extends React.Component<{
    group: IPageGroup,
    definitions: IFieldDefintions,
    values: IFieldValues
}, void> {
    render() {
        let controls = this.props.group.controls.map(control =>
            <PageControl 
                control={control}
                definitions={this.props.definitions}
                values={this.props.values} />);
        return (
            <div className="page-group">
                {controls}
            </div>
        );
    }
}

class PageColumn extends React.Component<{
    column: IPageColumn,
    definitions: IFieldDefintions,
    values: IFieldValues
}, void> {
    render() {
        let groups = this.props.column.groups.map(group => 
            <PageGroup
                group={group}
                definitions={this.props.definitions}
                values={this.props.values} />);
        return (
            <div className="page-column">
                {groups}
            </div>
        );
    }
}

class PageForm extends React.Component<{
    form: IPageForm;
    definitions: IFieldDefintions;
    values: IFieldValues;
}, void> {
    render() {
        let columns = this.props.form.columns.map( column =>
            <PageColumn
                column={column}
                definitions={this.props.definitions}
                values={this.props.values} />
        );
        return (
            <div className="page-form">
                {columns}
            </div>
        );
    }
}

export function renderPage(workItemForm: IPageForm, definitions: IFieldDefintions, values: IFieldValues) {
    ReactDOM.render(<PageForm
        form={workItemForm}
        definitions={definitions}
        values={values} />, document.getElementById("page-wrapper"));
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
