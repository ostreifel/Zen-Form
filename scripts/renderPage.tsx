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
import { FieldType } from "TFS/WorkItemTracking/Contracts";
import { TextField } from "OfficeFabric/components/TextField/TextField";
import { Label } from "OfficeFabric/components/Label/Label";

class PageControl extends React.Component<{
    control: IPageControl,
    definitions: IFieldDefintions,
    values: IFieldValues
}, void> {
    render() {
        let controlValue: JSX.Element;

        const referenceName = this.props.control.referenceName;
        const fieldType = this.props.definitions[referenceName].type;
        const helpText = this.props.definitions[this.props.control.referenceName].helpText;
        const labelText = this.props.control.label;
        switch(fieldType) {
            case FieldType.String:
            controlValue = <TextField
                className="control-value"
                value={this.props.values[referenceName] as string}
                label={labelText}
                title={helpText} />;
            break;
            // TODO more field types here
            default:
            controlValue = <div className="control-value">{`Unable to render field type ${FieldType[fieldType]}`}</div>;
            break;
        }

        return (
            <div className="page-control">
                {controlValue}
            </div>
        );
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
                <Label className="page-group-label">{this.props.group.label}</Label>
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
