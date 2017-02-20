import { IEditFormContext, IEditFormCallbacks } from "./editFormContracts";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinition,
    IFieldDefintions
} from "./pageContracts";

console.log("hello in console from editForm.js");
$("#edit-form-wrapper").html("<div>Hello from editForm.ts</div>");

const callbacks: IEditFormCallbacks = {
    getForm: () => {return {description: "form from edit dialog"} as IPageForm;}
};

VSS.register("edit-form", callbacks);
