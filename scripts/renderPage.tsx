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
import { Combo, IComboOptions } from "VSS/Controls/Combos";
import { BaseControl } from "VSS/Controls";
import { datePickerStrings } from "./datePickerConsts";
import { TagPicker, NormalPeoplePicker } from "OfficeFabric/components/pickers";
import { getIdentities } from "./identities";


class PageControl extends React.Component<{
    control: IPageControl,
    definitions: IFieldDefinitions,
    values: IFieldValues,
    onFieldChange: (refName: string, value) => void
}, void> {
    static counter = 0;
    private richEditor: RichEditor;
    private combo: Combo;
    render() {
        let controlValue: JSX.Element;

        const referenceName = this.props.control.referenceName;
        const field = this.props.definitions[referenceName];
        const fieldValue = this.props.values[referenceName];
        const onChange = this.props.onFieldChange;
        const fieldType = field.type;
        const helpText = field.helpText;
        const labelText = this.props.control.label;
        const allowedValues = field.allowedValues.map(v => String(v));
        const fieldValueStr = typeof fieldValue === undefined || fieldValue === null ? "" : String(fieldValue);

        if (fieldType === FieldType.Html) {
            controlValue = <div className="control-value">
                <Label title={helpText}>{labelText}</Label>
                <div className="html-value"
                    contentEditable={true}
                    ref={elem => {
                        if (elem) {
                            while (elem.firstChild) {
                                elem.removeChild(elem.firstChild);
                            }
                            if (this.richEditor) {
                                console.log("getting richeditor element", referenceName);
                                this.richEditor.getElement().remove();
                            }
                            const richEditorOpts: IRichEditorOptions = {
                                internal: false,
                                change: textArea => {
                                    console.log(textArea);
                                    onChange(referenceName, this.richEditor.getValue());
                                }
                            };
                            this.richEditor = BaseControl.createIn(RichEditor, elem, richEditorOpts) as RichEditor;
                        }
                        this.richEditor.ready(() => this.richEditor.setValue(fieldValue));
                    }}
                ></div>
            </div>;
        } else if (fieldType === FieldType.Boolean) {
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
        } else {
            /**
             * TODO more field types here
             * Types to Support
             * - Combo String
             * - identity
             * - discussion (sort of html)
             * - tree path
             */
            controlValue = <div className="control-value">
                <Label title={helpText}>{labelText}</Label>
                <div
                    ref={elem => {
                        const component: PageControl = this;
                        if (elem) {
                            while (elem.firstChild) {
                                elem.removeChild(elem.firstChild);
                            }
                            const options: IComboOptions = {
                                source: allowedValues,
                                change: function () {
                                    const box: Combo = this;
                                    onChange(referenceName, box.getValue());
                                }
                            };
                            if (allowedValues.length === 0) {
                                options.mode = "text";
                            }
                            if (fieldType === FieldType.DateTime) {
                                options.type = "date-time";
                            }
                            this.combo = BaseControl.createIn(Combo, elem, options) as Combo;
                            if (field.isIdentity) {
                                getIdentities(identities => {
                                    const value = this.combo.getValue() as string;
                                    console.log("updating identities", identities);
                                    while (elem.firstChild) {
                                        elem.removeChild(elem.firstChild);
                                    }
                                    options.source = identities;
                                    options.value = value;
                                    delete options.mode;
                                    this.combo = BaseControl.createIn(Combo, elem, options) as Combo;
                                });
                            }
                        }
                        console.log("getting combo element", referenceName);
                        // Don't react to own fire events
                        if (this.combo.getElement().find(":focus").length === 0) {
                            this.combo.setText(fieldValueStr, false);
                        }
                    }}
                ></div>
            </div>;
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
        let columns = this.props.form.columns.map(column =>
            <PageColumn
                column={column}
                definitions={this.props.definitions}
                values={this.props.values}
                onFieldChange={this.props.onFieldChange} />
        );
        return (
            <div className="page-form">
                <PageHeader form={this.props.form} openEditFormDialog={this.props.openEditFormDialog} />
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
        const webContext = VSS.getWebContext();
        return (
            <div className="page-header">
                <PrimaryButton
                    className="open-dialog-button"
                    onClick={this.props.openEditFormDialog}>
                    {"Customize Page"}
                </PrimaryButton>
                <Label className="form-scope-label">{`Viewing as ${webContext.team.name}`}</Label>
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
