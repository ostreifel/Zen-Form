import {
    WorkItemFormService,
    IWorkItemFormService
} from "TFS/WorkItemTracking/Services";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { Page } from "./page";
import { IPageForm, IFieldValues, IFieldDefinitions } from "./pageContracts";
import { WorkItemType, WorkItemField } from "TFS/WorkItemTracking/Contracts";
import * as Q from "q";

export function create(container: JQuery): IPromise<Page> {
    const projName = VSS.getWebContext().project.name;
    return WorkItemFormService.getService().then(service =>
        service.getFieldValue("System.WorkItemType").then((typeName: string) =>
            getClient().getWorkItemType(projName, typeName).then(wit =>
                service.getFields().then(fields =>
                    createFieldDefinitions(service, fields, wit).then(fieldDefinitions =>
                        new Page(container, service, wit, fieldDefinitions)
                    )
                )
            )
        )
    );
}

/** No way to know if identity field from extension api, just hardcode the system ones */
const knownIdentities: string[] = [
    "System.AuthorizedAs",
    "System.ChangedBy",
    "System.AssignedTo",
    "System.CreatedBy",
    "Microsoft.VSTS.Common.ActivatedBy",
    "Microsoft.VSTS.Common.ResolvedBy",
    "Microsoft.VSTS.Common.ClosedBy",
    "Microsoft.VSTS.CodeReview.AcceptedBy",
    "Microsoft.VSTS.Common.ReviewedBy",
    "Microsoft.VSTS.CMMI.SubjectMatterExpert1",
    "Microsoft.VSTS.CMMI.SubjectMatterExpert2",
    "Microsoft.VSTS.CMMI.SubjectMatterExpert3",
    "Microsoft.VSTS.CMMI.CalledBy",
    "Microsoft.VSTS.CMMI.RequiredAttendee1",
    "Microsoft.VSTS.CMMI.RequiredAttendee2",
    "Microsoft.VSTS.CMMI.RequiredAttendee3",
    "Microsoft.VSTS.CMMI.RequiredAttendee4",
    "Microsoft.VSTS.CMMI.RequiredAttendee5",
    "Microsoft.VSTS.CMMI.RequiredAttendee6",
    "Microsoft.VSTS.CMMI.RequiredAttendee7",
    "Microsoft.VSTS.CMMI.RequiredAttendee8",
    "Microsoft.VSTS.CMMI.OptionalAttendee1",
    "Microsoft.VSTS.CMMI.OptionalAttendee2",
    "Microsoft.VSTS.CMMI.OptionalAttendee3",
    "Microsoft.VSTS.CMMI.OptionalAttendee4",
    "Microsoft.VSTS.CMMI.OptionalAttendee5",
    "Microsoft.VSTS.CMMI.OptionalAttendee6",
    "Microsoft.VSTS.CMMI.OptionalAttendee7",
    "Microsoft.VSTS.CMMI.OptionalAttendee8",
    "Microsoft.VSTS.CMMI.ActualAttendee1",
    "Microsoft.VSTS.CMMI.ActualAttendee2",
    "Microsoft.VSTS.CMMI.ActualAttendee3",
    "Microsoft.VSTS.CMMI.ActualAttendee4",
    "Microsoft.VSTS.CMMI.ActualAttendee5",
    "Microsoft.VSTS.CMMI.ActualAttendee6",
    "Microsoft.VSTS.CMMI.ActualAttendee7",
    "Microsoft.VSTS.CMMI.ActualAttendee8",
];
function isIdentity(referenceName: string) {
    return knownIdentities.indexOf(referenceName) >= 0;
}

function createFieldDefinitions(service: IWorkItemFormService,
                                fields: WorkItemField[],
                                wit: WorkItemType): IPromise<IFieldDefinitions> {
        console.log("fields", fields);
        console.log("wit", wit);
        const fieldTypesDictionary: {[refName: string]: WorkItemField} = {};
        for (let field of fields) {
            fieldTypesDictionary[field.referenceName] = field;
        }
        const allowedValues: {[refName: string]: string[]} = {};

        const allowedValuesPromises = wit.fieldInstances.map(field =>
            service.getAllowedFieldValues(field.referenceName).then(values =>
                allowedValues[field.referenceName] = values.map(v => String(v))
            )
        );
        return Q.all(allowedValuesPromises).then(() => {
            const fieldDefinitions: IFieldDefinitions = {};
            for (let field of wit.fieldInstances) {
                fieldDefinitions[field.referenceName] = {
                    helpText: field.helpText,
                    readonly: fieldTypesDictionary[field.referenceName].readOnly,
                    type: fieldTypesDictionary[field.referenceName].type,
                    name: fieldTypesDictionary[field.referenceName].name,
                    referenceName: fieldTypesDictionary[field.referenceName].referenceName,
                    allowedValues: allowedValues[field.referenceName],
                    isIdentity: isIdentity(field.referenceName)
                };
            }
            console.log("fieldDefinitions", fieldDefinitions);
            return fieldDefinitions;
        });
}