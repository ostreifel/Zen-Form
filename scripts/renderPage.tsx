import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefintions,
    IFieldValues
} from "./pageContracts";
import { FieldType } from "TFS/WorkItemTracking/Contracts";
import { openEditFormDialog } from "./openEditFormDialog";
import { TextField } from "OfficeFabric/components/TextField/TextField";
import { Label } from "OfficeFabric/components/Label/Label";
import { PrimaryButton } from "OfficeFabric/components/Button/PrimaryButton/PrimaryButton";


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
        switch (fieldType) {
            case FieldType.String:
            controlValue = <TextField
                className="control-value"
                value={this.props.values[referenceName] as string}
                label={labelText}
                title={helpText} />;
            break;
            /**
             * TODO more field types here
             * Types to Support
             * - Combo String
             * - identity
             * - html
             * - discussion (sort of html)
             * - number
             * - boolean
             */
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
        const groupElems = this.props.group.controls.map(control =>
            <PageControl
                control={control}
                definitions={this.props.definitions}
                values={this.props.values} />);
        if (this.props.group.label) {
            groupElems.unshift(
                <Label className="page-group-label">{this.props.group.label}</Label>
            );
        }
        return (
            <div className="page-group">
                {groupElems}
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
    onFormUpdated: (form: IPageForm) => void;
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
                <PageHeader form={this.props.form} onFormUpdated={this.props.onFormUpdated}/>
                <div className="page-columns">
                    {columns}
                </div>
            </div>
        );
    }
}

class PageHeader extends React.Component<{
    form: IPageForm;
    onFormUpdated: (form: IPageForm) => void
}, void> {
    render() {
        return (
            <div className="page-header">
                <PrimaryButton
                    className="open-dialog-button"
                    onClick={() => openEditFormDialog(this.props.form, this.props.onFormUpdated)}>
                        {"Customize Page"}
                </PrimaryButton>
                <div className="feedback">
                    <a href={"https://marketplace.visualstudio.com/items?itemName=ottostreifel.customize-team-form"} target={"_blank"}>Review</a>{" | "}
                    <a href={"https://github.com/ostreifel/zen-form/issues"} target={"_blank"}>Report an issue</a>
                </div>
            </div>
        );
    }
}

export function renderPage(workItemForm: IPageForm, definitions: IFieldDefintions, values: IFieldValues, onFormUpdated: (form: IPageForm) => void) {
    ReactDOM.render(<PageForm
        form={workItemForm}
        definitions={definitions}
        values={values}
        onFormUpdated={onFormUpdated} />, document.getElementById("page-wrapper"));
}
