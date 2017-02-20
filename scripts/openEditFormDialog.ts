import { IPageForm } from "./pageContracts";
import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";

export function openEditFormDialog(form: IPageForm, onFormChanged: (form: IPageForm) => void) {
    VSS.getService(VSS.ServiceIds.Dialog).then(function (dialogService: IHostDialogService) {
        let getForm = () => {
            console.log("Get form not set");
            return {} as IPageForm;
        };
        function save() {
            const form = getForm();
            console.log("TODO save form here", form);
        }
        const dialogOptions: IHostDialogOptions = {
            title: "Edit page form",
            width: 900,
            height: 800,
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
            dialog.getContributionInstance("edit-form").then((callbacks: IEditFormCallbacks) => {
                getForm = callbacks.getForm;
            });
        });
    });
}