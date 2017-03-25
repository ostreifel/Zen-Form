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
import { Checkbox } from "OfficeFabric/components/CheckBox";
import { Label } from "OfficeFabric/components/Label";
import { PrimaryButton } from "OfficeFabric/components/Button";
import { DatePicker, DayOfWeek } from "OfficeFabric/components/DatePicker";
import { RichEditor, IRichEditorOptions } from "VSS/Controls/RichEditor";
import { Combo, IComboOptions } from "VSS/Controls/Combos";
import { BaseControl } from "VSS/Controls";
import { getIdentities } from "./identities";
import { datePickerStrings } from "./datePickerConstants";


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
                        if (elem && (!this.richEditor || !$.contains(elem, this.richEditor.getElement()[0]))) {
                            console.log("creating richtext editor", referenceName);
                            while (elem.firstChild) {
                                elem.removeChild(elem.firstChild);
                            }
                            if (this.richEditor) {
                                this.richEditor.getElement().remove();
                            }
                            const richEditorOpts: IRichEditorOptions = {
                                internal: false,
                                change: textArea => {
                                    console.log(textArea);
                                    onChange(referenceName, this.richEditor.getValue());
                                },
                                fireOnEveryChange: true
                            };
                            this.richEditor = BaseControl.createIn(RichEditor, elem, richEditorOpts) as RichEditor;
                        }
                        this.richEditor.ready(() => {
                            if (!this.richEditor.hasFocus()) {
                                this.richEditor.setValue(fieldValue);
                            }
                        });
                    }}
                ></div>
            </div>;
        } else if (fieldType === FieldType.Boolean) {
            controlValue = <Checkbox
                label={labelText}
                className="control-value"
                title={helpText}
                onChange={value => {
                    console.log("toggle changed");
                    onChange(referenceName, value.target.checked);
                }}
                checked={fieldValue as boolean}
            />;
        } else if (fieldType === FieldType.DateTime) {
            controlValue = <DatePicker
                                label={labelText}
                                firstDayOfWeek={ DayOfWeek.Sunday }
                                strings={ datePickerStrings }
                                onSelectDate={value => onChange(referenceName, value)}
                                allowTextInput={true}
                                value={typeof fieldValue === undefined || fieldValue === null ? null : new Date(fieldValue)}
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
                        if (elem && (!this.combo || !$.contains(elem, this.combo.getElement()[0]))) {
                            console.log("creating combo", referenceName);
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
                    <a href={"https://github.com/ostreifel/zen-form/issues"} target={"_blank"}>Report an issue</a>{" | "}
                    <a href={"mailto:zenform@microsoft.com"} target={"_blank"}>Feedback and Suggestions</a>
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
