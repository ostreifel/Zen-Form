import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";
import { IPageForm } from "./pageContracts";
import { IColumnProperties, IControlProperties, IGroupProperties } from "./renderEditFormContracts";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ButtonType, Button } from "OfficeFabric/components/Button";
import { Label } from "OfficeFabric/components/Label";
import { TextField } from "OfficeFabric/components/TextField";
import { Dropdown } from "OfficeFabric/components/Dropdown";
import { Dialog, DialogType, DialogFooter } from "OfficeFabric/components/Dialog";

const config: IEditFormContext = VSS.getConfiguration();
const form = config.form;
const definitionsMap = config.definitions;
const definitionsArr = Object.keys(config.definitions).map(k => config.definitions[k]).sort((a, b) => a.name.localeCompare(b.name));

class Control extends React.Component<{options: IControlProperties }, {showDialog: boolean, label: string, refName: string}> {
    constructor() {
        super();
        this.state = {showDialog: false, label: "", refName: ""};
    }
    render() {
        return (
            <div className="control">
                <Button
                    className="control-button"
                    onClick={() => this._showDialog()}
                >{this.props.options.control.label}</Button>
                <Button
                    className="control-remove"
                    buttonType={ButtonType.hero}
                    icon="Cancel"
                    title="Remove group"
                    onClick={() => {
                        const opts = this.props.options;
                        form.columns[opts.columnIndex].groups[opts.groupIndex].controls.splice(opts.columnIndex, 1);
                        renderEditPage();
                    }}/>
                
                <Dialog
                    isOpen={ this.state.showDialog }
                    type={ DialogType.normal }
                    onDismiss={ () => this._closeDialog() }
                    title="Edit Control"
                    isBlocking={ false }
                    containerClassName="ui-dialog"
                >
                    <TextField className="control-label"
                        label="Label"
                        onChanged={(newValue) => this.setState($.extend(this.state, {label: newValue}))}
                        value={this.state.label} />
                    <Dropdown className="control-field"
                        options={definitionsArr.map(d => {return { key: d.referenceName, text: d.name }; })}
                        selectedKey={this.state.refName}
                        onChanged={(item) => {
                            const fieldRefName = String(item.key);
                            const label = definitionsMap[fieldRefName].name;
                            this.setState($.extend(this.state, {refName: fieldRefName, label: label}));
                        }}
                        label="Backing field"
                        />
                        
                    <DialogFooter>
                        <Button buttonType={ ButtonType.primary } onClick={ () => this._saveControl() }>Save</Button>
                        <Button onClick={ () => this._closeDialog() }>Cancel</Button>
                    </DialogFooter>
                </Dialog>
            </div>
        );
    }
    private _saveControl() {
        const opts = this.props.options;
        form.columns[opts.columnIndex].groups[opts.groupIndex].controls[opts.controlIndex] = {
            label: this.state.label,
            referenceName: this.state.refName
        };
        this._closeDialog();
        renderEditPage();
    }
    private _closeDialog() {
        this.setState({showDialog: false});
    }
    private _showDialog() {
        this.setState({
            showDialog: true,
            label: this.props.options.control.label,
            refName: this.props.options.control.referenceName});
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
                    <TextField
                        className="group-label"
                        value={this.props.options.group.label}
                        onChanged={newValue => {
                            const opts = this.props.options;
                            form.columns[opts.columnIndex].groups[opts.groupIndex].label = newValue;
                        }}
                    />
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
