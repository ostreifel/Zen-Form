import { Page } from "./page";

// Register context menu action provider
VSS.register(VSS.getContribution().id, Page.create($(".page")));