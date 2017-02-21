import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinition,
    IFieldDefinitions
} from "./pageContracts";
import { IColumnProperties, IControlProperties, IGroupProperties } from "./renderEditFormContracts";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "OfficeFabric/components/Button/Button";
import { ButtonType } from "OfficeFabric/components/Button";
import { Label } from "OfficeFabric/components/Label/Label";
import { TextField } from "OfficeFabric/components/TextField/TextField";
import { Dropdown } from "OfficeFabric/components/Dropdown/Dropdown";

const config: IEditFormContext = VSS.getConfiguration();
const form = config.form;
const definitionsMap = config.definitions;
const definitionsArr = Object.keys(config.definitions).map(k => config.definitions[k]).sort((a, b) => a.name.localeCompare(b.name));

class Control extends React.Component<{options: IControlProperties }, void> {
    render() {
        return (
            <div className="control">
                <TextField className="control-label"
                    label="Label"
                    value={this.props.options.control.label} />
                <Dropdown className="control-field"
                    options={definitionsArr.map(d => {return { key: d.name, text: d.name }; })}
                    selectedKey={definitionsMap[this.props.options.control.referenceName].name}
                    label="Backing field"
                    />
            </div>
        );
    }
}

class Group extends React.Component<{options: IGroupProperties }, void> {
    render() {
        const controls = this.props.options.group.controls.map((control, controlIndex) => 
            <Control options={$.extend({control, controlIndex}, this.props.options)}/>
        );
        controls.push(<div className="control">
            <Button
                buttonType={ButtonType.hero}
                icon="Add"
                onClick={() => {
                    const opts = this.props.options;
                    const defaultField = definitionsArr[0];
                    form.columns[opts.columnIndex].groups[opts.groupIndex].controls.push({ label: defaultField.name, referenceName: defaultField.referenceName });
                    renderEditPage();
                }}>{"Add Control"}</Button>
        </div>);
        return (
            <div className="group">
                <div className="group-header">
                    <TextField className="group-label" value={this.props.options.group.label}/>
                    <Button
                        buttonType={ButtonType.hero}
                        icon="Cancel"
                        title="Remove group"
                        onClick={() => {
                            const opts = this.props.options;
                            form.columns[opts.columnIndex].groups.splice(opts.groupIndex, 1);
                            renderEditPage();
                        }}/>
                </div>
                {controls}
            </div>
        );
    }
}
class Column extends React.Component<{options: IColumnProperties }, void> {
    render() {
        const groups = this.props.options.column.groups.map((group, groupIndex) => 
            <Group options={$.extend({group, groupIndex}, this.props.options)}/>
        );
        groups.push(<div className="group">
            <Button
                buttonType={ButtonType.hero}
                icon="Add"
                onClick={() => {
                    const opts = this.props.options;
                    form.columns[opts.columnIndex].groups.push({ label: "Custom Group", controls: [] });
                    renderEditPage();
                }}>{"Add group"}</Button>
        </div>);
        return (
            <div className="column">
                <div className="column-header">
                    <Label>{`Column ${this.props.options.columnIndex}`}</Label>
                    <Button
                        buttonType={ButtonType.hero}
                        icon="Cancel"
                        title="Remove Column"
                        onClick={() => {
                            form.columns.splice(this.props.options.columnIndex, 1);
                            renderEditPage();
                        }}/>
                </div>
                {groups}
            </div>
        );
    }
}

class PageForm extends React.Component<{form: IPageForm}, void> {
    render() {
        const columns: JSX.Element[] = this.props.form.columns.map((column, columnIndex) =>
            <Column options={{column, columnIndex}} />
        );
        columns.push(
            <div className="column">
                <Button
                    buttonType={ButtonType.hero}
                    icon="Add"
                    title="Add Column"
                    onClick={() => {
                        form.columns.push({groups: []});
                        renderEditPage();
                    }}
                    />
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
