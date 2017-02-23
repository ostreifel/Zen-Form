import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinitions,
    IFieldValues
} from "./pageContracts";
import { FieldType } from "TFS/WorkItemTracking/Contracts";
import { DatePicker, DayOfWeek } from "OfficeFabric/components/DatePicker";
import { TextField } from "OfficeFabric/components/TextField";
import { Toggle } from "OfficeFabric/components/Toggle";
import { Label } from "OfficeFabric/components/Label";
import { PrimaryButton } from "OfficeFabric/components/Button";
import { RichEditor, IRichEditorOptions } from "VSS/Controls/RichEditor";
import { BaseControl } from "VSS/Controls";
import { datePickerStrings } from "./datePickerConsts";


class PageControl extends React.Component<{
    control: IPageControl,
    definitions: IFieldDefinitions,
    values: IFieldValues,
    onFieldChange: (refName: string, value) => void
}, void> {
    static counter = 0;
    private richEditor: RichEditor;
    render() {
        let controlValue: JSX.Element;

        const referenceName = this.props.control.referenceName;
        const field = this.props.definitions[referenceName];
        const fieldValue = this.props.values[referenceName];
        const onChange = this.props.onFieldChange;
        const fieldType = field && field.type;
        const helpText = field && field.helpText;
        const labelText = this.props.control.label;
        switch (fieldType) {
            case FieldType.Html:
            controlValue = <div className="control-value">
                <Label title={helpText}>{labelText}</Label>
                <div className="html-value"
                    contentEditable={true}
                    ref={elem => {
                        if (elem && elem.children.length === 0) {
                            const richEditorOpts: IRichEditorOptions = {
                                internal: false,
                                change: textArea => onChange(referenceName, textArea.val())
                            };
                            this.richEditor = BaseControl.createIn(RichEditor, $("<div/>"), richEditorOpts) as RichEditor;
                            elem.appendChild(this.richEditor._element[0]);
                        }
                        this.richEditor.ready(() => this.richEditor.setValue(fieldValue));
                    }}
                    ></div>
            </div>;
            break;
            case FieldType.String:
            controlValue = <TextField
                className="control-value"
                value={fieldValue as string}
                label={labelText}
                onChanged={value => onChange(referenceName, value)}
                title={helpText} />;
            break;
            case FieldType.Integer:
            controlValue = <TextField
                className="control-value"
                value={typeof fieldValue === undefined || fieldValue === null ? "" : String(fieldValue)}
                label={labelText}
                title={helpText}
                onChanged={value => onChange(referenceName, value)}
                onGetErrorMessage={value => {
                    if (value !== fieldValue) {
                        onChange(referenceName, value);
                    }
                    return value === "" || value.match(/^\d+$/) ? "" : "Value must be a integer";
                }}
            />;
            break;
            case FieldType.Double:
            controlValue = <TextField
                className="control-value"
                value={typeof fieldValue === undefined || fieldValue === null ? "" : String(fieldValue)}
                label={labelText}
                title={helpText}
                onChanged={value => onChange(referenceName, value)}
                onGetErrorMessage={value => {
                    if (value !== fieldValue) {
                        onChange(referenceName, value);
                    }
                    return value === "" || value.match(/^\d*\.?\d*$/) ? "" : "Value must be a double";
                }}
            />;
            break;
            case FieldType.DateTime:
            controlValue = <DatePicker
                    label={labelText}
                    allowTextInput={true}
                    firstDayOfWeek={ DayOfWeek.Sunday }
                    strings={ datePickerStrings }
                    onSelectDate={value => onChange(referenceName, value)}
                    value={typeof fieldValue === undefined || fieldValue === null ? null : new Date(fieldValue)}
            />;
            break;
            case FieldType.Boolean:
            controlValue = <Toggle
                    label={labelText}
                    className="control-value"
                    title={helpText}
                    onChanged={value => {
                        console.log("toggle changed");
                        onChange(referenceName, value);
                    }}
                    checked={fieldValue as boolean}
            />;
            break;
            /**
             * TODO more field types here
             * Types to Support
             * - Combo String
             * - identity
             * - discussion (sort of html)
             * - tree path
             */
            default:
            controlValue = <div className="control-value">
                {`Unable to render field type ${FieldType[fieldType]} (${referenceName})`}
            </div>;
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
    definitions: IFieldDefinitions,
    values: IFieldValues,
    onFieldChange: (refName: string, value) => void
}, void> {
    render() {
        const groupElems = this.props.group.controls.map(control =>
            <PageControl
                control={control}
                definitions={this.props.definitions}
                values={this.props.values}
                onFieldChange={this.props.onFieldChange} />);
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
    definitions: IFieldDefinitions,
    values: IFieldValues,
    onFieldChange: (refName: string, value) => void
}, void> {
    render() {
        let groups = this.props.column.groups.map(group =>
            <PageGroup
                group={group}
                definitions={this.props.definitions}
                values={this.props.values}
                onFieldChange={this.props.onFieldChange} />);
        return (
            <div className="page-column">
                {groups}
            </div>
        );
    }
}

class PageForm extends React.Component<{
    form: IPageForm,
    definitions: IFieldDefinitions,
    values: IFieldValues,
    openEditFormDialog: () => void,
    onFieldChange: (refName: string, value) => void
}, void> {
    render() {
        let columns = this.props.form.columns.map( column =>
            <PageColumn
                column={column}
                definitions={this.props.definitions}
                values={this.props.values}
                onFieldChange={this.props.onFieldChange} />
        );
        return (
            <div className="page-form">
                <PageHeader form={this.props.form} openEditFormDialog={this.props.openEditFormDialog}/>
                <div className="page-columns">
                    {columns}
                </div>
            </div>
        );
    }
}

class PageHeader extends React.Component<{
    form: IPageForm;
    openEditFormDialog: () => void;
}, void> {
    render() {
        return (
            <div className="page-header">
                <PrimaryButton
                    className="open-dialog-button"
                    onClick={this.props.openEditFormDialog}>
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

export function renderPage(workItemForm: IPageForm,
                           definitions: IFieldDefinitions,
                           values: IFieldValues,
                           openEditFormDialog: () => void,
                           onFieldChange: (refName: string, value) => void) {
    ReactDOM.render(<PageForm
        form={workItemForm}
        definitions={definitions}
        values={values}
        openEditFormDialog={openEditFormDialog}
        onFieldChange={onFieldChange} />, document.getElementById("page-wrapper"));
}
