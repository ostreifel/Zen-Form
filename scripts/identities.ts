import { getClient } from "TFS/Core/RestClient";
import { WebApiTeam } from "TFS/Core/Contracts";
import * as Q from "q";

const identityMap: {[displayName: string]: void} = {};
let identities: string[] = null;
const onLoaded: ((identities: string[]) => void)[] = [];
let fetchStarted = false;

function cacheAllIdentitiesInTeam(project: { id: string, name: string }, team: WebApiTeam): IPromise<void> {
    identityMap[team.name] = void 0;
    return getClient().getTeamMembers(project.id, team.id).then(members => {
        for(let m of members) {
            const displayName =  m.isContainer ? m.displayName : `${m.displayName} <${m.uniqueName}>`;
            identityMap[displayName] = void 0;
        }
        return void 0;
    });
}

function cacheAllIdentitiesInProject(project: { id: string, name: string }): IPromise<void> {
    return cacheAllIdentitiesInProjectImpl(project, 0);
}
function cacheAllIdentitiesInProjectImpl(project: { id: string, name: string }, skip: number) {
    return getClient().getTeams(project.id, 100, skip).then(teams => {
        const promises = teams.map(t => cacheAllIdentitiesInTeam(project, t));
        if (teams.length === 100) {
            promises.push(cacheAllIdentitiesInProjectImpl(project, skip + 100));
        }
        return Q.all(promises).then(() => void 0);
    });
}
function cacheAllIdentitiesInAllProjects(): IPromise<void> {
    return getClient().getProjects().then(projects =>
        Q.all(projects.map(p => cacheAllIdentitiesInProject(p))).then(
            () => {
                identities = Object.keys(identityMap).sort();
            }
        )
    );
}
export function getIdentities(onResolved: (identities: string[]) => void): void {
    if (identities) {
        onResolved(identities);
    } else if (fetchStarted) {
        onLoaded.push(onResolved);
    } else {
        fetchStarted = true;
        cacheAllIdentitiesInAllProjects().then(() => {
            onResolved(identities);
            for (let callback of onLoaded) {
                callback(identities);
            }
        });
    }
}