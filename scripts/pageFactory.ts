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
                allowedValues[field.referenceName] = values
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
                    allowedValues: allowedValues[field.referenceName]
                };
            }
            console.log("fieldDefinitions", fieldDefinitions);
            return fieldDefinitions;
        });
}