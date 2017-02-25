import { create } from "./pageFactory";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

// save on ctr + s
$(window).bind("keydown", function (event: JQueryEventObject) {
    if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which) === "S") {
            event.preventDefault();
            WorkItemFormService.getService().then((service) => service.beginSaveWorkItem($.noop, $.noop));
        }
    }
});

// Register context menu action provider
VSS.register(VSS.getContribution().id, create($(".page")));