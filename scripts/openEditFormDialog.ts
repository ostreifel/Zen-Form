import { IPageForm } from "./pageContracts";
import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";
import * as Q from "q";

export function openEditFormDialog(form: IPageForm, onFormChanged: (form: IPageForm) => void) {
    VSS.getService(VSS.ServiceIds.Dialog).then(function (dialogService: IHostDialogService) {
        let getForm = () => {
            console.log("Get form not set");
            return Q({description: "Default form from open dialog"} as IPageForm);
        };
        let externalDialog: IExternalDialog;
        function save() {
            getForm().then(form => {
                onFormChanged(form);
                externalDialog.close();
            });
        }
        const dialogOptions: IHostDialogOptions = {
            title: "Edit page form",
            // Full screen
            width: Number.MAX_VALUE,
            height: Number.MAX_VALUE,
            okText: "Save Form",
            getDialogResult: save,
            resizable: true
        };
        const extInfo = VSS.getExtensionContext();
        const options: IEditFormContext = {
            form
        };

        const contentContribution = `${extInfo.publisherId}.${extInfo.extensionId}.edit-form`;
        dialogService.openDialog(contentContribution, dialogOptions, options).then(dialog => {
            externalDialog = dialog;
            dialog.getContributionInstance("edit-form").then((callbacks: IEditFormCallbacks) => {
                dialog.updateOkButton(true);
                getForm = callbacks.getForm as any;
            });
        });
    });
}